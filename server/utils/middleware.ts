import express from 'express';
import { sendError } from './express';
import { AuthPermissionType, userHasPermissions } from '../process/managing';
import { getUserInfo } from './oauth';
import { OAuthTokenModel } from '../model/OAuthToken';
import { AuthenticationError, InvalidParamError, PermissionError, UnexpectedError } from './errors';
import { ClientUserDataModel } from '../model/ClientUserData';
import { UserModel } from '../model/User';

export async function requireSignin(
  request:express.Request, 
  response:express.Response, 
  next:express.NextFunction
){
  const current_user_info = await getUserInfo(request)
  if(current_user_info) {
    response.locals.current_user_info = current_user_info
    return next()
  }
  sendError(response, new AuthenticationError("Sign in is required"))
}

export function requireQueryParams(...param_names:string[]){
  return ( request: express.Request, response: express.Response, next: express.NextFunction ) => {
    response.locals.queries = {}
    for(let param_name of param_names){
      if(request.query[param_name] == undefined) return sendError(response, new InvalidParamError(param_name));
      response.locals.queries[param_name] = String(request.query[param_name])
    }
    next()
  }
}

export function requireBodyParams(...param_names:string[]){
  return ( request: express.Request, response: express.Response, next: express.NextFunction ) => {
    response.locals.bodies = {}
    for(let param_name of param_names){
      if(request.body[param_name] == undefined) return sendError(response, new InvalidParamError(param_name));
      response.locals.bodies[param_name] = request.body[param_name]
    }
    next()
  }
}

export function requirePermission(
  ...permissions:AuthPermissionType[]
){
  return async (
    request:express.Request, 
    response:express.Response, 
    next:express.NextFunction
  )=>{
    const user = await getUserInfo(request);
    if(!user) return sendError(response, new AuthenticationError("Sign in is required."));
    if(await userHasPermissions(user.user_id, permissions)) return next();
    sendError(response, new PermissionError("User does not have previleges."));
  }
}

export async function requireAuthorization(
  request:express.Request, 
  response:express.Response, 
  next:express.NextFunction
){
  const authorization = request.get("Authorization");
  if(authorization == undefined) return sendError(response, new AuthenticationError("authorization is required."));
  const access_token = authorization.split(" ")[1];
  if(access_token == undefined) return sendError(response, new AuthenticationError("authorization is invalid."));

  const oauthToken = await OAuthTokenModel.findOne({ access_token, expires_at: {$gt: new Date()} }).exec();
  if(oauthToken == null) return sendError(response, new AuthenticationError("authorization is not found."));
  const clientUserData = await ClientUserDataModel.findOne({user: oauthToken.user, client: oauthToken.client}).exec();
  if(clientUserData == null) return sendError(response, new AuthenticationError("userdata is not found."));
  const user = await UserModel.findById(oauthToken.user).exec();
  if(user == null) return sendError(response, new UnexpectedError("user is not found."));

  response.locals.authentication = { user, oauthToken, clientUserData }
  next()
}