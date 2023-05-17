import React from 'react';
import { Modal } from 'react-bootstrap';

export type MessageModalData = {
  title: string,
  message: string,
  redirect_uri?: string,
  type?: 'info'|'warning'|'danger'
}

export default function MessageModal({
  modalIsOpen,
  closeModal,
  messageModalData
}:{
  modalIsOpen: boolean,
  closeModal,
  messageModalData: MessageModalData
}){
  
  const { title, message, redirect_uri, type } = messageModalData

  return (
    <Modal
      aria-labelledby="contained-modal-title-vcenter" 
      show={modalIsOpen} 
      onShow={()=>{}}
      onHide={closeModal}
      animation={true}
      centered={true}
      scrollable={true}
      size="lg"
      contentClassName={type ? `bg-${type}` : 'bg-light'}
    >
      <Modal.Title>{title}</Modal.Title>
      <Modal.Body>
        <p>{message}</p>
        {redirect_uri &&
          <div>
            <p style={{fontSize:"0.8em"}}>Redirect to <a href={redirect_uri}>{redirect_uri}</a></p>
          </div>
        }
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-info" onClick={closeModal}>Close</button>
        { redirect_uri &&
          <button type="button" className="btn btn-primary" onClick={e=>{
            if(location) location.href = redirect_uri
          }}>Redirect</button>
        }
      </Modal.Footer>
    </Modal>
  )
}