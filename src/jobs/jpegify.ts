import { Job } from './_job';
import { DataRequirement, SupportedMedia, Arguments } from './_statics';
import * as is from '../media/is';

import Canvas from 'canvas';
import { loadCanvasFromImage } from '../media/util';

import { Context } from '../scheduler/context';

interface ThisJobArgs extends Arguments {
    quality?: number
}

export default class extends Job {
    name = 'jpegify'
    maximumImages = 1
    minimumImages = 1
    requiresData = DataRequirement.ALWAYS
    supportedMediaTypes = new Set([SupportedMedia.PNG, SupportedMedia.JPEG, SupportedMedia.GIF])

    async run (context: Context, inputs: Buffer[], args: ThisJobArgs): Promise<Buffer[]> {
      const quality = args.quality ?? 0.1;
      const image = inputs[0];
      context.setStatus('Loading image');
      const loadedRawImage = await Canvas.loadImage(image);
      const loadedImage = loadCanvasFromImage(loadedRawImage);
      context.setStatus('Compressing image');
      const output = loadedImage.toBuffer('image/jpeg', {
        quality
      });
      return [output];
    }
}
