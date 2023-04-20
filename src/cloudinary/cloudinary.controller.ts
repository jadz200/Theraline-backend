import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/index';
import { CloudinaryService } from './cloudinary.service';

@Controller('upload')
export class UploadController {
  constructor(private cloudinaryService: CloudinaryService) {}

  @Public()
  @ApiOperation({ summary: 'Upload an image base64' })
  @Post('post')
  async uploadFile(@Body() file) {
    return this.cloudinaryService.upload(file.file);
  }
}
