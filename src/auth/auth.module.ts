import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User,UserSchema } from 'src/Schema/user.schema';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret:"kflajfasklfjak",
      signOptions: {expiresIn: '3h'},
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
