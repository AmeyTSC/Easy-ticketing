import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/Schema/user.schema';
import { CreateUserDto } from '../dtos/user.dto';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private UserModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async validateUserById(userId: string): Promise<User> {
    return this.UserModel.findById(userId).exec();
  }
  
  async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      const newUser = new this.UserModel({
        ...createUserDto,
        password: hashedPassword,
      });
      return await newUser.save();
    } catch (error) {
      console.error('Error during user signup:', error);
      throw new HttpException(
        'Something Went Wrong! Could not create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(
    @Body() email: string,
    password: string,
  ): Promise<{ user: User; accessToken: string }> {
    try {
      const user = await this.UserModel.findOne({ email }).exec();
      if (!user) {
        throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
      }
      const payload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(payload);
      await user.save();
      return {
        user,
        accessToken,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error during login:', error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logout(@Body() email: string,password: string): Promise<User>{
      const user=await this.UserModel.findOne({email}).exec();
      if(!user){
          throw new HttpException(
            'User not found!',HttpStatus.NOT_FOUND,
          );
      }
      return user;
  }
}
