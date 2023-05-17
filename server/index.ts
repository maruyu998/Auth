import express from "express";
import config from "config";
import session from "express-session";
import connect_mongo_session from "connect-mongodb-session";
import mongoose from 'mongoose';
import { server as moauthServer } from 'moauth';
import path from 'path';
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import cors from 'cors';

const PORT = (process.env.NODE_ENV == "production") ? process.env.PRODUCTION_PORT : 3000

declare module 'express-session' {
  interface SessionData {
    moauth_user_id: string
  }
}

mongoose.Promise = global.Promise;
mongoose.connect(config.mongo_path);
mongoose.connection.on('error', function(err) {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
});

const MongoDBStore = connect_mongo_session(session);

;(async ()=>{
  const mongo_collection = await new MongoClient(config.mongo_path).connect().then(async mongoClient => mongoClient.db(config.mongo_dbname).collection('all'))
  const moauth = new moauthServer({
    mongo_collection,
    hash_salt: config.hash_salt,
    user_signin_server_path: '/signin',
    app_id: config.app_id, 
    app_secret: config.app_secret
  })
  const _15MINUTES = 15 * 60 * 1000
  const app: express.Express = express();
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }));
  app.use(session({
    secret: config.session_secret,
    store: new MongoDBStore({
      uri: config.mongo_path,
      collectionName: 'sessions',
      autoRemove: 'native'
    }),
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
      httpOnly: true,
      maxAge: _15MINUTES
    }
  }))
  
  app.use(moauth.record_log)
  app.use('/waitings', moauth.require_signin, express.static(path.join(__dirname, '..', 'client', 'public', 'index.html')))
  app.use('/register', moauth.require_signin, express.static(path.join(__dirname, '..', 'client', 'public', 'index.html')))
  app.use('/logs', moauth.require_signin, express.static(path.join(__dirname, '..', 'client', 'public', 'index.html')))

  app.use('/signin', cors({
    credentials: true,
    optionsSuccessStatus: 301
  }), moauth.redirect_to_added_app_token_uri, express.static(path.join(__dirname, '..', 'client', 'public', 'index.html')))
  // app.use('/signup', express.static(path.join(__dirname, '..', 'client', 'public', 'index.html')))
  
  app.get('/api/signout', moauth.require_signin, (req,res)=>req.session.destroy(()=>res.redirect('/')))

  app.post('/api/get_app_token', moauth.issue_and_send_app_token)
  app.get('/api/get_user_info', moauth.get_signed_in_user_info)
  app.post('/api/signup_user', moauth.signup_user)
  
  app.post('/api/get_access_token', moauth.get_access_token)
  app.post('/api/validate_access_token', moauth.validate_access_token)
  app.post('/api/app_register', moauth.require_signin, moauth.app_register)
  app.get('/api/get_waitings', moauth.require_signin, moauth.get_waitings)
  app.post('/api/review_waiting', moauth.require_signin, moauth.review_waiting)
  
  app.get('/api/get_logs', moauth.require_signin, moauth.get_logs)
  
  app.use(express.static(path.join(__dirname, '..', 'client', 'public')))
  app.get('*', express.static(path.join(__dirname, '..', 'client', 'public', 'index.html')))
  
  app.listen(PORT, ()=>{
    console.log(`starting: listening port ${PORT}`)
  })
})()
