import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/Schema/user.schema';

@Injectable()
export class UserService {
    constructor(@InjectModel('User') private UserModel: Model<User>){}

    async getAllUser():Promise<User[]>{
        const User= await this.UserModel.find();
        if(!User){
            throw new HttpException("No User Found",HttpStatus.NOT_FOUND);
        }
        return User;
    }
    async findById(id:string):Promise<User>{
        const User=await this.UserModel.findById(id).exec();
        if(!User){
            throw new HttpException("No User Found",HttpStatus.NOT_FOUND);
        }
        return User;
    }
}
