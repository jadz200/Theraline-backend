import { Controller, Get } from '@nestjs/common';
import { PaginateResult } from 'mongoose';
import { Public } from 'src/common/decorators';
import { ArticlesService } from './articles.service';
import { ArticleDto } from './dto/article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articleService: ArticlesService) {}

  @Public()
  @Get('get_articles')
  async get_atricles(): Promise<PaginateResult<ArticleDto>> {
    return this.articleService.get_articles();
  }
}
