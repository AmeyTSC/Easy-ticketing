import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/Interface/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(@InjectModel('User') private UserModel: Model<User>){}

    async getAllUser(): Promise<User[]>{
        const User= await this.UserModel.find();
        if(!User){
            throw new HttpException("No User Found",404);
        }
        return User;
    }
    async findById(userId: string):Promise<User>{
        const User=await this.UserModel.findById(userId).exec();
        if(!User){
            throw new HttpException("No User Found",404);
        }
        return User;
    }
    async updateUser(userId: string, userData: User): Promise<User> {
      if (userData.email) {
        const findUser: User = await this.UserModel.findOne({ email: userData.email });
        if (findUser && findUser._id != userId) throw new HttpException(`This email ${userData.email} already exists`,409);
      }
  
      if (userData.password) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData = { ...userData, password: hashedPassword };
      }
  
      const updateUserById: User = await this.UserModel.findByIdAndUpdate(userId, userData, { new: true });
  
      if (!updateUserById) throw new HttpException("User doesn't exist",409);
  
      return updateUserById;
    }
 
    async createUser(userData: User): Promise<User> {
      const findUser: User = await this.UserModel.findOne({ email: userData.email });
      if (findUser) throw new HttpException(`This email ${userData.email} already exists`,409);
  
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const createUserData: User = await this.UserModel.create({ ...userData, password: hashedPassword });
  
      return createUserData;
    }

    async findAgents(): Promise<User[]> {
      try {
        const agents: User[] = await this.UserModel.find({ role: 'support' }, { id: 1, email: 1 });
        return agents;
      } catch (error) {
        throw new HttpException(`Failed to retrieve agents: ${error.message}`,500);
      }
    }

    async deleteUser(userId: string): Promise<User> {
      const deleteUserById: User = await this.UserModel.findByIdAndDelete(userId);
      if (!deleteUserById) throw new HttpException("User doesn't exist",409);
  
      return deleteUserById;
    }
      
}
