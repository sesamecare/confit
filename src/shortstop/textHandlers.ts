export function base64Handler() {
  return function base64Handler(value: string) {
    return Buffer.from(value, 'base64');
  };
}
