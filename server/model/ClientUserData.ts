import mongoose from 'mongoose';
import { UserStatusType, UserStatuses } from '../../mtypes/User';

export type ClientUserDataType = {
  client: mongoose.ObjectId,
  user: mongoose.ObjectId,
  created_at: Date,
  updated_at: Date,
  data: any,
}

export const ClientUserDataModel = mongoose.model<ClientUserDataType>('client_user_data',
  (()=>{
    const schema = new mongoose.Schema<ClientUserDataType>({
      client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'client',
        required: true
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
      },
      data: {
        type: mongoose.Schema.Types.Mixed
      }
    },{
      timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
    })
    schema.index({ client: 1, user: 1 }, { unique : true });
    return schema
  })()
)