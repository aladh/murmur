declare module "hi-base32" {
  export function encode(s: string): string;
  export function decode(s: string): string;
}

declare module "*.json" {
  const value: any;
  export default value;
}