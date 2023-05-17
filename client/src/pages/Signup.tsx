import { useState } from "react";
import { Container } from "react-bootstrap";
import { MType } from '../components/MessageModal';
import { postPacket } from "mutils/fetch";

export default function Signup({
  showMessage
}:{
  showMessage:(title:string, message:string, type?:MType)=>void
}){

  function signup({email, user_name, password}){
    postPacket("/api/auth/signup", {email, user_name, password})
    .then(({title, message})=>{ showMessage(title, message, "info") })
    .catch((error:Error)=>{ showMessage("Signup Failed", error.message, "warning") })
  }

  return (
    <Container className="mt-4" style={{maxWidth:"40rem"}}>
      <h1>Signup</h1>
      <div className="card">
        <div className="card-body">
          <form onSubmit={e=>{
            e.preventDefault()
            signup({
              email: e.currentTarget.email.value,
              user_name: e.currentTarget.user_name.value,
              password: e.currentTarget.password.value
            })
          }}>
            <div className="mb-2">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" id="email" className="form-control form-control-lg" name="email" required autoFocus />
            </div>
            <div className="mb-2">
              <label htmlFor="user_name" className="form-label">User name</label>
              <input type="text" id="user_name" className="form-control form-control-lg" name="user_name" required 
                onChange={e=>e.currentTarget.value=e.currentTarget.value.toLowerCase()}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" id="password" className="form-control form-control-lg" name="password"
                aria-describedby="passwordHelpBlock" autoComplete="new-password" required />
            </div>
            <div className="d-grid mx-auto">
              <button className="btn btn-primary btn-lg" id='submit'>Signup</button>
              <a className="mt-3" href="/signin">Do you have your account?</a>
            </div>
          </form>
        </div>
      </div>
    </Container>
  )
}