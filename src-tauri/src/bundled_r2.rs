use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use serde::Serialize;

mod generated {
    include!(concat!(env!("OUT_DIR"), "/bundled_r2.rs"));
}

#[derive(serde::Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BundledR2Config {
    account_id: String,
    access_key_id: String,
    secret_access_key: String,
    bucket_name: String,
    public_domain: String,
}

fn decrypt_payload(key: &[u8], nonce: &[u8], ciphertext: &[u8]) -> Result<Vec<u8>, String> {
    let cipher =
        Aes256Gcm::new_from_slice(key).map_err(|_| "Invalid bundled storage key.".to_string())?;
    cipher
        .decrypt(Nonce::from_slice(nonce), ciphertext)
        .map_err(|_| "The bundled storage configuration could not be decrypted.".to_string())
}

#[tauri::command]
pub fn get_bundled_r2_config() -> Result<Option<BundledR2Config>, String> {
    if !generated::BUNDLED_R2_AVAILABLE {
        return Ok(None);
    }
    let plaintext = decrypt_payload(
        generated::BUNDLED_R2_KEY,
        generated::BUNDLED_R2_NONCE,
        generated::BUNDLED_R2_CIPHERTEXT,
    )?;
    let config = serde_json::from_slice(&plaintext)
        .map_err(|_| "The bundled storage configuration is invalid.".to_string())?;
    Ok(Some(config))
}

#[cfg(test)]
mod tests {
    use super::*;
    use aes_gcm::aead::Aead;

    #[test]
    fn decrypts_aes_gcm_payloads_and_rejects_tampering() {
        let key = [7_u8; 32];
        let nonce = [3_u8; 12];
        let cipher = Aes256Gcm::new_from_slice(&key).unwrap();
        let encrypted = cipher
            .encrypt(Nonce::from_slice(&nonce), b"preset".as_slice())
            .unwrap();
        assert_eq!(
            decrypt_payload(&key, &nonce, &encrypted).unwrap(),
            b"preset"
        );

        let mut damaged = encrypted;
        damaged[0] ^= 1;
        assert!(decrypt_payload(&key, &nonce, &damaged).is_err());
    }

    #[test]
    fn generated_bundle_is_decryptable_when_packaging_injected_one() {
        if !generated::BUNDLED_R2_AVAILABLE {
            return;
        }
        let config = get_bundled_r2_config().unwrap().unwrap();
        assert!(!config.account_id.is_empty());
        assert!(!config.access_key_id.is_empty());
        assert!(!config.secret_access_key.is_empty());
        assert!(!config.bucket_name.is_empty());
        assert!(!config.public_domain.is_empty());
    }
}
