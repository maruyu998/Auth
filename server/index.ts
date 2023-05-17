import express from "express";
import config from "config";
import session from "express-session";
import connect_mongo_session from "connect-mongodb-session";
import mongoose from 'mongoose';
import path from 'path';
import 'dotenv/config';
import cors from 'cors';
import register from "./register";
import authRouter from './routers/auth';
import oAuthServerRouter from './routers/oauthServer';
import managingRouter from './routers/managing';
import clientRouter from './routers/client';
import * as maruyuOAuthClient from './utils/oauth';

import { requireAuthorization, requireSignin } from "./utils/middleware";

const PORT = (process.env.NODE_ENV == "production") ? process.env.PRODUCTION_PORT : 3000;
const INDEX_PATH = path.join(__dirname, '..', 'client', 'public', 'index.html');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongo_path);
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});
const MongoDBStore = connect_mongo_session(session);

declare module 'express-session' {
  interface SessionData {
    maruyuOAuth: maruyuOAuthClient.SessionType
  }
}

const app: express.Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: config.session_secret,
  store: new MongoDBStore({
    uri: config.mongo_session_path,
    collection: config.mongo_session_collection,
    autoRemove: 'native'
  }),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: false, 
    maxAge: config.session_keep_duration
  }
}));

// app.get(config.oauth_callback_path, maruyuOAuthClient.processCallbackThenRedirect);
// app.get('/signout', maruyuOAuthClient.signoutThenRedirectTop);
// app.use(maruyuOAuthClient.requirePermission(["ACCESS_SERVICE"]));
app.get('/api/oauth_client/callback', maruyuOAuthClient.processCallbackThenRedirect);
app.get('/api/oauth_client/signin', maruyuOAuthClient.redirectToSignin);
app.get('/api/oauth_client/signout', requireSignin, maruyuOAuthClient.signoutThenRedirectTop);
app.use('/api/auth', authRouter);
app.use('/api/oauth', oAuthServerRouter);
app.use('/api/client', requireAuthorization, clientRouter);
app.use('/api/managing', requireSignin, managingRouter);

// files
app.use(express.static(path.join(__dirname, '..', 'client', 'public')));

// indexs
app.use('/account', express.static(INDEX_PATH));
app.use('/client', express.static(INDEX_PATH));
app.use('/clients', express.static(INDEX_PATH));
app.use('/register', express.static(INDEX_PATH));
app.use('/client_user', express.static(INDEX_PATH));
app.use('/signup', express.static(INDEX_PATH));
app.use('/signin', cors({credentials:true,optionsSuccessStatus:302}), express.static(INDEX_PATH));
app.use(express.static(INDEX_PATH));

app.listen(PORT, ()=>{
  console.log(`starting: listening port ${PORT}`);
});

register()