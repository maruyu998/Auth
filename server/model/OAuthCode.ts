import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';
import { LowerAlphabet, UpperAlphabet, Numbers } from '../../mutils/character';
import config from 'config';

export type OAuthCodeType = {
  code: string,
  signin_token: string,
  client: mongoose.ObjectId,
  user?: mongoose.ObjectId,
  response_type: string,
  scopes: string[],
  state: string,
  code_challenge: string,
  code_challenge_method: string,
  expires_at: Date,
}

export const OAuthCodeModel = mongoose.model<OAuthCodeType>('oauth_code',
  new mongoose.Schema<OAuthCodeType>({
    code: {
      type: String,
      required: true,
      unique: true,
      default: ()=>customAlphabet(LowerAlphabet+UpperAlphabet+Numbers, 50)()
    },
    signin_token: {
      type: String,
      required: true,
      unique: true,
      default: ()=>customAlphabet(LowerAlphabet+UpperAlphabet+Numbers, 50)()
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'client',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null
    },
    response_type: {
      type: String,
      required: true,
    },
    scopes: [{
      type: String,
      required: true
    }],
    state: {
      type: String,
      required: true
    },
    code_challenge: {
      type: String,
      required: true
    },
    code_challenge_method: {
      type: String,
      required: true
    },
    expires_at: {
      type: Date,
      required: true,
      default: ()=>new Date(Date.now() + config.access_code_duration)
    }
  }, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  })
)