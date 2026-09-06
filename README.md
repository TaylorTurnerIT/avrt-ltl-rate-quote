# Rust + HTMX Template

A small Rust web application starter built with Axum, Askama, HTMX, SQLite,
Tailwind CSS, and daisyUI.

## Stack

- Axum 0.8 with Askama 0.16 templates
- SQLite through rusqlite and tokio-rusqlite
- Refinery for embedded database migrations
- Tailwind CSS 4 with daisyUI 5
- HTMX 2 with the response-targets extension
- Kani model-checking support

## Prerequisites

- Rust installed through [rustup](https://rustup.rs/)
- Node.js and npm
- [just](https://just.systems/) for the repository shortcuts
- Kani is optional for local development. See the [Kani installation guide](https://model-checking.github.io/kani/install-guide.html).

The repository includes `rust-toolchain.toml`, which selects the stable Rust
toolchain and the formatting and Clippy components.

## Run

The common development commands are available through [just](https://just.systems/):

```shell
just setup
just preview
```

Open <http://localhost:8080>. `just preview` binds to `0.0.0.0:8080`, so the
same preview is reachable from an authenticated Tailscale device at
`http://<this-machine-tailscale-ip>:8080`.

Authenticate this machine once with `tailscale up` if needed, then print the
address with `just preview-url`.

If you are not using just, install the frontend dependencies once:

```shell
npm ci
```

Then start the application:

```shell
cargo run
```

Open <http://localhost:8080>. Cargo runs the Tailwind CLI from the local npm
installation while compiling the application. The generated CSS is embedded
in the binary and is ignored by Git.

To use a different address or port, set `BIND_ADDRESS`, for example:

```shell
BIND_ADDRESS=127.0.0.1:9000 cargo run --locked
```

For a standalone frontend build or a CSS watcher:

```shell
npm run build:css
npm run watch:css
```

## Verify

```shell
cargo fmt --all -- --check
cargo check --locked
cargo test --locked
cargo clippy --locked --all-targets --all-features -- -D warnings
```

To install and run Kani locally:

```shell
cargo install --locked kani-verifier --version 0.67.0
cargo kani setup
cargo kani
```

The equivalent just commands are `just kani-install`, `just kani-setup`, and
`just kani`.

The Kani workflow runs the same verifier in GitHub Actions.

## Structure

```text
.
├── assets
│   ├── img
│   ├── js
│   └── styles
├── build.rs
├── Cargo.toml
├── migrations
├── package.json
├── src
│   ├── db
│   └── main.rs
└── templates
```

The landing page mirrors the source structure from
<https://tools.averitt.com/>. The downloaded reference snapshot is kept under
`references/averitt-tools/`; its local assets are organized under
`assets/img/averitt/`, and the source stylesheet is
`assets/styles/averitt-reference.css`. Edit `templates/` for Askama views,
`assets/styles/input.css` for Tailwind and daisyUI configuration, and
`assets/js/` for browser-side assets.
