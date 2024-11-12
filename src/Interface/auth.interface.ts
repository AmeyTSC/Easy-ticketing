import { Request } from 'express';
import { User } from 'src/Interface/user.interface';

export interface DataStoredInToken {
  _id: string;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface RequestQuery {
  status?: string;
  priority?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: string;
  assigned?: string;
}
