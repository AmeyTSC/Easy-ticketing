import { model, Schema, Document } from 'mongoose';
import { User } from 'src/Interface/user.interface';

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

export { UserSchema };
export const UserModel = model<User & Document>('User', UserSchema);
