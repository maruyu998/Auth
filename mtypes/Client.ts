import mongoose from 'mongoose';

export const ClientStatuses = ["waiting", "approved", "rejected"] as const;
export type ClientStatusType = typeof ClientStatuses[number];

export type ClientType = {
  client_id: string,
  client_secret: string,
  client_name: string,
  redirect_uri: string,
  client_owner: mongoose.ObjectId,
  status: ClientStatusType,
  reviewed_by?: mongoose.ObjectId,
  created_at: Date,
  updated_at: Date
}

export type ClientManagingType = {  
  client_id: string,
  client_name: string,
  redirect_uri: string,
  client_owner: {
    user_id: string,
    user_name: string
  },
  status: ClientStatusType,
  reviewed_by?: {
    user_id: string,
    user_name: string
  }
  created_at: Date,
  updated_at: Date
};

export type ClientUserManagingType = {
  client_id: string,
  user_id: string,
  tokens: {
    created_at: Date,
    expires_at: Date,
    scopes: string[]
  }[]
}