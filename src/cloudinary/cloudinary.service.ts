import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async upload(file: string) {
    let url;
    try {
      url = await cloudinary.uploader.upload(file);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Cannot upload image');
    }
    return { url: url.secure_url };
  }
}
