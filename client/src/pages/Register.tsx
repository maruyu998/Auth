import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { postPacket } from 'mutils/fetch';
import { MType } from '../components/MessageModal';

export default function Register({
  showMessage
}:{
  showMessage:(title:string, message:string, type?:MType)=>void
}){

  function register({client_name, redirect_uri}){
    postPacket("/api/managing/client", {client_name, redirect_uri}).then(({title,message,data})=>{
      const { client_id, client_secret } = data;
      showMessage(title, [message,`client_id=${client_id}`,`client_secret=${client_secret}`].join("\n"))
    })
    .catch(error=>showMessage("Register Failed", error.message, "warning"));
  }

  return (
    <Container className="mt-4" style={{maxWidth:"40rem"}}>
      <h1>Register client</h1>
      <div className="card">
        <div className="card-body">
          <form onSubmit={e=>{
            e.preventDefault()
            register({
              client_name: e.currentTarget.client_name.value,
              redirect_uri: e.currentTarget.redirect_uri.value,
            })
          }}>
            <div className="mb-2">
              <label htmlFor="client_name" className="form-label">Client name</label>
              <input type="text" id="client_name" className="form-control form-control-lg" name="client_name" required autoFocus 
                onChange={e=>e.currentTarget.value=e.currentTarget.value.toLowerCase()}
              />
            </div>
            <div className="mb-2">
              <label htmlFor="redirect_uri" className="form-label">Redirect Uri</label>
              <input type="text" id="redirect_uri" className="form-control form-control-lg" name="redirect_uri" required autoFocus />
            </div>
            <div className="d-grid my-3 mx-auto">
              <input type="submit" value="Create Token" className="btn btn-primary btn-lg" />
            </div>
          </form>
        </div>
      </div>
    </Container>
  )
}