// Our schema contains only DDL with no semicolons in string literals.
// Strip full-line comments before splitting; this is not a general SQL parser.
export function schemaStatements(sql){return sql.split('\n').filter(line=>!line.trimStart().startsWith('--')).join('\n').split(';').map(statement=>statement.trim()).filter(Boolean)}
