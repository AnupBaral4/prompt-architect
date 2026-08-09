-- Persist auto-discovery info so the server-rendered permalink page can show
-- "you submitted your homepage, we scanned this product page instead" too,
-- not just the live in-browser result right after scanning.

alter table scans add column if not exists auto_discovered_from text;
