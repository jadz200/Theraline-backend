import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProduces,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/index';
import { CloudinaryService } from './cloudinary.service';

@Controller('upload')
export class UploadController {
  constructor(private cloudinaryService: CloudinaryService) {}
  @Public()
  @ApiOperation({ summary: 'Create personal conversation' })
  @Post('post')
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.cloudinaryService.upload(file);
  }
}
