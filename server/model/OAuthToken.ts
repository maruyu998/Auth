import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';
import { LowerAlphabet, UpperAlphabet, Numbers } from '../../mutils/character';
import config from 'config';
import { OAuthTokenType } from '../../mtypes/OAuthToken';

export const OAuthTokenModel = mongoose.model<OAuthTokenType>('oauth_token',
  new mongoose.Schema<OAuthTokenType>({
    access_token: {
      type: String,
      required: true,
      unique: true,
      default: ()=>customAlphabet(LowerAlphabet+UpperAlphabet+Numbers, 50)()
    },
    refresh_token: {
      type: String,
      required: true,
      unique: true,
      default: ()=>customAlphabet(LowerAlphabet+UpperAlphabet+Numbers, 50)()
    },
    expires_at: {
      type: Date,
      required: true,
      default: ()=>new Date(Date.now() + config.access_token_duration)
    },
    scopes: [{
      type: String,
      required: true
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'client',
      required: true
    }
  }, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  })
)