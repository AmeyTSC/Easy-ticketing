import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TicketModule } from './ticket/ticket.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule,ConfigService } from '@nestjs/config';


@Module({
  imports: [ ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',  
  }),MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      uri: configService.get<string>('MONGO_URI'), // Use the environment variable from .env
    }),
  }),
  AuthModule, TicketModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
