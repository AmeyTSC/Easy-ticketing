import { Injectable, CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { UserModel } from 'src/Schema/user.schema';
import { DataStoredInToken, RequestWithUser } from 'src/interface/auth.interface';
import * as dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const getAuthorization = (req: any) => {
  const cookies = req.cookies['Authorization'];
  if (cookies) return cookies;

  const header = req.header('Authorization');
  if (header) return header.split('Bearer ')[1];

  return null;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly roles: string[]) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const Authorization = getAuthorization(request);

    if (!Authorization) {
      throw new HttpException('Authentication token missing', 404);
    }

    try {
      const { _id } = verify(Authorization, process.env.JWT_SECRET) as DataStoredInToken;
      const findUser = await UserModel.findById(_id);

      if (findUser && this.roles.includes(findUser.role)) {
        request.user = findUser;
        return true; // Allow access
      } else {
        throw new HttpException('Wrong authentication token or Not authorized', 401);
      }
    } catch (error) {
      throw new HttpException('Wrong authentication token', 401);
    }
  }
}
