set dotenv-load := true

default:
    @just --list

# Install frontend dependencies and fetch locked Rust dependencies.
setup:
    npm ci
    rustup run stable cargo fetch --locked

# Build the standalone CSS bundle.
css:
    npm run build:css

# Build a minified standalone CSS bundle.
css-min:
    npm run build:css:minify

# Watch templates and styles and rebuild CSS on changes.
watch-css:
    npm run watch:css

# Run the application using the default bind address.
run:
    rustup run stable cargo run --locked

# Run a preview on every interface, including Tailscale when authenticated.
preview:
    BIND_ADDRESS=0.0.0.0:8081 rustup run stable cargo run --locked

# Print the URL for the running preview over Tailscale.
preview-url:
    @tailscale ip -4 | xargs -r -n1 printf 'http://%s:8081\n'

# Compile a debug build.
build:
    rustup run stable cargo build --locked

# Compile an optimized release build.
release:
    rustup run stable cargo build --locked --release

# Format Rust code.
fmt:
    rustup run stable cargo fmt --all

# Check Rust formatting without changing files.
fmt-check:
    rustup run stable cargo fmt --all -- --check

# Type-check the project.
check:
    rustup run stable cargo check --locked

# Run the test suite.
test:
    rustup run stable cargo test --locked

# Run Clippy with warnings treated as errors.
lint:
    rustup run stable cargo clippy --locked --all-targets --all-features -- -D warnings

# Run the standard Rust verification suite.
verify: fmt-check check test lint
    @echo "All Rust checks passed."

# Install the pinned Kani CLI.
kani-install:
    rustup run stable cargo install --locked kani-verifier --version 0.67.0

# Install Kani's verifier toolchain.
kani-setup:
    cargo kani setup

# Run Kani proofs.
kani:
    cargo kani

# Remove Rust build artifacts.
clean:
    rustup run stable cargo clean
