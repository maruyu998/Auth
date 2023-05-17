import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import MDate from "../../../mutils/mdate";
import { Navigate, Link } from 'react-router-dom';
import Header from '../components/Header';

export default function Waitings(){

  type LoadingState = "checkingLoggedIn"|"loggedIn"|"loggedOut"
  const [ loadingState, setLoadingState ] = useState<LoadingState>("checkingLoggedIn")
  useEffect(()=>{
    fetch('/api/get_user_info').then(res=>res.json()).then(({user_id})=>{ setLoadingState(user_id ? "loggedIn" : "loggedOut")})
  }, [])

  type AppWaiting = {
    waiting_id: string,
    app_id: string,
    app_secret: string,
    owner_id: string,
    registered_at: MDate
  }
  const [ appWaitings, setAppWaitings ] = useState<AppWaiting[]>([])
  type UserWaiting = {
    waiting_id: string,
    user_id: string,
    email: string,
    registered_at: MDate
  }
  const [ userWaitings, setUserWaitings ] = useState<UserWaiting[]>([])

  function getWaitings(){
    fetch('/api/get_waitings').then(res=>res.json()).then(res=>res.details).then(({users, apps})=>{
      setUserWaitings(users.map(user=>({...user, registered_at:MDate.parse(user.registered_at)})))
      setAppWaitings(apps.map(app=>({...app, owner_id:app.user_id, registered_at:MDate.parse(app.registered_at)})))
      console.log({users, apps})
    })
  }

  useEffect(getWaitings, [])

  function sendReview({waiting_id, review}){
    fetch('/api/review_waiting', {
      method:"POST", 
      headers:{'Accept': 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({ waiting_id, review })
    }).then(res=>{
      getWaitings()
    })
  }

  return (
    <>
      { loadingState == "checkingLoggedIn" && <div>Checking whether you are logged in ...</div> }
      { loadingState == "loggedOut" && <Navigate to={`/signin?redirect_uri=${window.location.pathname}`}/> }
      {
        loadingState == "loggedIn" && <>
          <Header/>
          <div className="row justify-content-center" style={{height:"auto"}}>
            <div className="login-form col-11 col-sm-11 col-md-11 col-lg-8 col-xl-7 col-xxl-6 mt-5">
              <h1>Waiting</h1>
              <h5>Apps</h5>
              <table className="table">
                <thead><tr>{ ["AppId","OwnerId","RegisteredAt","AppSecret","Review"].map(text=><th scope="col">{text}</th>) }</tr></thead>
                <tbody>
                  {
                    appWaitings.map(({waiting_id, app_id, owner_id, registered_at, app_secret})=>(
                      <tr key={waiting_id}>
                        <td>{app_id}</td><td>{owner_id}</td><td>{registered_at.format("YYYY/MM/DD hh:mm:ss")}</td><td>{app_secret}</td>
                        <td>
                          <button type="button" className="btn btn-sm btn-success" 
                            onClick={e=>sendReview({waiting_id, review:"approve"})}>Approve</button>
                          <button type="button" className="btn btn-sm btn-danger" 
                            onClick={e=>sendReview({waiting_id, review:"reject"})}>Reject</button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
              <h5>Users</h5>
              <table className="table">
                <thead><tr>{ ["WaitingId","UserId","Email","RegisterdAt","Review"].map(text=><th scope="col">{text}</th>) }</tr></thead>
                <tbody>
                  {
                    userWaitings.map(({waiting_id, user_id, email, registered_at})=>(
                      <tr key={waiting_id}>
                        <th>{waiting_id}</th><td>{user_id}</td><td>{email}</td><td>{registered_at.format("YYYY/MM/DD hh:mm:ss")}</td>
                        <td>
                          <button type="button" className="btn btn-sm btn-success" 
                            onClick={e=>sendReview({waiting_id, review:"approve"})}>Approve</button>
                          <button type="button" className="btn btn-sm btn-danger" 
                            onClick={e=>sendReview({waiting_id, review:"reject"})}>Reject</button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </>
      }
    </>
  )
}