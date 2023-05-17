import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';
import { LowerAlphabet } from '../../mutils/character';
import { UserType } from '../../mtypes/User';

export const UserModel = mongoose.model<UserType>('user',
  new mongoose.Schema<UserType>({
    user_id: {
      type: String,
      required: true,
      unique: true,
      default: ()=>customAlphabet(LowerAlphabet, 10)()
    },
    user_name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    hashed_password: {
      type: String,
      required: true
    }
  },{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
  })
)