import express from 'express';
import { sendMessage, sendData, sendError } from '../utils/express';
import { ClientUserDataType } from '../model/ClientUserData';
import { requireAuthorization } from '../utils/middleware';
import { UserType } from '../../mtypes/User';
import { OAuthTokenType } from '../../mtypes/OAuthToken';

// EXPECT From Client Server

// IN THIS ROUTING, 
// - AUTHENTICATION IS ASSURED.
// - response.locals.authentication is available.

const router = express.Router();

// client request user info from client server with access_token
router.get('/user', requireAuthorization, async function(request, response){
  const { user, oauthToken, clientUserData } = response.locals.authentication as { 
    user: UserType, oauthToken: OAuthTokenType, clientUserData: ClientUserDataType
  };
  const userData = {
    user_id: user.user_id,
    user_name: user.user_name,
    data: clientUserData.data
  }
  return sendData(response, "UserData", `UserData`, userData)
});

// client set user data 
router.post('/user', async function(request, response){
  const { user, oauthToken, clientUserData } = response.locals.authentication as { 
    user: UserType, oauthToken: OAuthTokenType, clientUserData: ClientUserDataType
  };
  sendMessage(response, "Not Implemented", "please edit router/client.ts");
})

export default router;