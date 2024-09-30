import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { User } from 'src/Schema/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from Bearer Authorization header
      ignoreExpiration: false,
      secretOrKey: "kflajfasklfjak", // Use the secret key from environment variables
    });
  }

  async validate(payload: { email: string; sub: string }): Promise<User> {
    const user = await this.authService.validateUserById(payload.sub); // Validate user using the ID (sub)
    if (!user) {
      throw new UnauthorizedException('Invalid Token');
    }
    return user; 
  }
}
