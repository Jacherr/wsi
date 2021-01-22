export function png (input: Buffer) {
  const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const inputSlice = input.slice(0, pngSignature.length);
  return inputSlice.equals(pngSignature);
}

export function gif (input: Buffer) {
  const gifSignature = new Uint8Array([47, 49, 46, 38]);
  const inputSlice = input.slice(0, gifSignature.length);
  return inputSlice.equals(gifSignature);
}
