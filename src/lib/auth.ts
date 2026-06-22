// Web Crypto helpers for signed session tokens (Edge Runtime compatible)

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(secret: string): Promise<string> {
  const expiry = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const data = expiry.toString();
  const encoder = new TextEncoder();
  const key = await getCryptoKey(secret);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signature = signatureArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return `${data}.${signature}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [expiryStr, signature] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || expiry < Date.now()) return false;

  const key = await getCryptoKey(secret);
  const encoder = new TextEncoder();
  
  // Convert hex signature back to Uint8Array
  const signatureBytes = new Uint8Array(
    signature.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );

  return crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(expiryStr));
}
