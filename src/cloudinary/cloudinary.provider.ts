import { Provider } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from './cloudinary.service';

export const CloudinaryProvider: Provider = {
  provide: CloudinaryService,
  useValue: cloudinary,
};
