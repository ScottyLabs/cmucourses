export const standardizeID = (id: string): string => {
  if (!id.includes("-") && id.length >= 5) {
    let newString = id.slice(0, 2) + "-" + id.slice(2);
    return newString;
  }
  return id;
};

function singleToArray<T>(param: T): T[];
function singleToArray<T>(param: T[]): T[];
function singleToArray<T>(param: T | T[]): T[] {
  if (param instanceof Array) {
    return param;
  } else {
    return [param];
  }
}

export { singleToArray };
