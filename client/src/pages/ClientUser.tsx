import { useState, useEffect } from "react";
import { Card, Container, Row } from "react-bootstrap";
import { getPacket, putPacket } from "mutils/fetch";
import { useSearchParams } from "react-router-dom";
import { ClientManagingType } from "../../../mtypes/Client";
import { UserClientDataManagingType } from "../../../mtypes/User";
import { MType } from "../components/MessageModal";

export default function ClientUser({
  showMessage
}:{
  showMessage:(title:string, message:string, type?:MType)=>void
}){

  const [ searchParams ] = useSearchParams();
  const [ client_id, setClientId ] = useState<string|null>(null);
  const [ user_id, setUserId ] = useState<string|null>(null);
  if(searchParams.get('client_id') != client_id) setClientId(searchParams.get('client_id'));
  if(searchParams.get('user_id') != user_id) setUserId(searchParams.get('user_id'));

  const [ userClientData, setUserClientData ] = useState<UserClientDataManagingType|null>(null);
  const [ data, setData ] = useState<Object>({});

  function getClientUserData(){
    if(client_id == null || user_id == null) return;
    const url = new URL("/api/managing/client_user", window.location.href);
    url.searchParams.append("client_id", client_id);
    url.searchParams.append("user_id", user_id);
    getPacket(url.toString()).then(({title,message,data})=>data).then(userClientData=>{
      setUserClientData(userClientData)
      setData(userClientData.data || {})
    })
  }
  useEffect(()=>{getClientUserData()}, [ client_id, user_id ]);

  const [ isInvalid, setIsInvalid ] = useState<boolean>(false);
  function updateInput(value){
    try{
      const json = JSON.parse(value)
      setData(json)
      setIsInvalid(false)
    }catch(e){
      setIsInvalid(true)
    }
  }

  function saveData(){
    putPacket("/api/managing/client_user", { user_id, client_id, data })
    .then(({title, message, data})=>showMessage(title, message))
    .catch(error=>showMessage(error.name, error.message, "warning"))
  }

  return (
  <Container className="mt-4">
  { userClientData && <>
    <h1 className="display-2" style={{fontSize:"3rem"}}>Setting - {userClientData.client_name} x {userClientData.user_name}</h1>
    <Card>
      <Card.Body>
        <textarea rows={10} className="w-100 form-control" onChange={e=>updateInput(e.currentTarget.value)} defaultValue={JSON.stringify(data)} />
        { isInvalid && <p className="text-danger">Invalid JSON</p> }
        { isInvalid || JSON.stringify(data)==JSON.stringify(userClientData.data) || 
          <button type="button" className="mt-2 btn btn-primary w-100" onClick={e=>saveData()}>Update</button>
        }
      </Card.Body>
    </Card>
  </>}
  </Container>
  )
}