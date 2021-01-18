export function png (input: Buffer) {
  const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const inputSlice = input.slice(0, 8);
  return inputSlice.equals(pngSignature);
}
