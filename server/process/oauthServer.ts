import fetch from 'node-fetch';
import { verifyChallenge } from "pkce-challenge";
import { OAuthTokenModel } from "../model/OAuthToken";
import { OAuthCodeModel } from "../model/OAuthCode";
import { ClientModel } from "../model/Client";
import { UserModel } from "../model/User";
import { ClientUserDataModel } from '../model/ClientUserData';

export async function authorizeClient({
  client_id, client_secret, redirect_uri, response_type, scopes, state, code_challenge, code_challenge_method
}:{
  client_id: string,
  client_secret: string,
  redirect_uri: string,
  state: string,
  response_type: string,
  scopes: string[],
  code_challenge: string,
  code_challenge_method: string
}){
  const client = await ClientModel.findOne({client_id, client_secret, redirect_uri, status:"approved"}).exec();
  if(client == null) throw new Error("client is not found");
  const oauthCode = await new OAuthCodeModel({client, response_type, scopes, state, code_challenge, code_challenge_method}).save();
  return oauthCode.signin_token;
}

export async function getCode({ user_id, client_id, signin_token }:{
  user_id: string,
  client_id: string, 
  signin_token: string,
}){
  const user = await UserModel.findOne({user_id});
  if(user == null) throw new Error("user is not found (unreachable)");
  const oauthCode = await OAuthCodeModel.findOneAndUpdate(
    { user: null, signin_token, expires_at:{$gt:new Date()} },
    { $set: { user } },
    { upsert: false }
  ).exec();
  if(oauthCode == null) throw new Error("code is invalid or expired. try again from the beginning.");
  const client = await ClientModel.findById(oauthCode.client).exec();
  if(client == null) throw new Error("client is not found(unreachable)");
  if(client.client_id != client_id) throw new Error("client_id is not match");

  return { redirect_uri: client.redirect_uri, code: oauthCode.code, state: oauthCode.state }
}

export async function generateAccessToken({ code, code_verifier }:{
  code: string,
  code_verifier: string
}){
  const oauthCode = await OAuthCodeModel.findOneAndDelete({code}).exec();
  if(oauthCode == null) throw new Error("code is invalid or expired. try again from the beginning.");
  const client = await ClientModel.findById(oauthCode.client).exec();
  if(client == null) throw new Error("client is not found(unreachable)");
  
  const code_challenge = oauthCode.code_challenge;
  const challenge_success = await verifyChallenge(code_verifier, code_challenge);
  if(!challenge_success) throw new Error("Code challenge is failed.");

  const user = await UserModel.findById(oauthCode.user).exec();
  if(user == null) throw new Error("user is not found. process went something wrong.");

  const token = await new OAuthTokenModel({ user, client:oauthCode.client }).save();

  await ClientUserDataModel.findOneAndUpdate({client,user},{},{upsert:true}).exec();
  return {
    access_token: token.access_token,
    token_type: "bearer",
    expires_in: Math.floor((token.expires_at.getTime() - Date.now())/1000),
    expires_at: token.expires_at,
    refresh_token: token.refresh_token,
    scope: token.scopes.join(" ")
  }
}
