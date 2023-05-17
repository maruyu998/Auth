import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import MessageModal, { MessageModalData } from '../components/MessageModal';

export default function Register(){
    
  type LoadingState = "checkingLoggedIn"|"loggedIn"|"loggedOut"
  const [ loadingState, setLoadingState ] = useState<LoadingState>("checkingLoggedIn")
  useEffect(()=>{
    fetch('/api/get_user_info').then(res=>res.json()).then(({user_id})=>{
      if(user_id) setLoadingState("loggedIn")
      else setLoadingState("loggedOut")
    })
  }, [])
  
  const defaultMessageModalData = {title:"", message:""}
  const [ isMessageModalOpen, setIsMessageModalOpen ] = useState<boolean>(false)
  const [ messageModalData, setMessageModalData ] = useState<MessageModalData>(defaultMessageModalData)

  function register({app_id}){
    fetch('/api/app_register', {
      method: "POST",
      headers:{'Accept': 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({app_id})
    }).then(res=>res.json()).then(({title, message, details})=>{
      console.log({title, message, details})
      setMessageModalData({title, message})
      setIsMessageModalOpen(true)
    })
  }
  
  function closeMessageModal(){
    setMessageModalData(defaultMessageModalData)
    setIsMessageModalOpen(false)
  }

  return (
    <>
      { loadingState == "checkingLoggedIn" && <div>Checking whether you are logged in ...</div> }
      { loadingState == "loggedOut" && <Navigate to={`/signin?redirect_uri=${window.location.pathname}`}/> }
      { loadingState == "loggedIn" && <>
        <MessageModal 
          modalIsOpen={isMessageModalOpen}
          closeModal={closeMessageModal}
          messageModalData={messageModalData}
        />
        <Header />
        <div className="row justify-content-center" style={{height:"auto"}}>
          <div className="login-form col-11 col-sm-10 col-md-9 col-lg-8 col-xl-6 col-xxl-3 mt-5">
            <h1>Register application</h1>
            <div className="card">
              <div className="card-body">
                <form onSubmit={e=>{
                  e.preventDefault()
                  console.log(e.currentTarget.app_id.value)
                  register({ app_id: e.currentTarget.app_id.value })
                }}>
                  <div className="mb-2">
                    <label htmlFor="app_id" className="form-label">Application name</label>
                    <input type="text" id="app_id" className="form-control form-control-lg" name="app_id" required autoFocus />
                  </div>
                  <div className="d-grid mx-auto">
                    <input type="submit" value="Create Token" className="btn btn-primary btn-lg" />
                  </div>
                </form>
              </div>
            </div>
            <div className="card" id="token_card" style={{display:"none"}}>
              <div className="card-body">
                <div className="mb-2"><p>Issued Token:</p><p id="token"></p></div>
              </div>
            </div>
          </div>
        </div>
      </>}
    </>
  )
}