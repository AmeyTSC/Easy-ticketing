import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel } from 'src/Schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserModel }])
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
