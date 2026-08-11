import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ConversationsModule } from './conversations/conversations.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, PropertiesModule, FavoritesModule, ConversationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
