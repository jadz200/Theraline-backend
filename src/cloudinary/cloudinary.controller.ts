import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/index';
import { CloudinaryService } from './cloudinary.service';

@Controller('upload')
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided, @darraghor/nestjs-typed/controllers-should-supply-api-tags
export class UploadController {
  constructor(private cloudinaryService: CloudinaryService) {}

  // eslint-disable-next-line @darraghor/nestjs-typed/api-method-should-specify-api-response
  @Public()
  @ApiOperation({ summary: 'Upload an image base64' })
  @Post('post')
  async uploadFile(@Body() file) {
    return this.cloudinaryService.upload(file.file);
  }
}
