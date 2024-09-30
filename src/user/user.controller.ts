import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService:UserService){}

    @Get()
    async getAllUser(){
        const response=await this.userService.getAllUser();
        return response;
    }
}
