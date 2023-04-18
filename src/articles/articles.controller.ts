import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginateResult } from 'mongoose';
import { Public } from 'src/common/decorators';
import { ArticlesService } from './articles.service';
import { ArticleDto } from './dto/article.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articleService: ArticlesService) {}

  @Public()
  @Get('get_articles')
  async get_atricles(): Promise<PaginateResult<ArticleDto>> {
    return this.articleService.get_articles();
  }

  @Public()
  @Get('article/:article_id')
  async get_article(@Param('article_id') article_id: string) {
    return this.articleService.get_article(article_id);
  }
}
