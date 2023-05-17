import crypto from 'crypto';
import config from 'config';
import express from 'express';
import { UserModel } from '../model/User';
import { UserStatusType, UserType } from '../../mtypes/User';
import { ClientUserDataModel } from '../model/ClientUserData';
import { ClientModel } from '../model/Client';
import { saveSession } from '../utils/express';
import { AuthPermissionType } from './managing';

function hash({ text, salt }:{
  text: string,
  salt: string
}){
  if(salt==undefined) throw Error("salt is undefined in hash function.")
  const sha512 = crypto.createHash('sha512');
  sha512.update(salt + text)
  return sha512.digest('hex')
}

export function passwordHash(password){
  return hash({ text: password, salt: config.hash_salt });
}

async function storeUserInfo(
  user: UserType,
  request: express.Request
){
  const { user_id, user_name } = user;
  const client = await ClientModel.findOne({client_id: config.client_id}).exec();
  if(client == null) throw new Error("client is null (unreachable)");
  const clientUserData = await ClientUserDataModel.findOne({user, client});
  const permissions = clientUserData?.data?.permissions || [] as AuthPermissionType[];
  const status = clientUserData?.data?.status || "waiting" as UserStatusType;
  const expires_at = new Date(Date.now() + config.userinfo_keep_duration);
  if(request.session.maruyuOAuth == undefined) {
    request.session.maruyuOAuth = {}
    await saveSession(request);
  }
  request.session.maruyuOAuth.user_info = { user_id, user_name, data:{permissions, status}, expires_at };
  await saveSession(request);
}

export async function signup({ user_name, password, request }:{
  user_name: string,
  password: string,
  request: express.Request
}):Promise<UserType|null>{
  const same_user = await UserModel.findOne({user_name}).exec();
  if(same_user) return null;
  const hashed_password = passwordHash(password);
  const user = await new UserModel({user_name, hashed_password}).save();
  await storeUserInfo(user, request);
  return user;
}

export async function signin({ user_name, password, request }:{
  user_name: string,
  password: string,
  request: express.Request
}):Promise<boolean>{
  const hashed_password = passwordHash(password);
  const user = await UserModel.findOne({user_name, hashed_password}).exec();
  if(!user) return false;
  await storeUserInfo(user, request);
  return true
}