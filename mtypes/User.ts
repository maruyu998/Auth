import mongoose from 'mongoose';

export const UserStatuses = ["waiting", "approved", "rejected"] as const;
export type UserStatusType = typeof UserStatuses[number];

export type UserType = {
  user_id: string,
  user_name: string,
  hashed_password: string,
  created_at: Date,
  updated_at: Date
};

export type UserManagingType = {
  user_id: string,
  user_name: string,
  created_at: Date,
  updated_at: Date
};

export type UserClientDataManagingType = {
  user_id: string,
  user_name: string,
  client_id: string,
  client_name: string,
  created_at: Date,
  updated_at: Date,
  data: any
}