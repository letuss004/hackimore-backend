import { isDefined } from 'class-validator';

export function combineString(strings: string[], separator = ' ') {
  return strings.map((value) => isDefined(value)).join(separator);
}

export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function isRawJSON(string: string): boolean {
  if (typeof string !== 'string') {
    return false; // Ensures the input is a string
  }
  try {
    JSON.parse(string);
    return true;
  } catch (e) {
    return false; // An error was thrown, so the string is not valid JSON
  }
}
