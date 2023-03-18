const courseIdRegex = /\d{2}-?\d{3}/g;

export type CourseAtom = { tag: "course"; value: string };

// algebraic datatypes are fun
export type LexerToken =
  | { tag: "(" }
  | { tag: ")" }
  | { tag: "and" }
  | { tag: "or" }
  | CourseAtom;

const whitespaceRegex = /\s/;

/**
 * Parses a prereqString into an array of tokens.
 * @param prereqString The prereqString
 * @return Array of tokens if successful
 * @throw Invalid token encountered
 */
export default function lex(prereqString: string): LexerToken[] {
  let idx = 0;
  const size = prereqString.length;
  const tokens: LexerToken[] = [];

  while (idx < size) {
    const ch = prereqString.charAt(idx);
    if (whitespaceRegex.test(ch)) {
      ++idx;
    } else if (ch === "(" || ch === ")") {
      tokens.push({ tag: ch });
      ++idx;
    } else if (prereqString.substring(idx, idx + 3) === "and") {
      tokens.push({ tag: "and" });
      idx += 3;
    } else if (prereqString.substring(idx, idx + 2) === "or") {
      tokens.push({ tag: "or" });
      idx += 2;
    } else if (prereqString.substring(idx, idx + 5).match(courseIdRegex)) {
      tokens.push({
        tag: "course",
        value: prereqString.substring(idx, idx + 5),
      });
      idx += 5;
    } else {
      throw `Unexpected token encountered: ${prereqString.substring(
        0,
        idx
      )}|${prereqString.substring(idx)}`;
    }
  }

  return tokens;
}
