import { Image, createCanvas } from 'canvas';

export function loadCanvasFromImage (image: Image) {
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  return canvas;
}
