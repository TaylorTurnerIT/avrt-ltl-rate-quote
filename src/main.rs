use askama::Template;
use askama_web::WebTemplate;
use axum::routing::get;
use rust_embed::RustEmbed;
use tokio_rusqlite::Connection;
use tower_http::compression::CompressionLayer;

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

    let compression_layer = CompressionLayer::new().gzip(true);

    let app = axum::Router::new()
        .route("/", get(home))
        .route("/login-panel", get(login_panel))
        .route("/print-email-bol", get(print_email_bol))
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

async fn favicon() -> impl axum::response::IntoResponse {
    let icon = Assets::get("img/favicon.ico").unwrap();
    (
        [(axum::http::header::CONTENT_TYPE, "image/x-icon")],
        icon.data.into_owned(),
    )
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
