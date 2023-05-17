import express from 'express';
import { sendData, sendMessage } from '../utils/express';
import { signin, signup } from '../process/auth';
import { requireBodyParams, requireSignin } from '../utils/middleware';
import * as maruyuOAuthClient from '../utils/oauth';

const router = express.Router();

router.post('/signup', [
  requireBodyParams("user_name", "password")
], async function(request, response){
  // return sendMessage(response, "SignupFailed", "Currently, signup is limited.");
  const { user_name, password } = response.locals.bodies;
  
  const user = await signup({user_name, password, request});
  if(user == null) return sendMessage(response, "SignupFailed", "Signup is failed. user_name may be already taken.")
  return sendMessage(response, "SignupSuccess", `Signup is successed. user_id: ${user!.user_id}`);
});

router.post('/signin', [
  requireBodyParams("user_name", "password")
], async function(request, response){
  const { user_name, password } = response.locals.bodies;
  
  const success = signin({user_name, password, request});
  if(!success) return sendMessage(response, "SigninFailed", "Signin is failed");
  return sendMessage(response, "SigninSuccess", "Signin is successed.");
})

router.get('/me', requireSignin, async function(reqiest, response){
  const user = await maruyuOAuthClient.getUserInfo(reqiest);
  sendData(response, "Me", "Me info is here", user)
});

export default router;