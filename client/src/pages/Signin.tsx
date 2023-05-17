import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { redirect, useLocation } from 'react-router-dom';
import { getPacket, postPacket } from 'mutils/fetch';
import * as arrayUtil from 'mutils/array';
import { MType } from '../components/MessageModal';

export default function Signin({
  showMessage
}:{
  showMessage:(title:string, message:string, type?:MType)=>void
}){

  const [ clientInfo, setClientInfo ] = useState<{client_id:string, signin_token:string, redirect_uri:string}|null>(null);
  const searchParams = new URLSearchParams(window.location.search);
  const client_id = searchParams.get('client_id');
  const signin_token = searchParams.get('signin_token');
  const redirect_uri = searchParams.get('redirect_uri');
  useEffect(()=>{
    if((()=>{
      if(clientInfo == null) return false;
      if(signin_token == null) return false;
      if(redirect_uri == null) return false;
      if(client_id == clientInfo.client_id) return true;
      if(signin_token == clientInfo.signin_token) return true;
      if(redirect_uri == clientInfo.redirect_uri) return true;
    })()) return

    if(client_id==null || signin_token==null || redirect_uri==null){
      location.href = "/api/oauth_client/signin";
    }else setClientInfo({client_id, signin_token, redirect_uri});
  }, [client_id, signin_token, redirect_uri])

  async function signin({user_name, password}){
    if(clientInfo==null) return; // unexpected
    const { client_id, signin_token } = clientInfo;
    await postPacket("/api/oauth/signin", { user_name, password, client_id, signin_token })
    .then(({data})=>data).then(({redirect_uri})=>{ location.href = redirect_uri })
    .catch(error=>{
      console.log(error)
      showMessage("Signin Failed", error.message, "danger");
    })
  }
  return (
    <Container className="mt-4" style={{maxWidth:"40rem"}}>
      { clientInfo != null && <>
        <h1>Signin</h1>
        <div className="card">
          <div className="card-body">
            <form onSubmit={e=>{
              e.preventDefault()
              signin({
                user_name: e.currentTarget.user_name.value,
                password: e.currentTarget.password.value
              })
            }}>
              <div className="mb-2">
                <label htmlFor="user_name" className="form-label">UserID</label>
                <input type="text" id="user_name" className="form-control form-control-lg" name="user_name" required autoFocus
                  onChange={e=>e.currentTarget.value=e.currentTarget.value.toLowerCase()}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" id="password" className="form-control form-control-lg" name="password"
                  aria-describedby="passwordHelpBlock" autoComplete="current-password" required />
              </div>
              <div className="mb-5 text-center">
                {/* <p className="mb-1">You are about to sign in for "{clientInfo.client_name}"</p> */}
                {/* <p className="mb-1">Scopes: {clientInfo.scopes.join(" ")}</p> */}
                {/* <p className="mb-1">Signin only when you are ok to be accessed by "{clientInfo.client_name}" app.</p> */}
              </div>
              <div className="d-grid mx-auto">
                <button className="btn btn-primary btn-lg" id='submit'>Signin and Concent</button>
                <p className="mt-3">if you do not have an account, please create an account from <a href='/signup'>here</a>.</p>
              </div>
            </form>
          </div>
        </div>
      </>}
    </Container>
  )
}