use lopdf::{Document, Object};

const BOL_TEMPLATE: &[u8] = include_bytes!("../assets/pdf/AVRT_BOL.pdf");

const MAX_LINES: usize = 11;

#[derive(Debug, Default, Clone)]
pub struct HazEntry {
    pub un: String,
    pub pkg: String,
    pub haz: String,
    pub sub: String,
    pub desc: String,
    pub nos: bool,
    pub tech: String,
}

#[derive(Debug, Default, Clone)]
pub struct PrintLine {
    pub pieces: String,
    pub hm: bool,
    pub desc: String,
    pub len: String,
    pub wid: String,
    pub hgt: String,
    pub nmfc: String,
    pub class: String,
    pub wgt: String,
    /// Whether this line counts toward the BOL totals (nested container
    /// items and count-less continuation lines do not).
    pub count: bool,
}

#[derive(Debug, Default)]
pub struct BolData {
    pub shipper_name: String,
    pub shipper_addr1: String,
    pub shipper_addr2: String,
    pub shipper_city: String,
    pub shipper_state: String,
    pub shipper_zip: String,
    pub consignee_name: String,
    pub consignee_addr1: String,
    pub consignee_addr2: String,
    pub consignee_city: String,
    pub consignee_state: String,
    pub consignee_zip: String,
    pub consignee_phone: String,
    pub billto_name: String,
    pub billto_addr1: String,
    pub billto_addr2: String,
    pub billto_city: String,
    pub billto_state: String,
    pub billto_zip: String,
    pub prepaid: bool,
    pub guaranteed_noon: bool,
    pub guaranteed_5pm: bool,
    pub shipper_ref: String,
    pub consignee_po: String,
    pub total_pieces: String,
    pub total_weight: String,
    pub comments: String,
    pub lines: Vec<PrintLine>,
}

fn get(fields: &std::collections::HashMap<String, Vec<String>>, key: &str) -> String {
    fields
        .get(key)
        .and_then(|v| v.first())
        .cloned()
        .unwrap_or_default()
}

fn get_all(fields: &std::collections::HashMap<String, Vec<String>>, key: &str) -> Vec<String> {
    fields.get(key).cloned().unwrap_or_default()
}

fn basic_description(e: &HazEntry) -> String {
    let mut s = format!("{}, {}", e.un, e.desc);
    if e.nos && !e.tech.trim().is_empty() {
        s.push_str(&format!(" ({})", e.tech.trim()));
    }
    s.push_str(&format!(", {}", e.haz));
    if !e.sub.trim().is_empty() {
        s.push_str(&format!("({})", e.sub.trim()));
    }
    if !e.pkg.trim().is_empty() {
        s.push_str(&format!(", PG {}", e.pkg.trim()));
    }
    s
}

fn norm_un(raw: &str) -> String {
    let trimmed = raw.trim();
    if trimmed.len() == 4 && trimmed.chars().all(|c| c.is_ascii_digit()) {
        format!("UN{trimmed}")
    } else {
        trimmed.to_owned()
    }
}

fn extra_entry(x: &serde_json::Value) -> Option<HazEntry> {
    let v = x;
    Some(HazEntry {
        un: v.get("un")?.as_str().unwrap_or_default().to_owned(),
        pkg: v.get("pkg")?.as_str().unwrap_or_default().to_owned(),
        haz: v.get("haz")?.as_str().unwrap_or_default().to_owned(),
        sub: v.get("sub")?.as_str().unwrap_or_default().to_owned(),
        desc: v.get("desc")?.as_str().unwrap_or_default().to_owned(),
        nos: v.get("nos")?.as_bool().unwrap_or(false),
        tech: v.get("tech")?.as_str().unwrap_or_default().to_owned(),
    })
}

pub fn build_bol(pairs: &[(String, String)]) -> BolData {
    let mut fields: std::collections::HashMap<String, Vec<String>> =
        std::collections::HashMap::new();
    for (k, v) in pairs {
        fields.entry(k.clone()).or_default().push(v.clone());
    }

    let lunits = get_all(&fields, "lunits");
    let ldescs = get_all(&fields, "ldesc");
    let lnmfcs = get_all(&fields, "lnmfc");
    let lnmfcsubs = get_all(&fields, "lnmfcsub");
    let lclasses = get_all(&fields, "lclass");
    let lwgts = get_all(&fields, "lwgt");
    let llens = get_all(&fields, "llen");
    let lwids = get_all(&fields, "lwid");
    let lhgt = get_all(&fields, "lhgt");
    let lhazflags = get_all(&fields, "lhazflag");
    let un_nums = get_all(&fields, "unNum");
    let pkg_classes = get_all(&fields, "pkgClass");
    let haz_classes = get_all(&fields, "hazClass");
    let haz_subs = get_all(&fields, "hazSubClass");
    let haz_descs = get_all(&fields, "hazDesc");
    let is_nos = get_all(&fields, "isNos");
    let nos_descs = get_all(&fields, "nosDesc");

    let at = |v: &[String], i: usize| v.get(i).cloned().unwrap_or_default();

    let extra_uns: std::collections::HashMap<String, Vec<HazEntry>> = fields
        .get("extra_uns_json")
        .and_then(|v| v.first())
        .and_then(|s| {
            serde_json::from_str::<std::collections::HashMap<String, Vec<serde_json::Value>>>(s)
                .ok()
        })
        .map(|m| {
            m.into_iter()
                .map(|(k, vs)| (k, vs.iter().filter_map(extra_entry).collect()))
                .collect()
        })
        .unwrap_or_default();

    // Groups of lines: each flat item or container stays together for
    // hazmat-first ordering (49 CFR: hazardous materials listed first).
    let member_lines: std::collections::HashSet<usize> = fields
        .get("containers_json")
        .and_then(|v| v.first())
        .and_then(|s| serde_json::from_str::<Vec<serde_json::Value>>(s).ok())
        .map(|cs| {
            cs.iter()
                .filter_map(|c| c.get("items")?.as_array())
                .flat_map(|items| items.iter())
                .filter_map(|item| item.get("line")?.as_u64())
                .map(|n| n as usize)
                .collect()
        })
        .unwrap_or_default();

    // Groups of lines, ordered for print as:
    //   1. loose hazmat lines,
    //   2. containers (hazmat pallets before non-hazmat pallets),
    //   3. loose non-hazmat lines.
    // Within a pallet, hazmat items print before non-hazmat items.
    // (tier, hazmat-first, lines)
    let mut groups: Vec<(u8, bool, Vec<PrintLine>)> = Vec::new();

    let flat_line =
        |i: usize, pieces: String, desc: String, wgt: String, count: bool| -> Vec<PrintLine> {
            let haz = at(&lhazflags, i).trim() == "Y";
            let mut desc = desc;
            if haz {
                let tech = at(&nos_descs, i);
                let primary = HazEntry {
                    un: norm_un(&at(&un_nums, i)),
                    pkg: at(&pkg_classes, i),
                    haz: at(&haz_classes, i),
                    sub: at(&haz_subs, i),
                    desc: at(&haz_descs, i),
                    nos: at(&is_nos, i).trim() == "true",
                    tech,
                };
                if !desc.trim().is_empty() {
                    desc.push_str(" — ");
                }
                desc.push_str(&basic_description(&primary));
            }
            let nmfc = {
                let base = at(&lnmfcs, i);
                let sub = at(&lnmfcsubs, i);
                if sub.trim().is_empty() {
                    base
                } else {
                    format!("{}-{}", base.trim(), sub.trim())
                }
            };
            let mut group = vec![PrintLine {
                pieces,
                hm: haz,
                desc,
                len: at(&llens, i),
                wid: at(&lwids, i),
                hgt: at(&lhgt, i),
                nmfc,
                class: at(&lclasses, i),
                wgt,
                count,
            }];
            if haz && let Some(extras) = extra_uns.get(&i.to_string()) {
                for e in extras {
                    group.push(PrintLine {
                        hm: true,
                        desc: basic_description(e),
                        count: false,
                        ..Default::default()
                    });
                }
            }
            group
        };

    let n = lunits.len().max(ldescs.len()).max(lwgts.len());
    for i in 0..n {
        if member_lines.contains(&i) {
            continue;
        }
        let pieces = at(&lunits, i);
        let desc = at(&ldescs, i);
        let wgt = at(&lwgts, i);
        if pieces.trim().is_empty() && desc.trim().is_empty() && wgt.trim().is_empty() {
            continue;
        }
        let tier = if at(&lhazflags, i).trim() == "Y" {
            0
        } else {
            2
        };
        groups.push((tier, tier == 0, flat_line(i, pieces, desc, wgt, true)));
    }

    if let Some(containers) = fields
        .get("containers_json")
        .and_then(|v| v.first())
        .and_then(|s| serde_json::from_str::<Vec<serde_json::Value>>(s).ok())
    {
        for c in containers {
            let ctype = c.get("type").and_then(|v| v.as_str()).unwrap_or("SK");
            let type_label = match ctype {
                "CR" => "CRATE",
                "BX" => "BOX",
                "DR" => "DRUM",
                _ => "PALLET",
            };
            let str_field = |k: &str| {
                c.get(k)
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .trim()
                    .to_owned()
            };
            let dims = [str_field("len"), str_field("wid"), str_field("hgt")];
            let dims_txt = dims
                .iter()
                .filter(|d| !d.is_empty())
                .cloned()
                .collect::<Vec<_>>()
                .join("x");
            let mut header = type_label.to_owned();
            if !dims_txt.is_empty() {
                header.push_str(&format!(" {dims_txt}"));
            }
            let cdesc = str_field("desc");
            if !cdesc.is_empty() {
                header.push_str(&format!(" — {cdesc}"));
            }
            let mut group = vec![PrintLine {
                pieces: str_field("pieces"),
                desc: header,
                len: dims[0].clone(),
                wid: dims[1].clone(),
                hgt: dims[2].clone(),
                wgt: str_field("wgt"),
                count: true,
                ..Default::default()
            }];
            let mut members: Vec<(bool, Vec<PrintLine>)> = Vec::new();
            if let Some(items) = c.get("items").and_then(|v| v.as_array()) {
                for item in items {
                    let pos = item
                        .get("line")
                        .and_then(|v| v.as_u64())
                        .unwrap_or(usize::MAX as u64) as usize;
                    if pos >= n {
                        continue;
                    }
                    let pieces = at(&lunits, pos);
                    let mut desc = at(&ldescs, pos);
                    let haz = at(&lhazflags, pos).trim() == "Y";
                    let uns: Vec<HazEntry> = item
                        .get("uns")
                        .and_then(|v| v.as_array())
                        .map(|a| a.iter().filter_map(extra_entry).collect())
                        .unwrap_or_default();
                    if pieces.trim().is_empty() && desc.trim().is_empty() && !haz && uns.is_empty()
                    {
                        continue;
                    }
                    if haz {
                        let tech = at(&nos_descs, pos);
                        let primary = HazEntry {
                            un: norm_un(&at(&un_nums, pos)),
                            pkg: at(&pkg_classes, pos),
                            haz: at(&haz_classes, pos),
                            sub: at(&haz_subs, pos),
                            desc: at(&haz_descs, pos),
                            nos: at(&is_nos, pos).trim() == "true",
                            tech,
                        };
                        if !desc.trim().is_empty() {
                            desc.push_str(" — ");
                        }
                        desc.push_str(&basic_description(&primary));
                    }
                    let nmfc = {
                        let base = at(&lnmfcs, pos);
                        let sub = at(&lnmfcsubs, pos);
                        if sub.trim().is_empty() {
                            base
                        } else {
                            format!("{}-{}", base.trim(), sub.trim())
                        }
                    };
                    let mut member = vec![PrintLine {
                        // Nested lines never carry quantities: the container
                        // header counts the pallet and loose lines count
                        // themselves. These lines are accounting detail.
                        pieces: String::new(),
                        hm: haz || !uns.is_empty(),
                        desc,
                        len: at(&llens, pos),
                        wid: at(&lwids, pos),
                        hgt: at(&lhgt, pos),
                        nmfc,
                        class: at(&lclasses, pos),
                        wgt: String::new(),
                        count: false,
                    }];
                    for e in &uns {
                        member.push(PrintLine {
                            hm: true,
                            desc: basic_description(e),
                            count: false,
                            ..Default::default()
                        });
                    }
                    members.push((haz || !uns.is_empty(), member));
                }
            }
            members.sort_by_key(|(hm, _)| !hm);
            for (numbering, (_, member)) in members.into_iter().enumerate() {
                let mut member = member;
                if let Some(head) = member.first_mut() {
                    head.desc = format!("{}. {}", numbering + 1, head.desc);
                }
                group.extend(member);
            }
            let header_empty = group.len() == 1
                && group[0].pieces.trim().is_empty()
                && group[0].wgt.trim().is_empty()
                && str_field("desc").is_empty()
                && dims.iter().all(|d| d.is_empty());
            if !header_empty || group.len() > 1 {
                let has_hm = group.iter().any(|l| l.hm);
                groups.push((1, has_hm, group));
            }
        }
    }

    groups.sort_by_key(|(tier, has_hm, _)| (*tier, !*has_hm));

    let mut lines: Vec<PrintLine> = groups
        .into_iter()
        .flat_map(|(_, _, g)| g)
        .take(MAX_LINES)
        .collect();
    for line in &mut lines {
        for field in [
            &mut line.pieces,
            &mut line.desc,
            &mut line.len,
            &mut line.wid,
            &mut line.hgt,
            &mut line.nmfc,
            &mut line.class,
            &mut line.wgt,
        ] {
            *field = truncate(field, 60);
        }
        line.desc = truncate(&line.desc, 90);
    }

    let total_pieces: i64 = lines
        .iter()
        .filter(|l| l.count)
        .filter_map(|l| l.pieces.trim().parse::<i64>().ok())
        .sum();
    let total_weight: f64 = lines
        .iter()
        .filter(|l| l.count)
        .filter_map(|l| l.wgt.trim().parse::<f64>().ok())
        .sum();

    let accessorials: Vec<String> = fields
        .get("asseccorials")
        .cloned()
        .unwrap_or_default()
        .into_iter()
        .filter(|v| !v.trim().is_empty())
        .collect();

    let consignee_phone = [
        get(&fields, "consigneePhoneArea"),
        get(&fields, "consigneePhoneFirst"),
        get(&fields, "consigneePhoneLast"),
    ]
    .into_iter()
    .filter(|v| !v.trim().is_empty())
    .collect::<Vec<_>>()
    .join("-");

    let mut comments = get(&fields, "inf");
    if !accessorials.is_empty() {
        if !comments.is_empty() {
            comments.push('\n');
        }
        comments.push_str(&format!("Accessorials: {}", accessorials.join(", ")));
    }

    BolData {
        shipper_name: get(&fields, "SN"),
        shipper_addr1: get(&fields, "SA1"),
        shipper_addr2: get(&fields, "SA2"),
        shipper_city: get(&fields, "SC"),
        shipper_state: get(&fields, "SS"),
        shipper_zip: get(&fields, "SZ"),
        consignee_name: get(&fields, "CN"),
        consignee_addr1: get(&fields, "CA1"),
        consignee_addr2: get(&fields, "CA2"),
        consignee_city: get(&fields, "CC"),
        consignee_state: get(&fields, "CS"),
        consignee_zip: get(&fields, "CZ"),
        consignee_phone,
        billto_name: get(&fields, "BN"),
        billto_addr1: get(&fields, "BA1"),
        billto_addr2: get(&fields, "BA2"),
        billto_city: get(&fields, "BC"),
        billto_state: get(&fields, "BS"),
        billto_zip: get(&fields, "BZ"),
        prepaid: get(&fields, "chrg").trim() != "C",
        guaranteed_noon: get(&fields, "guaranteeDeliveryBy").trim() == "byNoon",
        guaranteed_5pm: get(&fields, "guaranteeDeliveryBy").trim() == "by5",
        shipper_ref: get(&fields, "BOL"),
        consignee_po: get(&fields, "PON"),
        total_pieces: if total_pieces > 0 {
            total_pieces.to_string()
        } else {
            String::new()
        },
        total_weight: if total_weight > 0.0 {
            format!("{total_weight}")
        } else {
            String::new()
        },
        comments,
        lines,
    }
}

fn truncate(s: &str, max: usize) -> String {
    if s.len() <= max {
        return s.to_owned();
    }
    let mut end = max;
    while !s.is_char_boundary(end) {
        end -= 1;
    }
    s[..end].to_owned()
}

fn sanitize(s: &str) -> Vec<u8> {
    s.chars()
        .map(|c| {
            if c == '—' {
                '-'
            } else if (c as u32) < 128 {
                c
            } else {
                '?'
            }
        })
        .collect::<String>()
        .into_bytes()
}

type TextField = (&'static str, fn(&BolData) -> String);

struct LineFields {
    row: usize,
    pieces: &'static str,
    hm: &'static str,
    desc: &'static str,
    nmfc: &'static str,
    class: &'static str,
    wgt: &'static str,
    len: Option<&'static str>,
    wid: Option<&'static str>,
    hgt: Option<&'static str>,
}

fn text_fields() -> Vec<TextField> {
    vec![
        ("Text1", |d: &BolData| d.shipper_name.clone()),
        ("Text2", |d: &BolData| d.shipper_addr1.clone()),
        ("Text3", |d: &BolData| d.shipper_addr2.clone()),
        ("Text4", |d: &BolData| d.shipper_city.clone()),
        ("Text5", |d: &BolData| d.shipper_state.clone()),
        ("Text6", |d: &BolData| d.shipper_zip.clone()),
        ("Text8", |d: &BolData| d.consignee_name.clone()),
        ("Text9", |d: &BolData| d.consignee_addr1.clone()),
        ("Text10", |d: &BolData| d.consignee_addr2.clone()),
        ("Text11", |d: &BolData| d.consignee_city.clone()),
        ("Text12", |d: &BolData| d.consignee_state.clone()),
        ("Text13", |d: &BolData| d.consignee_zip.clone()),
        ("Text14", |d: &BolData| d.consignee_phone.clone()),
        ("Text16", |d: &BolData| d.billto_name.clone()),
        ("Text17", |d: &BolData| d.billto_addr1.clone()),
        ("Text18", |d: &BolData| d.billto_addr2.clone()),
        ("Text19", |d: &BolData| d.billto_city.clone()),
        ("Text20", |d: &BolData| d.billto_state.clone()),
        ("Text21", |d: &BolData| d.billto_zip.clone()),
        ("Text26", |d: &BolData| d.shipper_ref.clone()),
        ("Text27", |d: &BolData| d.consignee_po.clone()),
        ("Text91", |d: &BolData| d.total_pieces.clone()),
        ("Text92", |d: &BolData| d.comments.clone()),
        ("Total Weight", |d: &BolData| d.total_weight.clone()),
        ("Text97", |d: &BolData| d.shipper_name.clone()),
    ]
}

fn line_field_names() -> Vec<LineFields> {
    // Len/Wid/Hgt are None where the PDF widget is unnamed (filled by rect).
    vec![
        LineFields {
            row: 0,
            pieces: "Text37",
            hm: "Check Box38",
            desc: "Description Line 1",
            nmfc: "Text40",
            class: "Text41",
            wgt: "Text42",
            len: None,
            wid: None,
            hgt: None,
        },
        LineFields {
            row: 1,
            pieces: "Text43",
            hm: "Check Box44",
            desc: "Description Line 2",
            nmfc: "Text46",
            class: "Text47",
            wgt: "Text48",
            len: None,
            wid: None,
            hgt: Some("Height Line 2"),
        },
        LineFields {
            row: 2,
            pieces: "Text49",
            hm: "Check Box50",
            desc: "Description Line 3",
            nmfc: "Text52",
            class: "Text53",
            wgt: "Text54",
            len: Some("Length Line 3"),
            wid: Some("Width Line 3"),
            hgt: Some("Height Line 3"),
        },
        LineFields {
            row: 3,
            pieces: "Text55",
            hm: "Check Box56",
            desc: "Description Line 4",
            nmfc: "Text58",
            class: "Text59",
            wgt: "Text60",
            len: None,
            wid: Some("Width Line 4"),
            hgt: Some("Height Line 4"),
        },
        LineFields {
            row: 4,
            pieces: "Text61",
            hm: "Check Box62",
            desc: "Description Line 5",
            nmfc: "Text64",
            class: "Text65",
            wgt: "Text66",
            len: Some("Length Line 5"),
            wid: Some("Width Line 5"),
            hgt: Some("Height Line 5"),
        },
        LineFields {
            row: 5,
            pieces: "Text67",
            hm: "Check Box68",
            desc: "Description Line 6",
            nmfc: "Text70",
            class: "Text71",
            wgt: "Text72",
            len: Some("Length Line 6"),
            wid: Some("Width Line 6"),
            hgt: Some("Height Line 6"),
        },
        LineFields {
            row: 6,
            pieces: "Text73",
            hm: "Check Box74",
            desc: "Description Line 7",
            nmfc: "Text76",
            class: "Text77",
            wgt: "Text78",
            len: Some("Length Line 7"),
            wid: Some("Width Line 7"),
            hgt: Some("Height Line 7"),
        },
        LineFields {
            row: 7,
            pieces: "Text79",
            hm: "Check Box80",
            desc: "Description Line 8",
            nmfc: "Text82",
            class: "Text83",
            wgt: "Text84",
            len: Some("Length Line 8"),
            wid: Some("Width Line 8"),
            hgt: Some("Height Line 8"),
        },
        LineFields {
            row: 8,
            pieces: "Text85",
            hm: "Check Box86",
            desc: "Description Line 9",
            nmfc: "Text88",
            class: "Text89",
            wgt: "Text90",
            len: Some("Length Line 9"),
            wid: Some("Width Line 9"),
            hgt: Some("Height Line 9"),
        },
        LineFields {
            row: 9,
            pieces: "Text120",
            hm: "Check Box120",
            desc: "Description Line 10",
            nmfc: "Text125",
            class: "Text127",
            wgt: "Text129",
            len: Some("Length Line 10"),
            wid: Some("Width Line 10"),
            hgt: Some("Height Line 10"),
        },
        LineFields {
            row: 10,
            pieces: "Text121",
            hm: "Check Box121",
            desc: "Description Line 11",
            nmfc: "Text126",
            class: "Text128",
            wgt: "Text130",
            len: Some("Length Line 11"),
            wid: Some("Width Line 11"),
            hgt: Some("Height Line 13"),
        },
    ]
}

fn dim_rects() -> Vec<(f32, f32, f32, f32)> {
    // (x0, x1, y_center) bands for Length / Width / Height columns per row
    let rows = [
        369.1, 351.8, 333.2, 315.0, 297.2, 279.7, 262.0, 244.3, 226.7, 209.1, 190.9,
    ];
    let mut out = Vec::new();
    for y in rows {
        out.push((318.0, 357.0, y - 7.0, y + 7.0));
    }
    out
}

pub fn render_pdf(data: &BolData) -> Result<Vec<u8>, String> {
    let mut doc = Document::load_mem(BOL_TEMPLATE).map_err(|e| e.to_string())?;

    let text_map = text_fields();
    let line_names = line_field_names();
    let mut line_values: std::collections::HashMap<String, (String, bool)> =
        std::collections::HashMap::new();
    for f in &line_names {
        if let Some(line) = data.lines.get(f.row) {
            line_values.insert(f.pieces.to_string(), (line.pieces.clone(), false));
            line_values.insert(f.hm.to_string(), (String::new(), line.hm));
            line_values.insert(f.desc.to_string(), (line.desc.clone(), false));
            line_values.insert(f.nmfc.to_string(), (line.nmfc.clone(), false));
            line_values.insert(f.class.to_string(), (line.class.clone(), false));
            line_values.insert(f.wgt.to_string(), (line.wgt.clone(), false));
            if let Some(name) = f.len {
                line_values.insert(name.to_string(), (line.len.clone(), false));
            }
            if let Some(name) = f.wid {
                line_values.insert(name.to_string(), (line.wid.clone(), false));
            }
            if let Some(name) = f.hgt {
                line_values.insert(name.to_string(), (line.hgt.clone(), false));
            }
        }
    }

    let pages = doc.get_pages();
    let mut dim_targets: Vec<(lopdf::ObjectId, usize, usize)> = Vec::new();
    // collect unnamed dim widgets: (object id, row, col 0=len 1=wid 2=hgt)
    for page_id in pages.values() {
        let annots_obj = doc
            .get_object(*page_id)
            .and_then(|o| o.as_dict())
            .and_then(|d| d.get(b"Annots"));
        let annots: Vec<Object> = match annots_obj {
            Ok(Object::Reference(id)) => doc
                .get_object(*id)
                .and_then(|o| o.as_array())
                .cloned()
                .unwrap_or_default(),
            Ok(o) => o.as_array().cloned().unwrap_or_default(),
            Err(_) => Vec::new(),
        };
        for a in annots {
            let oid = match a {
                Object::Reference(id) => id,
                _ => continue,
            };
            let (name, ftype, rect) = {
                let obj = doc.get_object(oid).map_err(|e| e.to_string())?;
                let d = obj.as_dict().map_err(|e| e.to_string())?;
                let name = d
                    .get(b"T")
                    .ok()
                    .and_then(|o| o.as_str().ok())
                    .map(|b| String::from_utf8_lossy(b).into_owned());
                let ftype = d
                    .get(b"FT")
                    .ok()
                    .and_then(|o| o.as_name().ok())
                    .map(|b| b.to_vec());
                let rect: Option<[f32; 4]> = d
                    .get(b"Rect")
                    .ok()
                    .and_then(|o| o.as_array().ok())
                    .and_then(|a| {
                        let v: Option<Vec<f32>> = a.iter().map(|o| o.as_float().ok()).collect();
                        let v = v?;
                        if v.len() == 4 {
                            Some([v[0], v[1], v[2], v[3]])
                        } else {
                            None
                        }
                    });
                (name, ftype, rect)
            };
            if name.is_none() {
                // Unnamed widgets (the PDF's first-row dims carry no
                // field name or type): match by rect into dim columns.
                if let Some(r) = rect {
                    let cx = (r[0] + r[2]) / 2.0;
                    let cy = (r[1] + r[3]) / 2.0;
                    let col = if (318.0..357.0).contains(&cx) {
                        Some(0)
                    } else if (358.0..397.0).contains(&cx) {
                        Some(1)
                    } else if (398.0..436.0).contains(&cx) {
                        Some(2)
                    } else {
                        None
                    };
                    if let Some(col) = col {
                        let bands = dim_rects();
                        for (row, b) in bands.iter().enumerate() {
                            if cy > b.2 && cy < b.3 && row < data.lines.len() {
                                dim_targets.push((oid, row, col));
                                break;
                            }
                        }
                    }
                }
            } else if ftype.as_deref() == Some(b"Tx".as_slice()) {
                if let Some(n) = name {
                    if let Some(text_fn) = text_map.iter().find(|(k, _)| *k == n.as_str()) {
                        let value = text_fn.1(data);
                        set_text(&mut doc, oid, &value)?;
                    } else if let Some((v, _)) = line_values.get(&n) {
                        set_text(&mut doc, oid, v)?;
                    }
                }
            } else if ftype.as_deref() == Some(b"Btn".as_slice())
                && let Some(n) = name
            {
                let on = n == "Check Box23" && data.prepaid
                    || n == "Check Box24" && !data.prepaid
                    || n == "Guaranteed Noon Checkbox" && data.guaranteed_noon
                    || n == "Guaranteed Five Checkbox" && data.guaranteed_5pm
                    || line_values.get(&n).is_some_and(|(_, hm)| *hm);
                set_checkbox(&mut doc, oid, on)?;
            }
        }
    }

    for (oid, row, col) in dim_targets {
        let line = &data.lines[row];
        let value = match col {
            0 => &line.len,
            1 => &line.wid,
            _ => &line.hgt,
        };
        set_text(&mut doc, oid, value)?;
    }

    // Ensure viewers render filled values.
    let root = doc
        .trailer
        .get(b"Root")
        .and_then(|o| o.as_reference())
        .map_err(|e| e.to_string())?;
    let acro_id = doc
        .get_object(root)
        .and_then(|o| o.as_dict())
        .and_then(|d| d.get(b"AcroForm"))
        .and_then(|o| o.as_reference())
        .map_err(|e| e.to_string())?;
    {
        let acro = doc
            .get_object_mut(acro_id)
            .map_err(|e| e.to_string())?
            .as_dict_mut()
            .map_err(|e| e.to_string())?;
        acro.set("NeedAppearances", Object::Boolean(true));
    }

    let mut out = Vec::new();
    doc.save_to(&mut out).map_err(|e| e.to_string())?;
    Ok(out)
}

fn set_text(doc: &mut Document, oid: lopdf::ObjectId, value: &str) -> Result<(), String> {
    let obj = doc
        .get_object_mut(oid)
        .map_err(|e| e.to_string())?
        .as_dict_mut()
        .map_err(|e| e.to_string())?;
    obj.set("V", Object::string_literal(sanitize(value)));
    Ok(())
}

fn set_checkbox(doc: &mut Document, oid: lopdf::ObjectId, on: bool) -> Result<(), String> {
    let obj = doc
        .get_object_mut(oid)
        .map_err(|e| e.to_string())?
        .as_dict_mut()
        .map_err(|e| e.to_string())?;
    if on {
        obj.set("V", Object::Name(b"Yes".to_vec()));
        obj.set("AS", Object::Name(b"Yes".to_vec()));
    } else {
        obj.set("V", Object::Name(b"Off".to_vec()));
        obj.set("AS", Object::Name(b"Off".to_vec()));
    }
    Ok(())
}
