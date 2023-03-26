export const standardizeID = (id: string): string => {
  if (!id.includes("-") && id.length >= 5) {
    return id.slice(0, 2) + "-" + id.slice(2);
  }
  return id;
};

export function singleToArray<T>(param: T): T[];
export function singleToArray<T>(param: T[]): T[];
export function singleToArray<T>(param: T | T[]): T[] {
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

export type Empty = Record<string, never>;
