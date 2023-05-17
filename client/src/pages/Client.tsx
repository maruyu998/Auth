import { useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Col, Container, Row, Table } from "react-bootstrap";
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { UserClientDataManagingType } from "../../../mtypes/User";
import { getPacket, postPacket, putPacket } from "mutils/fetch";
import { MType } from "../components/MessageModal";
import { ClientManagingType } from "../../../mtypes/Client";
import MDate from "mutils/mdate";

export default function Client({
  showMessage
}:{
  showMessage:(title:string, message:string, type?:MType)=>void
}){

  const [ searchParams, setSearchParams ] = useSearchParams();
  const [ client_id, setClientId ] = useState<string|null>(null);
  if(searchParams.get("client_id") != client_id) setClientId(searchParams.get("client_id"));

  const [ client, setClient ] = useState<ClientManagingType|null>(null);
  const [ users, setUsers ] = useState<UserClientDataManagingType[]>([]);
  
  function getClientData(){
    if(client_id == null) return;
    const url = new URL("/api/managing/client", window.location.href)
    url.searchParams.append("client_id", client_id);
    getPacket(url.toString()).then(({title, message, data})=>data)
    .then(({client, users})=>{setClient(client); setUsers(users)})
    .catch(error=>{console.error(error)})
  }
  useEffect(()=>{getClientData()}, [client_id])

  return (
  <Container className="mt-4">
  { client && <>
    <h1 className="display-2" style={{fontSize:"4rem"}}>Setting - {client.client_name}</h1>
    <p className="display-6" style={{fontSize:"2rem"}}>Basic Info</p>
    <Card>
      <Card.Body>
        <p className="mb-1">client_id: {client.client_id}</p>
        <p className="mb-1">redirect_uri: {client.redirect_uri}</p>
        <p className="mb-1">client_owner: {client.client_owner.user_name}</p>
        { client.reviewed_by &&
          <p className="mb-1">reviewed_by: {client.reviewed_by.user_name}</p>
        }
      </Card.Body>
    </Card>
    <p className="display-6 mt-4">
      <span style={{fontSize:"2rem"}}>Users</span>
      <span style={{fontSize:"1rem"}}> managed by auth.maruyu.work</span>
    </p>
    <Row>
      {
        users.map(user=>{
          const { user_id:_user_id, user_name, created_at } = user;
          return (
            <Col key={_user_id} className={["mb-2", "col-12 col-sm-6 col-md-4 col-lg-3"].join(" ")}>
              <Card>
                <Card.Body>
                  <h1 className="display-6">{user_name}</h1>
                  <p className="mb-2">{_user_id}</p>
                  <p className="mb-1" style={{fontSize:"0.8em"}}>CreatedAt: {new MDate(created_at.getTime()).format("YYYY/MM/DD HH:mm:ss")}</p>
                </Card.Body>
                <Card.Footer>
                  <Link to={`/client_user?client_id=${client_id}&user_id=${_user_id}`}>
                    <span className="btn btn-outline-secondary w-100">Setting</span>
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          )
        })
      }
      </Row>
  </>}
  </Container>
  )
}