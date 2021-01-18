import { Job } from './_job';
import { DataRequirement, SupportedMedia, Arguments } from './_statics';
import * as is from '../media/is';

import Canvas from 'canvas';

interface ThisJobArgs extends Arguments {
    quality: number
}

export class JpegifyJob extends Job {
    name = 'jpegify'
    maximumImages = 1
    minimumImages = 1
    requiresData = DataRequirement.ALWAYS
    supportedMediaTypes = new Set([SupportedMedia.PNG, SupportedMedia.JPEG, SupportedMedia.GIF])

    async run (inputs: Buffer[], args: ThisJobArgs): Promise<Buffer[]> {
      const image = inputs[0];
      let output: Buffer;
      if (is.png(image)) {
        const canvas = await Canvas.loadImage(image);
      } else {

      }
    }
}
