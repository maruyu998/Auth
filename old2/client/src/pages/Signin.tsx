import React, { useState } from 'react';
import Header from '../components/Header';
import MessageModal, { MessageModalData } from '../components/MessageModal';

export default function Signin(){

  const defaultMessageModalData = {title:"", message:""}
  const [ isMessageModalOpen, setIsMessageModalOpen ] = useState<boolean>(false)
  const [ messageModalData, setMessageModalData ] = useState<MessageModalData>(defaultMessageModalData)

  function signin({user_id, password}){
    const queries = Array.from((new URL(window.location.href)).searchParams.entries())
                    .map(([key,value])=>({[key]:value}))
                    .reduce((left,right)=>Object.assign(left, right), {})
    fetch("/api/get_access_token", {
      method:"POST", 
      headers:{'Accept': 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({ ...queries, user_id, password })
    })
    .then(res=>res.json())
    .then(({title, message, redirect_uri, access_token})=>{
      const url = new URL(redirect_uri, window.location.origin)
      if(access_token) url.searchParams.append('access_token', access_token)
      setMessageModalData({title, message, redirect_uri:String(url), type:'info'})
      setIsMessageModalOpen(true)
    })
    .catch(packet=>{
      console.error(packet)
      const {title, message} = packet.json()
      setMessageModalData({title, message, type:'warning'})
      setIsMessageModalOpen(true)
    })
  }

  function closeMessageModal(){
    setMessageModalData(defaultMessageModalData)
    setIsMessageModalOpen(false)
  }

  return (
    <div>
      <Header/>
      <MessageModal 
        modalIsOpen={isMessageModalOpen}
        closeModal={closeMessageModal}
        messageModalData={messageModalData}
      />
      <div className="row justify-content-center" style={{height:"auto"}}>
        <div className="login-form col-11 col-sm-10 col-md-9 col-lg-8 col-xl-6 col-xxl-3 mt-2">
          <h1>Signin</h1>
          <div className="card">
            <div className="card-body">
              <form onSubmit={e=>{
                e.preventDefault()
                signin({
                  user_id: e.currentTarget.user_id.value,
                  password: e.currentTarget.password.value
                })
              }}>
                <div className="mb-2">
                  <label htmlFor="user_id" className="form-label">UserID</label>
                  <input type="text" id="user_id" className="form-control form-control-lg" name="user_id" required autoFocus />
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input type="password" id="password" className="form-control form-control-lg" name="password"
                    aria-describedby="passwordHelpBlock" autoComplete="current-password" required />
                </div>
                <div className="d-grid mx-auto">
                  <button className="btn btn-primary btn-lg" id='submit'>Signin</button>
                  <p className="mt-3">if you do not have an account, please create an account from <a href='/signup'>here</a>.</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}