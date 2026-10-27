-- Additive security migration; leaves articles and images untouched.
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
