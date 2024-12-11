export const standardizeID = (id: string): string => {
  if (!id.includes("-") && id.length >= 5) {
    return id.slice(0, 2) + "-" + id.slice(2);
  }
  return id;
};

export type SingleOrArray<T> = T | T[];

export function singleToArray<T>(param: SingleOrArray<T>): T[] {
  if (param instanceof Array) {
    return param;
  } else {
    return [param];
  }
}

export type BoolLiteral = "true" | "false";

export function fromBoolLiteral(literal?: BoolLiteral): boolean {
  return literal === "true";
}

export function exclude<T, K extends keyof T>(t: T, ...keys: K[]): Omit<T, K> {
  for (const key of keys)
    delete t[key];
  return t;
}

export function parseOptionalInt(s: string | undefined, defaultVal: number): number {
  if (s === undefined)
    return defaultVal;
  const num = parseInt(s);
  if (Number.isNaN(num))
    throw new Error("Invalid number " + s);
  return num;
}

export type PrismaReturn<PrismaFnType extends (...args: any) => any> =
  Awaited<ReturnType<PrismaFnType>>;

export type ElemType<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export function parsePrereqString(prereqString: string): string[][] {
  const normalized = prereqString.replace(/\s+/g, "").replace(/[()]/g, ""); // Remove whitespace and parentheses
  const andGroups = normalized.split("and"); // Split by AND groups
  return andGroups.map((group) => group.split("or")); // Split each AND group into OR relationships
}