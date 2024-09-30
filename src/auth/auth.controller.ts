import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/dtos/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    const response = await this.authService.signUp(createUserDto);
    return response;
  }

  @Post('/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const response = await this.authService.login(email, password);
    return response;
  }

  @Post('/logout')
  async logout(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const response = await this.authService.logout(email, password);
    return response;
  }

}

