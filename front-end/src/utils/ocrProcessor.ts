import Tesseract from 'tesseract.js';

export async function ocrImageFromFile(file: File) {
  if (!file) throw new Error('No file provided');
  const imageURL = URL.createObjectURL(file);
  try {
    const { data } = await Tesseract.recognize(imageURL, 'eng');
    return data.text || '';
  } finally {
    URL.revokeObjectURL(imageURL);
  }
}

export async function ocrImageFromDataUrl(dataUrl: string) {
  const { data } = await Tesseract.recognize(dataUrl, 'eng');
  return data.text || '';
}
