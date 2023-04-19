import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginateResult } from 'mongoose';
import { Public, Roles } from 'src/common/decorators';
import { RolesGuard } from 'src/common/guards';
import { ArticlesService } from './articles.service';
import { ArticleDto } from './dto/article.dto';
import { CreateArticleDto } from './dto/createArticle.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articleService: ArticlesService) {}

  @ApiBearerAuth()
  @Get('get_articles')
  async get_atricles(): Promise<PaginateResult<ArticleDto>> {
    return this.articleService.get_articles();
  }

  @ApiBearerAuth()
  @Get('article/:article_id')
  async get_article(@Param('article_id') article_id: string) {
    return this.articleService.get_article(article_id);
  }

  @ApiBearerAuth()
  @Patch('post')
  @Roles('DOCTOR')
  @UseGuards(RolesGuard)
  async post_article(@Body() dto: CreateArticleDto): Promise<{ msg: string }> {
    return this.articleService.post_article(dto);
  }
}
