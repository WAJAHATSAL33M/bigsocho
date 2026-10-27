CREATE TABLE IF NOT EXISTS canvas_documents (
 name VARCHAR(32) PRIMARY KEY,
 payload LONGTEXT NOT NULL,
 revision BIGINT UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS canvas_media (
 id CHAR(36) PRIMARY KEY,
 name VARCHAR(160) NOT NULL,
 mime VARCHAR(32) NOT NULL,
 bytes MEDIUMBLOB NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS canvas_login_limits (
 identifier CHAR(64) PRIMARY KEY,
 attempts INT UNSIGNED NOT NULL DEFAULT 0,
 expires_at BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS canvas_audit (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 action VARCHAR(40) NOT NULL,
 target VARCHAR(160) NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS canvas_sessions (
 id CHAR(64) PRIMARY KEY,
 expires_at BIGINT NOT NULL,
 last_seen BIGINT NOT NULL,
 INDEX canvas_session_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS canvas_rate_limits (
 identifier CHAR(64) PRIMARY KEY,
 attempts INT UNSIGNED NOT NULL DEFAULT 0,
 expires_at BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Additive analytics migration; no existing posts, media or sessions are changed.
CREATE TABLE IF NOT EXISTS canvas_pageviews (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 event_id CHAR(36) NOT NULL,
 visitor_hash CHAR(64) NOT NULL,
 visit_hash CHAR(64) NOT NULL,
 path VARCHAR(180) NOT NULL,
 post_slug VARCHAR(100) NULL,
 device VARCHAR(12) NOT NULL,
 source VARCHAR(253) NOT NULL,
 created_at DATETIME NOT NULL,
 UNIQUE KEY canvas_event_dedupe (event_id),
 INDEX canvas_analytics_date (created_at),
 INDEX canvas_analytics_article (post_slug,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS canvas_analytics_limits (
 identifier CHAR(64) PRIMARY KEY,
 attempts INT UNSIGNED NOT NULL DEFAULT 0,
 expires_at BIGINT NOT NULL,
 INDEX canvas_analytics_limit_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
