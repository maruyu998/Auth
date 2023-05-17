import express from 'express';
import config from 'config';
import * as oauthServer from '../process/oauthServer';
import { signin } from '../process/auth';
import { sendData, sendError } from '../utils/express';
import { getUserInfo } from '../utils/oauth';
import { requireBodyParams, requireQueryParams } from '../utils/middleware';
import { AuthenticationError, UnsupportedError } from '../utils/errors';

const router = express.Router();

// from client-server
router.get('/authorize', [
  requireQueryParams(
    "client_id","client_secret","redirect_uri","response_type",
    "scope","state", "code_challenge", "code_challenge_method"
  )
], async function(request, response){
  const { 
    client_id, client_secret, redirect_uri, response_type,
    scope, state, code_challenge, code_challenge_method
  } = response.locals.queries;
  const scopes = scope.split(" ");

  if(response_type != "code") return sendError(response, new UnsupportedError("only support response_type=code"));

  await oauthServer.authorizeClient({
    client_id, client_secret, redirect_uri, response_type, scopes, state, code_challenge, code_challenge_method
  })
  .catch(error=>{sendError(response, error); throw error;})
  .then(signin_token=>{
    const url = new URL("/signin", config.oauth_domain);
    url.searchParams.append("client_id", client_id);
    url.searchParams.append("redirect_uri", redirect_uri);
    url.searchParams.append("signin_token", signin_token);
    response.redirect(url.toString())
  })
  .catch(error=>null)
});

// from client-browser
router.post('/signin', [
  requireBodyParams("client_id", "signin_token", "user_name", "password")
], async function(request, response){
  const { client_id, signin_token, user_name, password } = response.locals.bodies;

  const success_signin = await signin({user_name, password, request});
  if(!success_signin) return sendError(response, new AuthenticationError("user_name or password is wrong"));

  const user = await getUserInfo(request);
  if(!user) return sendError(response, new AuthenticationError("current user is empty or unapproved."));

  await oauthServer.getCode({user_id:user.user_id, client_id, signin_token})
  .then(({redirect_uri, code, state})=>{
    const url = new URL(redirect_uri);
    url.searchParams.append("code", code);
    url.searchParams.append("state", state);
    sendData(response, "REDIRECT", "redirect", { redirect_uri: url.toString() })
  })
  .catch(error=>sendError(response, error))
});

router.post('/token', [
  requireBodyParams("code", "grant_type", "redirect_uri", "code_verifier")
], async function(request, response){
  const { code, grant_type, redirect_uri, code_verifier } = response.locals.bodies;

  if(grant_type != "authorization_code") return sendError(response, new UnsupportedError("only support grant_type=authorization_code"))

  await oauthServer.generateAccessToken({code, code_verifier})
  .catch(error=>{sendError(response, error); throw error})
  .then(token=>{
    response.json({...token, redirect_uri});
  })
})

export default router;