import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection:Connection){};
  ConnectionStatus():void{
    const status=this.connection.readyState;
    switch (status) {
      case 0:
        console.log("Disconnected")
      case 1:
        console.log("Connected")
      case 2:
        console.log("Connecting")
      case 3:
        console.log("Disconnecting")
      default:
        console.log("Unknown")
    }     
  }
}
