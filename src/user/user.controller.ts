import {
  Controller,
  Delete,
  Get,
  HttpException,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/Interface/user.interface';
import { Response, Request, NextFunction } from 'express';
import { RequestWithUser } from 'src/Interface/auth.interface';
import { AuthGuard } from 'src/Guards/auth.guards';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const findAllUsersData: User[] = await this.userService.getAllUser();

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  }

  @Post()
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: User = req.body;
      const createUserData: User = await this.userService.createUser(userData);

      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  }

  @Get(':id')
  @UseGuards(new AuthGuard(['admin', 'support']))
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: string = req.params.id;
      const findOneUserData: User = await this.userService.findById(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  }

  @Put(':id')
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: string = req.params.id;
      const userData: User = req.body;
      const updateUserData: User = await this.userService.updateUser(
        userId,
        userData,
      );

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  }

  @Delete(':id')
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: string = req.params.id;
      const deleteUserData: User = await this.userService.deleteUser(userId);

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  }

  @Get('agents')
  async getAgents(req: RequestWithUser, res: Response) {
    try {
      const agents: User[] = await this.userService.findAgents();
      res.status(200).json({ data: agents, message: 'Agents Fetched' });
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve agents: ${error.message}`,
        500,
      );
    }
  }
}
