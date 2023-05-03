import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PaginateModel, PaginateResult } from 'mongoose';
import { User, UserDocument } from '../auth/schema/user.schema';
import { ArticleDto } from './dto/article.dto';
import { CreateArticleDto } from './dto/createArticle.dto';
import { Article, ArticleDocument } from './schema/article.schema';
import { GetArticleDto } from './dto/getArticle.dto';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectModel(Article.name)
    private readonly articleModel: PaginateModel<ArticleDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async get_articles(page: number): Promise<PaginateResult<GetArticleDto>> {
    const options = {
      page,
      limit: 25,
      sort: { createdAt: -1 },
    };
    const resp: PaginateResult<Article> = await this.articleModel.paginate({
      options,
    });
    const articles: GetArticleDto[] = await Promise.all(
      resp.docs.map(async (article) => {
        const author = await this.userModel
          .findOne({ _id: article.author_id })
          .select('firstName lastName image');
        return {
          _id: article._id,
          title: article.title,
          date: article.date,
          content: article.content,
          author: {
            name: author.fullName,
            image: author.image,
          },
        };
      }),
    );

    this.logger.log(`Fetched all of the articles`);
    return { ...resp, docs: articles };
  }

  async get_article(articleId: string): Promise<ArticleDto> {
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const resp: ArticleDto = await this.articleModel.findOne({
      _id: articleId,
    });

    this.logger.log(`Fetched article ${resp._id}`);
    return resp;
  }

  async post_article(
    dto: CreateArticleDto,
    doctorId,
  ): Promise<{ msg: string }> {
    const date = Date.now();
    const article: Article = await this.articleModel.create({
      title: dto.title,
      content: dto.content,
      author_id: doctorId,
      date,
    });

    this.logger.log(`Posted article ${article._id}`);
    return { msg: 'Created Article' };
  }
}
