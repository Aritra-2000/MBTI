import dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !key) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY');
  }
  // Normalize key formatting from .env on Windows/CI
  // - Strip wrapping quotes if present
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  // - Convert literal \r\n or \n sequences to real newlines
  key = key.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');

  // - Validate PEM structure early for clearer errors
  const hasPemHeader = key.includes('-----BEGIN PRIVATE KEY-----') || key.includes('-----BEGIN RSA PRIVATE KEY-----');
  const hasPemFooter = key.includes('-----END PRIVATE KEY-----') || key.includes('-----END RSA PRIVATE KEY-----');
  if (!hasPemHeader || !hasPemFooter) {
    throw new Error('GOOGLE_PRIVATE_KEY appears malformed. Ensure it includes PEM headers (BEGIN/END) and uses escaped \\n in .env');
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

export async function findByHash(imageHash) {
  if (!SHEET_ID) throw new Error('Missing GOOGLE_SHEET_ID');
  const sheets = getSheets();
  // Assuming hash is in column D (4)
  const range = `${SHEET_NAME}!D:D`;
  const { data } = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
  const rows = data.values || [];
  // Skip header row if present
  for (let i = 0; i < rows.length; i++) {
    const cell = rows[i][0];
    if (cell && typeof cell === 'string' && cell.trim() === imageHash) return true;
  }
  return false;
}

export async function appendResult({ name, mbti, score, imageHash, date }) {
  if (!SHEET_ID) throw new Error('Missing GOOGLE_SHEET_ID');
  const sheets = getSheets();
  const values = [[name, mbti, `${score}%`, imageHash, date]];
  const range = `${SHEET_NAME}!A:E`;
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
}
