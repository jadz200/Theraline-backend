import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async upload(file: Express.Multer.File) {
    let url;
    try {
      url = await cloudinary.uploader.upload(file.path);
    } catch (error) {
      console.log(error);
    }
    return { url: url['secure_url'] };
  }
}
