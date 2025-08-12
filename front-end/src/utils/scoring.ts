// Simple MBTI answer sheet scorer
// Heuristic: detect patterns like `12 A` or `12.A` etc. and count unique question numbers.
// Default expected question count is 93 (common MBTI length). Adjust as needed.

export function computeMbtiScore(text: string, expectedQuestions = 93): number {
  if (!text) return 0;
  const regex = /(?:^|\s)(\d{1,3})\s*[).:\-]?\s*([ABCD])/gi;
  const seen = new Set<number>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const q = parseInt(match[1], 10);
    if (!Number.isNaN(q)) {
      seen.add(q);
    }
  }
  const answered = seen.size;
  if (expectedQuestions <= 0) return 0;
  const pct = Math.round(Math.max(0, Math.min(100, (answered / expectedQuestions) * 100)));
  return pct;
}
