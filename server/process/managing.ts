import config from 'config';
import * as arrayUtil from 'mutils/array';

import { UserManagingType, UserType, UserStatusType, UserClientDataManagingType } from "../../mtypes/User";
import { ClientManagingType, ClientStatusType } from '../../mtypes/Client';
import { ClientUserManagingType } from '../../mtypes/Client';

import { UserModel } from "../model/User";
import { ClientModel } from '../model/Client';
import { OAuthTokenModel } from '../model/OAuthToken';
import { ClientUserDataModel } from "../model/ClientUserData";

export const AuthPermissions = [
  "BROWSE_ALL_CLIENTS", "REVIEW_CLIENT", "REGISTER_CLIENT"
] as const;
export type AuthPermissionType = typeof AuthPermissions[number];

async function getPermissions(user_id:string):Promise<AuthPermissionType[]|never>{
  const client_name = config.client_name;
  const client = await ClientModel.findOne({client_name}).exec();
  if(client == null) throw new Error("client is null");
  const user = await UserModel.findOne({user_id}).exec();
  if(user == null) throw new Error("user is null");
  const client_user_data = await ClientUserDataModel.findOne({client,user}).exec();
  if(client_user_data == null || !client_user_data.data) return [];
  const { permissions } = client_user_data.data;
  if(!Array.isArray(permissions)) return [];
  if(!arrayUtil.isInElms([...AuthPermissions], permissions)) 
    throw new Error("Fetched permissions is not in AuthPermissions");
  return permissions as AuthPermissionType[]
}

export async function userHasPermissions(
  user_id:string, 
  permissions:AuthPermissionType[]
){
  const user_permission = await getPermissions(user_id);
  if(arrayUtil.isInElms(user_permission, permissions)) return true
  return false
}

export async function getClients(user_id:string):Promise<ClientManagingType[]>{
  const permissions = await getPermissions(user_id).then(permissions=>permissions||[]);
  const user = await UserModel.findOne({user_id}).exec();
  if(user == null) throw new Error("user is not found.");

  const query = permissions.includes("BROWSE_ALL_CLIENTS") ? {} : { client_owner:user }
  const clients = await ClientModel.find(query)
                .populate<{client_owner:UserType}>('client_owner')
                .populate<{reviewed_by?:UserType}>('reviewed_by')
                .exec().then(clients=>clients.map(({
                  client_id, client_name, client_owner, 
                  redirect_uri, status, reviewed_by, created_at, updated_at
                })=>({
                  client_id, client_name,
                  client_owner: { 
                    user_id: client_owner.user_id, 
                    user_name: client_owner.user_name 
                  },
                  redirect_uri, status,
                  reviewed_by: reviewed_by && {
                    user_id: reviewed_by.user_id,
                    user_name: reviewed_by.user_name
                  },
                  created_at, updated_at
                } as ClientManagingType)))
  return clients
}
// register_client permission is needed (not checked)
export async function registerClient(
  client_name: string,
  redirect_uri: string,
  client_owner_id: string,
){
  const client_owner = await UserModel.findOne({ user_id: client_owner_id }).exec();
  if(client_owner == null) throw new Error("Client owner is not found.");
  const same_name_client = await ClientModel.findOne({client_name}).exec();
  if(same_name_client) throw new Error("same client_name is already exist.");

  const client = await new ClientModel({client_name, redirect_uri, client_owner}).save();
  return client;
}
// review_client permission is needed (not checked)
export async function reviewClient(
  client_id:string, 
  review:Exclude<ClientStatusType,"waiting">, 
  reviewed_by:string
){
  const reviewer = await UserModel.findOne({ user_id: reviewed_by }).exec();
  if(reviewer == null) throw new Error("reviewer is not found.");
  const client = await ClientModel.findOneAndUpdate(
    { client_id, status:"waiting" }, 
    { $set:{ status:review, reviewed_by:reviewer } },
    { upsert: false }
  ).exec();
  if(client == null) throw new Error("client update is failed.");
}

// 
export async function getClientInfo(
  client_id: string,
  requesting_user_id: string
):Promise<{client:ClientManagingType, users:UserClientDataManagingType[]}>{
  const client_owner = await UserModel.findOne({user_id:requesting_user_id}).exec();
  if(client_owner == null) throw new Error("client_owner is not found.");
  const client = await ClientModel.findOne({client_id, client_owner}).populate<{reviewed_by?:UserType}>("reviewed_by").exec();
  if(client == null) throw new Error(`client is not found.`);
  const { client_name, redirect_uri, status, reviewed_by, created_at, updated_at } = client;
  const client_managing = {
    client_id, client_name, redirect_uri, status, created_at, updated_at,
    client_owner: { user_id: client_owner.user_id, user_name: client_owner.user_name },
    reviewed_by: reviewed_by && { user_id: reviewed_by.user_id, user_name: reviewed_by.user_name }
  }
  const users = await ClientUserDataModel.find({client}).populate<{user:UserType}>('user').exec()
                .then(clientUserDatas=>clientUserDatas.map(({user,data})=>{
                  return {
                    user_id: user.user_id,
                    user_name: user.user_name,
                    client_id, client_name,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                    data
                  }
                }));
  
  return { client: client_managing, users }
}

export async function getClientUserData(
  user_id: string,
  client_id: string,
  requesting_user_id: string
):Promise<UserClientDataManagingType>{
  const client = await ClientModel.findOne({client_id})
                .populate<{client_owner?:UserType}>('client_owner')
                .exec();
  if(client == null) throw new Error("client is not found");
  if(client.client_owner == undefined) throw new Error("client owner is undefined (system error)");
  if(client.client_owner.user_id != requesting_user_id) throw new Error("owner is only allowed to get user data");
  const user = await UserModel.findOne({user_id}).exec();
  if(user == null) throw new Error("user is not found");
  const clientUserData = await ClientUserDataModel.findOne({client, user}).exec();
  if(clientUserData == null) throw new Error("client user data is empty");
  return {
    user_id: user.user_id,
    user_name: user.user_name,
    client_id: client.client_id,
    client_name: client.client_name,
    created_at: clientUserData.created_at,
    updated_at: clientUserData.updated_at,
    data: clientUserData.data
  }
}

export async function updateClientUserData(
  user_id: string,
  client_id: string,
  data: any,
  requesting_user_id: string
){
  const client = await ClientModel.findOne({client_id}).populate<{client_owner?:UserType}>('client_owner').exec();
  if(client == null) throw new Error("client is not found");
  if(client.client_owner == undefined) throw new Error("client owner is undefined (system error)");
  if(client.client_owner.user_id != requesting_user_id) throw new Error("owner is only allowed to get user data");
  const user = await UserModel.findOne({user_id}).exec();
  if(user == null) throw new Error("user is not found");
  const clientUserData = await ClientUserDataModel.findOneAndUpdate({client, user},{$set:{data}},{upsert:true}).exec();
  if(clientUserData == null) throw new Error("client user data is empty");
  return;
}