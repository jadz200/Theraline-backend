import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  // eslint-disable-next-line class-methods-use-this
  async uploadImage(file: string) {
    let url;
    try {
      url = await cloudinary.uploader.upload(file);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Cannot upload image');
    }
    return { url: url.secure_url };
  }

  // eslint-disable-next-line class-methods-use-this
  async uploadPdf(file: string) {
    console.log(file);
    let url;
    try {
      url = await cloudinary.uploader.upload(file);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Cannot upload PDF');
    }
    return { url: url.secure_url };
  }
}
