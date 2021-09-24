export function assertExists<T>(value: T | null | unknown, message?: string | Error): asserts value {
  const check = value !== undefined && value !== null;

  if (!check) {
    throw new Error('Assertion failed! ' + message?.toString());
  }

}

export function assertTrue(value: boolean, message?: string | Error): asserts value is true {
  const check = value === true;

  if (!check) {
    throw new Error('Assertion failed! ' + message?.toString());
  }
}


export function objectValues<T extends { [s: string]: any }>(obj: T):  T[keyof T][] {
  return Object.keys(obj).map(k => obj[k]);
}
export function objectKV<T extends { [s: string]: any }>(obj: T): [keyof T, T[keyof T]][] {
  return Object.keys(obj).map(k => [k, obj[k]]);
}

// @ts-ignore
window.objectKV = objectKV;

// based on https://stackoverflow.com/questions/49796842/keyof-that-is-also-of-type-t
export type ExtractKeysOfValueType<T, K> = { [I in keyof T]: T[I] extends K ? I : never }[keyof T];
