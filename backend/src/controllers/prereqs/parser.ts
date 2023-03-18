import lex, { CourseAtom, LexerToken } from "./lexer";

export type PrereqExprNode =
  | CourseAtom
  | {
      tag: "and" | "or";
      children: PrereqExprNode[];
    };

export type PrereqExpr = "terminal" | PrereqExprNode;

type LexerTokenArrSlice = {
  arr: LexerToken[];
  start: number;
};

/**
 * BNF for parseString
 *
 * <and_expr> ::= <value> | <value> " and " <and_expr>
 * <or_expr>  ::= <value> | <value> " or " <or_expr>
 *
 * <value>    ::= <course> | "(" <and_expr> ")" | "(" <or_expr> ")"
 * <expr>     ::= <and_expr> | <or_expr>
 *
 * The strategy for implementing the parser is functional parsing.
 */

type ParseSuccess<T> = {
  // result of a successful parse
  value: T; // the value we successfully parsed
  nextIdx: number; // index to begin parsing the next token
};

type Parsed<T> = ParseSuccess<T> | null; // null iff parse failed

/* A Parser is a function that reads an array LexerToken[] starting at a
 * particular index. If it successfully parses something, it returns an objet
 * of type ParseSuccess<T>, where the value field contains what was
 * successfully parsed. If it fails, it rreturns null.
 */
type Parser<T> = (_: LexerTokenArrSlice) => Parsed<T>;

/**
 * Either a parser or a function that gives us a parser.
 * We do this lazy computation because of mutual recursion.
 */
type LazyParser<T> = () => Parser<T>;

function defer<T>(p: Parser<T>): LazyParser<T> {
  return () => p;
}

/**
 * Helper function for simulating 'pattern matching' in TypeScript.
 * Yay for CPS.
 *
 * If parse was successful, returns onSuccess(value).
 * Otherwise returns onFailure().
 */
function match<T, U>(
  result: Parsed<T>,
  onSuccess: (_: ParseSuccess<T>) => U,
  onFailure: () => U
) {
  return result ? onSuccess(result) : onFailure();
}

/**
 * Our first parser. Only matches an empty input.
 */
const parseEmpty: LazyParser<true> = () => (tokens) => {
  if (tokens.start >= tokens.arr.length)
    return { value: true, nextIdx: tokens.start };
  return null;
};

/**
 * Our first real parser. If the next token in our input is a CourseAtom, then
 * returns a ParseSuccess with value being that CourseAtom. Otherwise returns
 * null.
 */
const parseCourseAtom: LazyParser<CourseAtom> = defer((tokens) => {
  if (tokens.start >= tokens.arr.length) return null;
  const token = tokens.arr[tokens.start];
  if (token.tag !== "course") return null;
  return { value: token, nextIdx: tokens.start + 1 };
});

type Operator = "(" | ")" | "and" | "or";

/**
 * Helper function to make parsers which only match one particular token
 * (lparen, rparen, and, or)
 */
function makeOperatorParser<T extends Operator>(oper: T): LazyParser<T> {
  return () => (tokens) => {
    if (tokens.start >= tokens.arr.length) return null;
    const token = tokens.arr[tokens.start];
    if (token.tag !== oper) return null;
    return { value: oper, nextIdx: tokens.start + 1 };
  };
}

/**
 * The following parsers only match the specified token and fail on everything
 * else.
 */
const parseLParen = makeOperatorParser("(");
const parseRParen = makeOperatorParser(")");
const parseAnd = makeOperatorParser("and");
const parseOr = makeOperatorParser("or");

/**
 * Our first parser combinator. Given two parsers p and q, returns a 'composite
 * parser', which:
 *  - First tries parser p on the input.
 *  - If p succeeds, return the result of p.
 *  - Otherwise, tries parser q on the result and returns the result.
 */
function alt<R, P extends R, Q extends R>(
  p: LazyParser<P>,
  q: LazyParser<Q>
): Parser<R> {
  return (tokens) =>
    match(
      p()(tokens),
      (x) => x as Parsed<R>,
      () => q()(tokens)
    );
}

function altMany<P>(...parsers: LazyParser<P>[]): Parser<P> {
  return parsers.reduce((p, q) => defer(alt(p, q)))();
}

/**
 * A slightly more complicated parser combinator. Given two parsers p and q,
 * returns a parser which:
 *  - Tries the first parser.
 *  - If it fails, just fail.
 *  - If it succeeds, tries the second parser on the rest of the input.
 *  - Returns a combinaton of the result of the first parser and the second parser.
 */
function then<P, Q, R>(
  first: LazyParser<P>,
  second: LazyParser<Q>,
  combine: (p: P, q: Q) => R
): Parser<R> {
  return (tokens) => {
    return match(
      first()(tokens),
      ({ value: resultP, nextIdx: startQ }) =>
        match(
          second()({ arr: tokens.arr, start: startQ }),
          ({ value: resultQ, nextIdx }) => ({
            value: combine(resultP, resultQ),
            nextIdx,
          }),
          () => null
        ),
      () => null
    );
  };
}

/**
 * A specialized version of then, where we only care about the result from the
 * second parser.
 */
function thenIgnoreFirst<P, Q>(first: LazyParser<P>, second: LazyParser<Q>) {
  return then(first, second, (_, q) => q);
}

/**
 * A specialized version of then, where we only care about the result from the
 * first parser.
 */
function thenIgnoreSecond<P, Q>(first: LazyParser<P>, second: LazyParser<Q>) {
  return then(first, second, (p, _) => p);
}

/**
 * A specialized version of then, where we only care about the result from the
 * inside parser.
 */
function between<P, Q, R>(
  before: LazyParser<P>,
  inside: LazyParser<Q>,
  after: LazyParser<R>
) {
  return thenIgnoreFirst(before, () => thenIgnoreSecond(inside, after));
}

/**
 * Givens a parser p, returns a parser which uses p to match as much of the
 * input as possible, and return all the results in an array.
 */
function many<P>(p: LazyParser<P>): Parser<P[]> {
  return (tokens) => {
    const result: P[] = [];
    let latest: Parsed<P>;
    while ((latest = p()(tokens))) {
      result.push(latest.value);
      tokens.start = latest.nextIdx;
    }
    return { value: result, nextIdx: tokens.start };
  };
}

/**
 * Given two parsers p and sep, matches a list of multiple items (matchable by
 * p) separated by sep and outputs it as an array.
 */
function sepBy<P, S>(p: LazyParser<P>, sep: LazyParser<S>): Parser<P[]> {
  return then(
    p,
    () => many(() => thenIgnoreFirst(sep, p)),
    (p, ps) => [p, ...ps]
  );
}

/**
 * Given a parser p and a function f, transforms any successful output according to f
 * This is essentially a Parser::map operation
 */
function mapParser<P, Q>(f: (_: P) => Q, p: Parser<P>): Parser<Q> {
  return (tokens) =>
    match(
      p(tokens),
      ({ value, nextIdx }) => ({ value: f(value), nextIdx }),
      () => null
    );
}

let parseAndExpr: Parser<PrereqExprNode>, parseOrExpr: Parser<PrereqExprNode>;

const parseValue = defer(
  altMany(
    parseCourseAtom,
    defer(between(parseLParen, parseCourseAtom, parseRParen)),
    defer(between(parseLParen, () => parseOrExpr, parseRParen)),
    defer(between(parseLParen, () => parseAndExpr, parseRParen))
  )
);

parseOrExpr = mapParser(
  (nodes: PrereqExprNode[]) => ({ tag: "or", children: nodes }),
  sepBy(parseValue, parseOr)
);

parseAndExpr = mapParser(
  (nodes: PrereqExprNode[]) => ({ tag: "and", children: nodes }),
  sepBy(parseValue, parseAnd)
);

const parsePrereqStr: Parser<PrereqExprNode> = altMany(
  defer(thenIgnoreSecond(parseCourseAtom, parseEmpty)),
  defer(thenIgnoreSecond(() => parseOrExpr, parseEmpty)),
  defer(thenIgnoreSecond(() => parseAndExpr, parseEmpty))
);

export default function parsePrereqString(prereqString: string): PrereqExpr {
  const tokens = lex(prereqString);
  if (tokens.length === 0) return "terminal";
  return parsePrereqStr({ arr: tokens, start: 0 })?.value;
}
