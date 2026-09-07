use askama::Template;
use askama_web::WebTemplate;
use axum::response::IntoResponse;
use axum::routing::{get, post};
use rust_embed::RustEmbed;
use std::collections::HashMap;
use tokio_rusqlite::Connection;
use tower_http::compression::CompressionLayer;

mod bol;
mod db;

#[cfg(not(debug_assertions))]
const VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg(debug_assertions)]
const VERSION: &str = "dev";

#[derive(RustEmbed, Clone)]
#[folder = "assets/"]
struct Assets;

#[derive(RustEmbed, Clone)]
#[folder = "assets/img/"]
struct ImgAssets;

#[derive(RustEmbed, Clone)]
#[folder = "assets/js/vendor/"]
struct JsVendorAssets;

mod embedded {
    use refinery::embed_migrations;
    embed_migrations!("migrations");
}

#[tokio::main]
async fn main() {
    let mut migrations_conn = rusqlite::Connection::open("./db.sqlite").unwrap();
    embedded::migrations::runner()
        .run(&mut migrations_conn)
        .unwrap();
    db::seed_hazmat(&mut migrations_conn).unwrap();

    let compression_layer = CompressionLayer::new().gzip(true);

    let app = axum::Router::new()
        .route("/", get(home))
        .route("/login-panel", get(login_panel))
        .route("/print-email-bol", get(print_email_bol).post(submit_bol))
        .route("/HazMaterials", post(haz_materials))
        .route("/favicon.ico", get(favicon))
        .nest_service("/assets", axum_embed::ServeEmbed::<Assets>::new())
        .nest_service("/img", axum_embed::ServeEmbed::<ImgAssets>::new())
        .nest_service(
            "/js/vendor",
            axum_embed::ServeEmbed::<JsVendorAssets>::new(),
        )
        .layer(compression_layer)
        .with_state(Connection::open("./db.sqlite").await.unwrap());

    let bind_address = std::env::var("BIND_ADDRESS").unwrap_or_else(|_| "0.0.0.0:8080".to_owned());
    let listener = tokio::net::TcpListener::bind(&bind_address)
        .await
        .unwrap_or_else(|error| panic!("failed to bind {bind_address}: {error}"));
    axum::serve(listener, app).await.unwrap();
}

async fn home() -> HomeTemplate {
    HomeTemplate {}
}

async fn login_panel() -> LoginPanelTemplate {
    LoginPanelTemplate {}
}

async fn print_email_bol() -> PrintEmailBolTemplate {
    PrintEmailBolTemplate {}
}

async fn submit_bol(
    axum::Form(pairs): axum::Form<Vec<(String, String)>>,
) -> impl axum::response::IntoResponse {
    let data = bol::build_bol(&pairs);
    match bol::render_pdf(&data) {
        Ok(pdf) => (
            [
                (axum::http::header::CONTENT_TYPE, "application/pdf"),
                (
                    axum::http::header::CONTENT_DISPOSITION,
                    "inline; filename=\"bol.pdf\"",
                ),
            ],
            pdf,
        )
            .into_response(),
        Err(message) => (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("failed to generate BOL: {message}"),
        )
            .into_response(),
    }
}

async fn favicon() -> impl axum::response::IntoResponse {
    let icon = Assets::get("img/favicon.ico").unwrap();
    (
        [(axum::http::header::CONTENT_TYPE, "image/x-icon")],
        icon.data.into_owned(),
    )
}

async fn haz_materials(
    axum::extract::State(db): axum::extract::State<Connection>,
    axum::Form(form): axum::Form<HashMap<String, String>>,
) -> String {
    let index = form.get("index").cloned().unwrap_or_default();
    let un_no = form
        .get("unNum")
        .map(|s| s.trim().to_uppercase())
        .unwrap_or_default();

    let entries = db::lookup_hazmat(&db, un_no.clone())
        .await
        .unwrap_or_default();

    match entries.len() {
        0 => format!("{index}|invalid|"),
        1 => {
            let e = &entries[0];
            format!(
                "{index}|{un_no}|{pg}|{haz}|{sub}|{desc}|{nos}|",
                pg = e.pg,
                haz = e.haz_class,
                sub = e.sub_class,
                desc = e.psn,
                nos = e.nos,
            )
        }
        _ => {
            let mut out = format!("{index}|multiple|{un_no}|");
            for e in &entries {
                out.push_str(&format!(
                    "{nos};{pg};{haz};{sub};{desc}|",
                    nos = e.nos,
                    pg = e.pg,
                    haz = e.haz_class,
                    sub = e.sub_class,
                    desc = e.psn,
                ));
            }
            out
        }
    }
}

#[derive(Template, WebTemplate)]
#[template(path = "home.html")]
struct HomeTemplate;

#[derive(Template, WebTemplate)]
#[template(path = "login-panel.html")]
struct LoginPanelTemplate;

#[derive(Template, WebTemplate)]
#[template(path = "print-email-bol.html")]
struct PrintEmailBolTemplate;

#[cfg(kani)]
mod verification {
    #[kani::proof]
    fn package_version_is_present() {
        assert!(!super::VERSION.is_empty());
    }
}
