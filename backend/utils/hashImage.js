import crypto from 'crypto';

// Accepts base64 data URI or raw base64 string
export function hashImageBase64(base64Input) {
  if (typeof base64Input !== 'string' || base64Input.length < 4) {
    throw new Error('Invalid base64 input');
  }
  const commaIdx = base64Input.indexOf(',');
  const base64 = commaIdx !== -1 ? base64Input.slice(commaIdx + 1) : base64Input;
  const buffer = Buffer.from(base64, 'base64');
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
