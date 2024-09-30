import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User,UserSchema } from 'src/Schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './Guards/jwt-auth.guard';
import { JwtStrategy } from './Guards/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret:"kflajfasklfjak",
      signOptions: {expiresIn: '3h'},
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtAuthGuard,JwtStrategy],
})
export class AuthModule {}
