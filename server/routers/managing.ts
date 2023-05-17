import express from 'express';
import { InvalidParamError } from '../utils/errors';
import { sendMessage, sendData, sendError } from '../utils/express';
import { requirePermission, requireQueryParams, requireBodyParams } from '../utils/middleware';

import { UserInfoType } from '../utils/oauth';
import * as managing from '../process/managing';

import { UserStatusType, UserStatuses } from '../../mtypes/User';
import { ClientStatusType, ClientStatuses } from '../../mtypes/Client';

// IN THIS ROUTING, 
// - SIGNED IN IS ASSURED.
// - response.locals.current_user_info:UserInfo is available.

const router = express.Router();

router.get('/clients', async function(request, response){
  const current_user_info = response.locals.current_user_info as UserInfoType;
  await managing.getClients(current_user_info.user_id)
  .then(clients=>sendData(response, "FetchClientsSuccess", `Fetching ${clients.length} clients is successed`, {clients}))
  .catch(error=>sendError(response, error))
});

router.post("/client", [
  requirePermission("REGISTER_CLIENT"),
  requireBodyParams("client_name", "redirect_uri")
], async function(request, response){
  const current_user_info = response.locals.current_user_info as UserInfoType;
  const { client_name, redirect_uri } = response.locals.bodies;

  await managing.registerClient(client_name, redirect_uri, current_user_info.user_id)
  .then(({client_id,client_secret})=>sendData(response,"ClientRegisterSuccess","",{ client_id,client_secret }))
  .catch(error=>sendError(response, error))
})

router.put("/client", [
  requirePermission("REVIEW_CLIENT"),
  requireBodyParams("client_id","review")
], async function(request, response){
  const current_user_info = response.locals.current_user_info as UserInfoType;
  const { client_id, review } = response.locals.bodies;
  if(!ClientStatuses.includes(review) && review != "waiting") return sendError(response, new InvalidParamError("review"));
  
  await managing.reviewClient(client_id, review as Exclude<ClientStatusType,"waiting">, current_user_info.user_id)
  .then(()=>sendMessage(response, "ReviewSuccess", "review client is succeeded."))
  .catch(error=>sendError(response, error))
})

router.get('/client', [
  requireQueryParams("client_id")
], async function(request, response){
  const current_user_info = response.locals.current_user_info as UserInfoType;
  const { client_id } = response.locals.queries;

  await managing.getClientInfo(client_id, current_user_info.user_id)
  .then(({client, users})=>sendData(response, "ClientInfo", "client info", {client, users} ))
  .catch(error=>sendError(response, error))
})

router.get('/client_user', [
  requireQueryParams("user_id","client_id")
], async function(request, response){
  const current_user_info = response.locals.current_user_info as UserInfoType;
  const { user_id, client_id } = response.locals.queries;

  await managing.getClientUserData(user_id, client_id, current_user_info.user_id)
  .then(userClientDataManaging=>sendData(response, "ClientUserData", "", userClientDataManaging))
  .catch(error=>sendError(response, error))
})

router.put('/client_user', [
  requireBodyParams("user_id","client_id", "data")
], async function(request, response){
  const current_user_info = response.locals.current_user_info as UserInfoType;
  const { user_id, client_id, data } = response.locals.bodies;
  if(typeof data != "object") return sendError(response, new InvalidParamError("data must be object"));
  
  await managing.updateClientUserData(user_id, client_id, data, current_user_info.user_id)
  .then(()=>sendMessage(response, "UpdateClientUserDataSuccessed", "updation process successfully."))
  .catch(error=>sendError(response, error))
})

export default router;