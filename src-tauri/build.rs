use std::{env, fs, path::PathBuf};

const EMPTY_BUNDLE: &str = r#"// Generated fallback for builds without a bundled R2 preset.
pub const BUNDLED_R2_AVAILABLE: bool = false;
pub const BUNDLED_R2_KEY: &[u8] = &[];
pub const BUNDLED_R2_NONCE: &[u8] = &[];
pub const BUNDLED_R2_CIPHERTEXT: &[u8] = &[];
"#;

fn main() {
    let manifest =
        PathBuf::from(env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR is set"));
    let source = manifest.join(".generated/bundled_r2.rs");
    let destination =
        PathBuf::from(env::var("OUT_DIR").expect("OUT_DIR is set")).join("bundled_r2.rs");
    println!("cargo:rerun-if-changed={}", source.display());
    if source.exists() {
        fs::copy(&source, &destination).expect("copy encrypted bundled R2 configuration");
    } else {
        fs::write(&destination, EMPTY_BUNDLE).expect("write empty bundled R2 configuration");
    }
    tauri_build::build()
}
