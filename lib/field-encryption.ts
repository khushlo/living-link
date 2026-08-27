import crypto from "node:crypto";

const PREFIX = "enc";
const VERSION_PATTERN = /^[A-Za-z][A-Za-z0-9._-]{0,31}$/;
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

function decodeBase64(value: string, field: string) {
  if (!BASE64_PATTERN.test(value) || value.length % 4 !== 0) {
    throw new Error(`Invalid ${field} encoding`);
  }
  const decoded = Buffer.from(value, "base64");
  if (decoded.toString("base64") !== value) throw new Error(`Invalid ${field} encoding`);
  return decoded;
}

function decodeBase64Url(value: string, field: string) {
  if (!BASE64URL_PATTERN.test(value) || value.length % 4 === 1) {
    throw new Error(`Invalid ${field} encoding`);
  }
  const decoded = Buffer.from(value, "base64url");
  if (decoded.toString("base64url") !== value) throw new Error(`Invalid ${field} encoding`);
  return decoded;
}

function validateVersion(version: string) {
  if (!VERSION_PATTERN.test(version)) throw new Error("Invalid encrypted field version");
}

function configuredKeys() {
  const keys = new Map<string, Buffer>();
  const entries = process.env.PHI_ENCRYPTION_KEYS?.split(",") ?? [];
  for (const entry of entries) {
    const parts = entry.split(":");
    const [version, encoded] = parts;
    if (parts.length !== 2 || !version || !encoded) throw new Error("PHI_ENCRYPTION_KEYS must use version:base64key entries");
    validateVersion(version);
    const key = decodeBase64(encoded, "encryption key");
    if (key.length !== 32) throw new Error(`Encryption key ${version} must be a base64-encoded 32-byte key`);
    if (keys.has(version)) throw new Error(`Encryption key ${version} is configured more than once`);
    keys.set(version, key);
  }

  if (keys.size === 0 && process.env.PHI_ENCRYPTION_KEY) {
    const legacy = decodeBase64(process.env.PHI_ENCRYPTION_KEY, "encryption key");
    if (legacy.length !== 32) throw new Error("PHI_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
    keys.set("v1", legacy);
  }
  if (keys.size === 0) throw new Error("A PHI encryption key is required for sensitive data writes");
  return keys;
}

function activeKey() {
  const keys = configuredKeys();
  const version = process.env.PHI_ENCRYPTION_ACTIVE_KEY_VERSION ?? "v1";
  validateVersion(version);
  const key = keys.get(version);
  if (!key) throw new Error(`No active encryption key configured for ${version}`);
  return { version, key };
}

export function encryptField(value: string | null | undefined) {
  if (value == null || value === "") return value;
  // Keep valid stored ciphertext idempotent, but authenticate it before accepting it.
  if (value.startsWith(`${PREFIX}:`)) {
    decryptField(value);
    return value;
  }

  const { version, key } = activeKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}:${version}:${iv.toString("base64url")}:${tag.toString("base64url")}:${ciphertext.toString("base64url")}`;
}

export function decryptField(value: string | null | undefined) {
  if (value == null || value === "" || !value.startsWith(`${PREFIX}:`)) return value;

  const parts = value.split(":");
  if (parts.length !== 5) throw new Error("Invalid encrypted field format");
  const [scheme, version, ivEncoded, tagEncoded, ciphertextEncoded] = parts;
  if (scheme !== PREFIX || !version || !ivEncoded || !tagEncoded || !ciphertextEncoded) throw new Error("Invalid encrypted field format");
  validateVersion(version);
  const iv = decodeBase64Url(ivEncoded, "initialization vector");
  const tag = decodeBase64Url(tagEncoded, "authentication tag");
  const ciphertext = decodeBase64Url(ciphertextEncoded, "ciphertext");
  if (iv.length !== 12) throw new Error("Invalid encrypted field IV length");
  if (tag.length !== 16) throw new Error("Invalid encrypted field authentication tag length");
  if (ciphertext.length < 1) throw new Error("Invalid encrypted field ciphertext length");
  const key = configuredKeys().get(version);
  if (!key) throw new Error(`No decryption key configured for ${version}`);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
