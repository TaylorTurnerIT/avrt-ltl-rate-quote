use std::process::Command;

#[cfg(not(debug_assertions))]
const VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg(debug_assertions)]
const VERSION: &str = "dev";

fn main() {
    println!("cargo:rerun-if-changed=assets/styles/input.css");
    println!("cargo:rerun-if-changed=assets/styles/averitt-reference.css");
    println!("cargo:rerun-if-changed=assets/fonts");
    println!("cargo:rerun-if-changed=assets/img/averitt");
    println!("cargo:rerun-if-changed=templates");
    println!("cargo:rerun-if-changed=package.json");
    println!("cargo:rerun-if-changed=package-lock.json");

    let versioned_output = format!("./assets/css/output@{VERSION}.css");
    let mut command = Command::new("npx");
    command.args(["--no-install", "@tailwindcss/cli"]).args([
        "-i",
        "./assets/styles/input.css",
        "-o",
        versioned_output.as_str(),
    ]);

    if !cfg!(debug_assertions) {
        command.arg("--minify");
    }

    let status = command.status().expect(
        "Failed to run Tailwind CSS. Install the frontend dependencies with `npm ci` first.",
    );

    if !status.success() {
        panic!("Tailwind CSS compilation failed");
    }
}
