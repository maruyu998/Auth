import { useState } from "react";
import { Container } from "react-bootstrap";

export default function Account(){
  
  function signout(){
    location.href = "/api/oauth_client/signout"
  }

  return (
    <>
      <Container className="mt-4" style={{maxWidth:"40rem"}}>
        <h1>Account</h1>
        <div className="card">
          <div className="card-body">
            <form onSubmit={e=>{
              e.preventDefault()
              signout()
            }}>
              <div className="d-grid mx-auto">
                <button className="btn btn-primary btn-lg" id='submit'>Signout</button>
                <p className="mt-3">Caution, You will log out only auth app (this page)</p>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </>
  )
}