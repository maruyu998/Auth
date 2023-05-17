import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';
import { LowerAlphabet, UpperAlphabet, Numbers } from '../../mutils/character';
import { ClientStatuses, ClientType } from '../../mtypes/Client';

export const ClientModel = mongoose.model<ClientType>('client',
  new mongoose.Schema<ClientType>({
    client_id: {
      type: String,
      required: true,
      unique: true,
      default: ()=>customAlphabet(LowerAlphabet, 10)()
    },
    client_secret: {
      type: String,
      required: true,
      unique: true,
      default: ()=>customAlphabet(LowerAlphabet+UpperAlphabet+Numbers, 50)()
    },
    client_name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    redirect_uri: {
      type: String,
      required: true
    },
    client_owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    status: {
      type: String,
      enum: ClientStatuses,
      required: true,
      default: "waiting"
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  },{ 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
  })
)