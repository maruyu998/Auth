import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';

export type MType = "info"|"warning"|"danger";
export type MDataType = {
  title: string,
  message: string,
  type: MType
}

export default function MessageModal({
  modalIsOpen,
  closeModal,
  messageData
}:{
  modalIsOpen: boolean,
  closeModal,
  messageData: MDataType|null
}){
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
      contentClassName={messageData ? `bg-${messageData.type}`: ""}
    >
      {
        messageData && <>
          <Modal.Header><Modal.Title>{messageData.title}</Modal.Title></Modal.Header>
          <Modal.Body>
            <p>{messageData.message}</p>
          </Modal.Body>
          <Modal.Footer>
            <button type="button" className="btn btn-info" onClick={closeModal}>Close</button>
          </Modal.Footer>
        </>
      }
    </Modal>
  )
}