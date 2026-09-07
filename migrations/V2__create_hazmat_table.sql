CREATE TABLE IF NOT EXISTS hazmat (
    id INTEGER PRIMARY KEY,
    un_no TEXT NOT NULL,
    psn TEXT NOT NULL,
    haz_class TEXT NOT NULL,
    sub_class TEXT NOT NULL,
    pg TEXT NOT NULL,
    nos TEXT NOT NULL,
    symbols TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_hazmat_un_no ON hazmat (un_no);
