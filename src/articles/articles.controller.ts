import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginateResult } from 'mongoose';
import { Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import {
  SwaggerForbiddenResponse,
  SwaggerGetArticlesResp,
  SwaggerResponseSuccessfulWithMessage,
  SwaggerUnauthorizedResponse,
} from '../common/swagger';
import { ArticlesService } from './articles.service';
import { ArticleDto } from './dto/article.dto';
import { CreateArticleDto } from './dto/createArticle.dto';
import { PaginationParams } from '../common/dto/paginationParams.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articleService: ArticlesService) {}

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiOkResponse({ schema: { example: SwaggerGetArticlesResp } })
  @ApiOperation({ summary: 'gets all the article in a paginated responses' })
  @ApiBearerAuth()
  @Get('get_articles')
  async get_atricles(
    @Query() { page }: PaginationParams,
  ): Promise<PaginateResult<ArticleDto>> {
    return this.articleService.get_articles(page);
  }

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiOkResponse({ type: ArticleDto })
  @ApiOperation({ summary: 'Gets a specific article using id' })
  @ApiBearerAuth()
  @Get('article/:article_id')
  async get_article(@Param('article_id') article_id: string) {
    return this.articleService.get_article(article_id);
  }

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiCreatedResponse(SwaggerResponseSuccessfulWithMessage('Created Article'))
  @ApiOperation({ summary: 'Post an article' })
  @UsePipes(ValidationPipe)
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @ApiBearerAuth()
  @Patch('post')
  async post_article(@Body() dto: CreateArticleDto): Promise<{ msg: string }> {
    return this.articleService.post_article(dto);
  }
}
