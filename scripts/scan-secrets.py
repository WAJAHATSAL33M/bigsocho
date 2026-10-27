"""Redacted heuristic scan of the worktree and every reachable Git blob.
Does not verify tokens with providers or rewrite history. Findings need review.
"""
import subprocess,re,json,hashlib
from pathlib import Path
rules={
 'private-key':r'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----',
 'github-token':r'\b(?:gh[pousr]_[A-Za-z0-9]{30,255}|github_pat_[A-Za-z0-9_]{40,255})\b',
 'openai-key':r'\bsk-(?:proj-|svcacct-)[A-Za-z0-9_-]{20,}\b',
 'anthropic-key':r'\bsk-ant-[A-Za-z0-9_-]{20,}\b',
 'aws-access-key':r'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b',
 'google-api-key':r'\bAIza[0-9A-Za-z_-]{35}\b',
 'slack-token':r'\bxox[baprs]-[A-Za-z0-9-]{20,}\b',
 'stripe-live-secret':r'\bsk_live_[A-Za-z0-9]{20,}\b',
 'credential-url':r'(?:mysql|postgres(?:ql)?|mongodb(?:\+srv)?):\/\/[^\s:/]+:[^\s@]+@',
}
assignment=re.compile(r'''(?i)(?:DB_PASSWORD|ADMIN_PASSWORD|SESSION_SECRET|GITHUB_TOKEN|API_KEY|SECRET_KEY|password|apiKey|secret|token)[ \t]*["']?[ \t]*[:=][ \t]*["']([^"'\n]{8,})["']''')
env_assignment=re.compile(r'(?im)^(?:DB_PASSWORD|ADMIN_PASSWORD|SESSION_SECRET|GITHUB_TOKEN|API_KEY|SECRET_KEY)[ \t]*=[ \t]*([^\s#\r\n]{8,})')
findings=[];review=[];blobs=0;skipped=0

def scan(data,location):
 global blobs
 text=data.decode('utf8',errors='ignore');blobs+=1
 for label,rule in rules.items():
  for match in re.finditer(rule,text):
   findings.append({'rule':label,'location':location,'line':text.count('\n',0,match.start())+1,'fingerprint':hashlib.sha256(match.group().encode()).hexdigest()[:12]})
 for match in [*assignment.finditer(text),*env_assignment.finditer(text)]:
  value=match.group(1)
  if any(x in value.lower() for x in ['test-','example','placeholder','your-','randombytes','process.env','scrypt$','secret-only','123456']):continue
  if re.search(r'[a-zA-Z]',value) and re.search(r'[0-9]',value):review.append({'rule':'credential-assignment-review','location':location,'line':text.count('\n',0,match.start())+1})
objects=subprocess.check_output(['git','rev-list','--objects','--all']).decode().splitlines()
for line in objects:
 oid,_,path=line.partition(' ')
 if not path:continue
 kind=subprocess.check_output(['git','cat-file','-t',oid]).decode().strip()
 if kind!='blob':continue
 data=subprocess.check_output(['git','cat-file','blob',oid]);scan(data,'git:'+oid[:12]+':'+path)
paths=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z']).decode().split('\0')
for path in paths:
 p=Path(path)
 if path and p.is_file():scan(p.read_bytes(),'worktree:'+path)
report={'scope':'reachable Git objects from fetched refs plus non-ignored worktree files','commits':int(subprocess.check_output(['git','rev-list','--all','--count'])),'blobs_and_files_scanned':blobs,'high_confidence_findings':findings,'manual_review_candidates':review,'limitations':'Heuristic patterns can miss secrets. Unfetched/deleted refs, forks, GitHub logs, chat, Hostinger and ignored local files are not covered. Values are never printed.'}
print(json.dumps(report,indent=2))
raise SystemExit(1 if findings else 0)
