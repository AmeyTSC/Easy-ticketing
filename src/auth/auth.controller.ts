import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { User } from 'src/Interface/user.interface';
import { RequestWithUser } from 'src/Interface/auth.interface';
import { sendMail } from 'src/utils/notification';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(req: Request, res: Response) {
    const userData: User = req.body;
    const signUpUserData: User = await this.authService.signUp(userData);
    await sendMail(
      userData.email,
      'Welcome to Ticketing Application',
      `<h3>Welcome to Ticketing Application!<h3>`,
    );
    res.status(201).json({ data: signUpUserData, message: 'signup' });
  }

  @Post('/login')
  async login(req: Request, res: Response) {
    const userData: User = req.body;
    const { cookie, findUser } = await this.authService.login(userData);
    res.setHeader('Set-Cookie', [cookie]);
    res.status(200).json({ data: findUser, message: 'login' });
  }

  @Post('/logout')
  async logout(req: RequestWithUser, res: Response) {
    const userData: User = req.user;
    const logOutUserData: User = await this.authService.logout(userData);
    res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
    res.status(200).json({ data: logOutUserData, message: 'logout' });
  }
}
