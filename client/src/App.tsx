import React, { useEffect, useState } from 'react';
import { useStateRef } from './utils/ReactUse';
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import './App.scss';
import Header from './components/Header';
import Home from './pages/Home';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Client from './pages/Client';
import Clients from './pages/Clients';
import Register from './pages/Register';
import Account from './pages/Account';
import ClientUser from './pages/ClientUser';
import MessageModal, { MType, MDataType } from './components/MessageModal';

export default function App() {

  const [ , setUser, userRef ] = useStateRef<{user_id:string,user_name:string}|null>(null);
  const [ , setLoadingStatus, loadingStatusRef ] = useStateRef<"checking"|"loggedin"|"loggedout">("checking");

  const Red = <Navigate replace to={`/signin?redirect_uri=${window.location.pathname}`}/>
  const conditionJSX = (jsx) => loadingStatusRef.current == "checking" ? <></> 
                              : loadingStatusRef.current == "loggedin" ? jsx : Red

  const [ isMessageModalOpen, setIsMessageModalOpen ] = useState<boolean>(false);
  const [ messageData, setMessageData ] = useState<MDataType|null>(null);
  function showMessage(title:string, message:string, type:MType="info"){
    setMessageData({title, message, type})
    setIsMessageModalOpen(true)
  }
  function closeMessageModal(){
    setMessageData(null);
    setIsMessageModalOpen(false);
  }

  return (
    <BrowserRouter>
      <Header userRef={userRef} setUser={setUser} loadingStatusRef={loadingStatusRef} setLoadingStatus={setLoadingStatus}/>
      <MessageModal 
        modalIsOpen={isMessageModalOpen}
        closeModal={closeMessageModal}
        messageData={messageData}
      />
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/signin" element={<Signin showMessage={showMessage}/>}></Route>
        <Route path="/signup" element={<Signup showMessage={showMessage}/>}></Route>
        <Route path="/client" element={conditionJSX(<Client showMessage={showMessage}/>)}></Route>
        <Route path="/clients" element={conditionJSX(<Clients showMessage={showMessage} userRef={userRef}/>)}></Route>
        <Route path="/register" element={conditionJSX(<Register showMessage={showMessage}/>)}></Route>
        <Route path="/account" element={conditionJSX(<Account/>)}></Route>
        <Route path="/client_user" element={conditionJSX(<ClientUser showMessage={showMessage}/>)}></Route>
      </Routes>
    </BrowserRouter>
  );
}