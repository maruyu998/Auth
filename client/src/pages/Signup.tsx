import { useState } from "react";
import Header from "../components/Header";
import MessageModal, { MessageModalData } from "../components/MessageModal";

export default function Signup(){
  
  const defaultMessageModalData = {title:"", message:""}
  const [ isMessageModalOpen, setIsMessageModalOpen ] = useState<boolean>(false)
  const [ messageModalData, setMessageModalData ] = useState<MessageModalData>(defaultMessageModalData)

  function signup({email, user_id, password}){
    fetch("/api/signup_user", {
      method:"POST", 
      headers:{'Accept': 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({ email, user_id, password })
    })
    .then(res=>res.json())
    .then(({title, message})=>{
      setMessageModalData({title, message, type:'info'})
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
      <Header />
      <MessageModal 
        modalIsOpen={isMessageModalOpen}
        closeModal={closeMessageModal}
        messageModalData={messageModalData}
      />
      <div className="row justify-content-center" style={{height:"auto"}}>
        <div className="login-form col-11 col-sm-10 col-md-9 col-lg-8 col-xl-6 col-xxl-3 mt-2">
          <h1>Signup</h1>
          <div className="card">
            <div className="card-body">
              <form onSubmit={e=>{
                e.preventDefault()
                signup({
                  email: e.currentTarget.email.value,
                  user_id: e.currentTarget.user_id.value,
                  password: e.currentTarget.password.value
                })
              }}>
                <div className="mb-2">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" id="email" className="form-control form-control-lg" name="email" required autoFocus />
                </div>
                <div className="mb-2">
                  <label htmlFor="user_id" className="form-label">UserID</label>
                  <input type="text" id="user_id" className="form-control form-control-lg" name="user_id" required autoFocus />
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
        </div>
      </div>
    </div>
  )
}