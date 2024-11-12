import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { sign } from 'jsonwebtoken';
import { Model } from 'mongoose';
import { User } from 'src/Interface/user.interface';
import { TokenData, DataStoredInToken } from 'src/Interface/auth.interface';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config({ path: process.cwd() + '/.env' });

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly UserModel: Model<User>,
  ) {}
  private createToken = (user: User): TokenData => {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const expiresIn: number = 60 * 60;

    return {
      expiresIn,
      token: sign(dataStoredInToken, process.env.JWT_SECRET, { expiresIn }),
    };
  };

  private createCookie = (tokenData: TokenData): string => {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  };

  async signUp(@Body() userData: User): Promise<User> {
    try {
      const findUser: User = await this.UserModel.findOne({
        email: userData.email,
      });
      if (findUser)
        throw new HttpException(
          `This email ${userData.email} already exists`,
          HttpStatus.CONFLICT,
        );
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const createUserData: User = await this.UserModel.create({
        ...userData,
        password: hashedPassword,
      });
      return createUserData;
    } catch (error) {
      console.error('Error during user signup:', error);
      throw new HttpException(
        'Something Went Wrong! Could not create user',
        409,
      );
    }
  }

  async login(userData: User): Promise<{ cookie: string; findUser: User }> {
    try {
      const findUser: User = await this.UserModel.findOne({
        email: userData.email,
        role: userData.role,
      });
      if (!findUser)
        throw new HttpException(
          `User with email ${userData.email} / role ${userData.role}  was not found`,
          HttpStatus.NOT_FOUND,
        );

      const isPasswordMatching: boolean = await bcrypt.compare(
        userData.password,
        findUser.password,
      );
      if (!isPasswordMatching)
        throw new HttpException('Password is not matching', 401);

      const tokenData = this.createToken(findUser);
      const cookie = this.createCookie(tokenData);
      return { cookie, findUser };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error during login:', error);
      throw new HttpException('Internal Server Error', 404);
    }
  }

  async logout(userData: User): Promise<User> {
    const findUser: User = await this.UserModel.findOne({
      email: userData.email,
      password: userData.password,
    });
    if (!findUser)
      throw new HttpException(
        `This email ${userData.email} was not found`,
        409,
      );

    return findUser;
  }
}
