import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Comments extends Document{

    @Prop({required:true})
    text:string;

    @Prop({required:true})
    author:string;

}
export const CommentsSchema = SchemaFactory.createForClass(Comments);