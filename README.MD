# MBTI Test OCR & Google Sheets Integration

A web app where students complete an MBTI test on paper, take a picture via the website, and the app:
- Reads answers using Tesseract.js (OCR in-browser)
- Calculates the MBTI score and percentage
- Checks if the same picture has already been submitted (image hash check)
- Stores results in Google Sheets with the student's name, MBTI type, and score.

---

## 🚀 Features
- 60–90 question MBTI test
- Image capture & upload directly in browser
- In-browser OCR with Tesseract.js (no backend needed for OCR)
- Duplicate image detection via hash
- Google Sheets API integration to store results
- Fully client + minimal server setup

---

## 🛠️ Tech Stack
- Frontend: React + Tailwind CSS
- OCR: [Tesseract.js](https://tesseract.projectnaptha.com/)
- Backend: Node.js + Express (only for Google Sheets API calls)
- Storage: Google Sheets (via Google Sheets API)
- Duplicate Check: crypto hashing

---

## 🔑 Environment Variables

### .env (Backend)
```env
# Google Sheets API
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="your_private_key_with_newlines"
GOOGLE_SHEET_ID=your_google_sheet_id_here

📋 Setup Instructions
1️⃣ Google Sheets API Setup
Go to Google Cloud Console.

Create a Service Account.
Enable the Google Sheets API.
Download your JSON key file.

Extract:

client_email → GOOGLE_SERVICE_ACCOUNT_EMAIL
private_key → GOOGLE_PRIVATE_KEY

Share your Google Sheet with the service account email (Editor permission).

2️⃣ Backend Installation
bash
Copy
Edit
cd backend
npm install express googleapis dotenv crypto cors
node index.js

3️⃣ Frontend Installation
bash
Copy
Edit
cd frontend
npm install react react-dom tesseract.js
npm run dev
📌 Flow
Student Uploads Image

Tesseract.js extracts text in-browser

The app:

Parses answers

Calculates MBTI type & %

Generates image hash

Backend checks Google Sheets for duplicates

If unique → Store in Google Sheets

📷 Duplicate Image Detection
Uses crypto to hash the uploaded image

Compares with stored hashes in Google Sheets

Denies submission if duplicate found

🧪 Example Google Sheets Layout
Name    MBTI    Score (%)    Image Hash    Date
John Doe    INTP    78%    abc123xyz    2025-08-08
Jane Smith    ESFJ    85%    def456uvw    2025-08-08
