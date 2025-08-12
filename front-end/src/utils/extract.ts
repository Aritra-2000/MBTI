// Utilities to extract metadata from OCR text

const MBTI_PATTERN = /\b(?:ISTJ|ISFJ|INFJ|INTJ|ISTP|ISFP|INFP|INTP|ESTP|ESFP|ENFP|ENTP|ESTJ|ESFJ|ENFJ|ENTJ)\b/gi;

export function extractMbti(text: string): string | null {
  if (!text) return null;
  const matches = text.match(MBTI_PATTERN);
  if (!matches || matches.length === 0) return null;
  // Choose the most frequent; if tie, first occurrence
  const counts = new Map<string, number>();
  for (const m of matches) {
    const up = m.toUpperCase();
    counts.set(up, (counts.get(up) || 0) + 1);
  }
  let best: string | null = null;
  let bestCount = -1;
  counts.forEach((c, k) => {
    if (c > bestCount) {
      best = k;
      bestCount = c;
    }
  });
  return best;
}
