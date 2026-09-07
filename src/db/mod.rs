#[allow(dead_code)]
#[derive(Debug, Clone)]
pub struct HazmatEntry {
    pub un_no: String,
    pub psn: String,
    pub haz_class: String,
    pub sub_class: String,
    pub pg: String,
    pub nos: String,
    pub symbols: String,
}

const HAZMAT_CSV: &str = include_str!("../../data/hazmat_table.csv");

fn parse_csv_line(line: &str) -> Vec<String> {
    let mut fields = Vec::new();
    let mut current = String::new();
    let mut in_quotes = false;
    let mut chars = line.chars().peekable();
    while let Some(c) = chars.next() {
        match c {
            '"' if in_quotes && chars.peek() == Some(&'"') => {
                current.push('"');
                chars.next();
            }
            '"' => in_quotes = !in_quotes,
            ',' if !in_quotes => {
                fields.push(std::mem::take(&mut current));
            }
            _ => current.push(c),
        }
    }
    fields.push(current);
    fields
}

pub fn seed_hazmat(conn: &mut rusqlite::Connection) -> rusqlite::Result<()> {
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM hazmat", [], |r| r.get(0))?;
    if count > 0 {
        return Ok(());
    }
    let tx = conn.transaction()?;
    {
        let mut stmt = tx.prepare(
            "INSERT INTO hazmat (un_no, psn, haz_class, sub_class, pg, nos, symbols) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        )?;
        let mut lines = HAZMAT_CSV.lines();
        lines.next();
        for line in lines {
            let fields = parse_csv_line(line);
            if fields.len() < 7 {
                continue;
            }
            stmt.execute(rusqlite::params![
                fields[0], fields[1], fields[2], fields[3], fields[4], fields[5], fields[6]
            ])?;
        }
    }
    tx.commit()
}

pub async fn lookup_hazmat(
    conn: &tokio_rusqlite::Connection,
    un_no: String,
) -> tokio_rusqlite::Result<Vec<HazmatEntry>> {
    conn.call(move |c| {
        let mut stmt = c.prepare(
            "SELECT un_no, psn, haz_class, sub_class, pg, nos, symbols FROM hazmat WHERE un_no = ?1 ORDER BY pg",
        )?;
        let rows = stmt
            .query_map([un_no], |r| {
                Ok(HazmatEntry {
                    un_no: r.get(0)?,
                    psn: r.get(1)?,
                    haz_class: r.get(2)?,
                    sub_class: r.get(3)?,
                    pg: r.get(4)?,
                    nos: r.get(5)?,
                    symbols: r.get(6)?,
                })
            })?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        Ok(rows)
    })
    .await
}
