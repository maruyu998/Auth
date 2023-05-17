import config from 'config';
import cron from 'node-cron';
import { passwordHash } from './process/auth';
import { UserModel } from "./model/User";
import { ClientModel } from './model/Client';
import { OAuthCodeModel } from './model/OAuthCode';
import { OAuthTokenModel } from './model/OAuthToken';
import { ClientUserDataModel } from './model/ClientUserData';
import { AuthPermissionType, AuthPermissions } from './process/managing';


async function initializeDatabase(){
  const admin = await UserModel.findOneAndUpdate(
    { user_name: config.admin_user_name },
    { $set: {hashed_password: passwordHash(config.admin_password)} },
    { upsert: true }
  );
  const client_name = config.client_name;
  const client_secret = config.client_secret;
  const redirect_uri = new URL('/api/oauth_client/callback', config.service_domain).toString();
  const client = await ClientModel.findOneAndUpdate(
    { client_name, client_owner: admin},
    { $set: {client_name, client_secret, client_owner: admin, redirect_uri, status: "approved"} },
    { upsert: true }
  ).exec();
  await ClientUserDataModel.findOneAndUpdate(
    { client, user:admin },
    { $set:{ data: { permissions: AuthPermissions, status:"approved"} } },
    { upsert: true }
  ).exec()
}

async function deleteExpiredCodesAndTokens(){
  await OAuthCodeModel.deleteMany({expires_at: {$lt: new Date()}}).exec();
  await OAuthTokenModel.deleteMany({expires_at: {$lt: new Date()}}).exec();
}

const EVERY_10MINUTES = "*/10 * * * *";
export default function(){
  initializeDatabase()
  cron.schedule(EVERY_10MINUTES, deleteExpiredCodesAndTokens)
}