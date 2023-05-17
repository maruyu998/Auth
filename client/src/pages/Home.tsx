import React, { useEffect, useState, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Header from '../components/Header';

export default function Home() {

  type LoadingState = "checkingLoggedIn"|"loggedIn"|"loggedOut"
  const [ loadingState, setLoadingState ] = useState<LoadingState>("checkingLoggedIn")
  useEffect(()=>{
    fetch('/api/get_user_info').then(res=>res.json()).then(({user_id})=>{ setLoadingState(user_id ? "loggedIn" : "loggedOut")})
  }, [])
  
  return (
    <>
      { loadingState == "checkingLoggedIn" && <div>Checking whether you are logged in ...</div> }
      { loadingState == "loggedOut" && <Navigate to={`/signin?redirect_uri=${window.location.pathname}`}/> }
      { loadingState == "loggedIn" && <>
        <Header/>
        <div className="container">
          <div><Link to="/waitings">Check Apps Waiting for Approval</Link></div>
          <div><Link to="/register">Register Apps</Link></div>
          <div><a href="/api/signout">Sign Out</a></div>
        </div>
      </>}
    </>
  )
}