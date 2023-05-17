import mongoose from 'mongoose';

export type OAuthTokenType = {
  access_token: string,
  refresh_token: string,
  expires_at: Date,
  scopes: string[],
  user: mongoose.ObjectId,
  client: mongoose.ObjectId,
  created_at: Date
}