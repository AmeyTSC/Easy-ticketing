import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TicketModule } from './ticket/ticket.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: process.cwd() + '/.env' });

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DATABASE),
    AuthModule,
    TicketModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
