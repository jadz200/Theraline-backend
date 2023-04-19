import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { PaginateModel, PaginateResult } from 'mongoose';
import { ArticleDto } from './dto/article.dto';
import { CreateArticleDto } from './dto/createArticle.dto';
import { Article, ArticleDocument } from './schema/article.schema';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectModel(Article.name)
    private readonly articleModel: PaginateModel<ArticleDocument>,
  ) {}
  async get_articles(): Promise<PaginateResult<ArticleDto>> {
    const resp: PaginateResult<ArticleDto> = await this.articleModel.paginate(
      {},
    );

    this.logger.debug(`Fetched all of the articles`);
    return resp;
  }
  async get_article(article_id: string): Promise<ArticleDto> {
    if (!mongoose.Types.ObjectId.isValid(article_id)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const resp: ArticleDto = await this.articleModel.findOne({
      _id: article_id,
    });

    this.logger.debug(`Fetched article ${resp._id}`);
    return resp;
  }
  async post_article(dto: CreateArticleDto): Promise<{ msg: string }> {
    const date = Date.now();
    const article: Article = await this.articleModel.create({
      title: dto.title,
      content: dto.content,
      date: date,
    });

    this.logger.debug(`Posted article ${article._id}`);
    return { msg: 'Created Article' };
  }
}
