import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ConversationsModule } from './conversations/conversations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { VisitsModule } from './visits/visits.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    FavoritesModule,
    ConversationsModule,
    NotificationsModule,
    VisitsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
