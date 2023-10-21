export function bufferHandler(type: 'base64' | 'base64url' | 'hex') {
  return function bufferHandler(value: string) {
    const match = value.match(/(.*)\|(binary|hex|utf8|ucs2|utf16le|ascii)$/);
    if (match) {
      return Buffer.from(match[1], type).toString(match[2] as BufferEncoding);
    } else {
      return Buffer.from(value, type);
    }
  };
}

export function base64Handler() {
  return bufferHandler('base64');
}

export function unsetHandler() {
  return function unsetHandler() {
    return undefined;
  };
}
