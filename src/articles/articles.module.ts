import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article, ArticleSchema } from './schema/article.schema';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: Article.name,
        schema: ArticleSchema,
      },
    ]),
  ],
  providers: [ArticlesService],
  controllers: [ArticlesController],
})
export class ArticlesModule {}
