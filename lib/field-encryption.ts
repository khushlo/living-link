import crypto from "node:crypto";

const PREFIX = "enc";

function configuredKeys() {
  const keys = new Map<string, Buffer>();
  const entries = process.env.PHI_ENCRYPTION_KEYS?.split(",") ?? [];
  for (const entry of entries) {
    const [version, encoded] = entry.split(":", 2);
    if (!version || !encoded) throw new Error("PHI_ENCRYPTION_KEYS must use version:base64key entries");
    const key = Buffer.from(encoded, "base64");
    if (key.length !== 32) throw new Error(`Encryption key ${version} must be a base64-encoded 32-byte key`);
    keys.set(version, key);
  }

  if (keys.size === 0 && process.env.PHI_ENCRYPTION_KEY) {
    const legacy = Buffer.from(process.env.PHI_ENCRYPTION_KEY, "base64");
    if (legacy.length !== 32) throw new Error("PHI_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
    keys.set("v1", legacy);
  }
  if (keys.size === 0) throw new Error("A PHI encryption key is required for sensitive data writes");
  return keys;
}

function activeKey() {
  const keys = configuredKeys();
  const version = process.env.PHI_ENCRYPTION_ACTIVE_KEY_VERSION ?? "v1";
  const key = keys.get(version);
  if (!key) throw new Error(`No active encryption key configured for ${version}`);
  return { version, key };
}

export function encryptField(value: string | null | undefined) {
  if (value == null || value === "") return value;
  if (value.startsWith(`${PREFIX}:`)) return value;

  const { version, key } = activeKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}:${version}:${iv.toString("base64url")}:${tag.toString("base64url")}:${ciphertext.toString("base64url")}`;
}

export function decryptField(value: string | null | undefined) {
  if (value == null || value === "" || !value.startsWith(`${PREFIX}:`)) return value;

  const [scheme, version, ivEncoded, tagEncoded, ciphertextEncoded] = value.split(":");
  if (scheme !== PREFIX || !version || !ivEncoded || !tagEncoded || !ciphertextEncoded) throw new Error("Invalid encrypted field format");
  const key = configuredKeys().get(version);
  if (!key) throw new Error(`No decryption key configured for ${version}`);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivEncoded, "base64url"));
  decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextEncoded, "base64url")), decipher.final()]).toString("utf8");
}
