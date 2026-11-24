export function levenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = [];
  for (let i = 0; i <= bl; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= al; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bl; i++) {
    for (let j = 1; j <= al; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bl][al];
}

export function tokenSimilarity(a: string, b: string): number {
  const tokensA = a.toLowerCase().split(/\s+/).filter(Boolean);
  const tokensB = b.toLowerCase().split(/\s+/).filter(Boolean);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  let matches = 0;
  for (const ta of tokensA) {
    for (const tb of tokensB) {
      if (ta === tb || levenshtein(ta, tb) <= 1) {
        matches++;
        break;
      }
    }
  }

  return matches / Math.max(tokensA.length, tokensB.length);
}

export function nameSimilarity(a: string, b: string): number {
  const normA = a.trim().toLowerCase();
  const normB = b.trim().toLowerCase();

  if (normA === normB) return 1.0;

  const lev = levenshtein(normA, normB);
  const maxLen = Math.max(normA.length, normB.length, 1);
  const levSim = Math.max(0, 1 - lev / maxLen);
  const tokSim = tokenSimilarity(normA, normB);

  return Math.round((0.5 * levSim + 0.5 * tokSim) * 100) / 100;
}

export function ageRangeOverlap(approxAge: number, ageRangeStr: string): boolean {
  if (!approxAge || !ageRangeStr) return true;
  const match = ageRangeStr.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return true;

  const min = parseInt(match[1], 10);
  const max = parseInt(match[2], 10);

  // Allow a 5-year buffer
  return approxAge >= min - 5 && approxAge <= max + 5;
}
