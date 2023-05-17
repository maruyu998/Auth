import { useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Col, Container, Row, Table } from "react-bootstrap";
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { getPacket, putPacket } from "mutils/fetch";
import { ClientManagingType } from "../../../mtypes/Client";
import { MType } from "../components/MessageModal";
import MDate from "mutils/mdate";

export default function Clients({
  userRef,
  showMessage
}:{
  userRef: React.MutableRefObject<{user_id:string,user_name:string}|null>,
  showMessage:(title:string, message:string, type?:MType)=>void
}){

  const [ searchParams, setSearchParams ] = useSearchParams();
  const [ client_id, setClientId ] = useState<string|null>(null);
  if(searchParams.get("client_id") != client_id) setClientId(searchParams.get("client_id"));

  const [ clients, setClients ] = useState<ClientManagingType[]>([]);
  function getClients(){
    getPacket('/api/managing/clients').then(({title,message,data})=>data).then(({clients})=>setClients(clients))
  }
  useEffect(getClients, [])

  function sendReview(client_id, review){
    putPacket("/api/managing/client", { client_id, review }).then(()=>getClients())
    .catch(error=>showMessage("Review Failed", error.message, "warning"));
  }

  return (
    <>
      <Container className="mt-4">
        <h1>Clients</h1>
        <Row className="mt-5">
          {
            clients.map(client=>{
              const { client_id, client_name, client_owner, status, reviewed_by, created_at, updated_at } = client;
              const badge_color = (status=="approved") ? "success" : (status=="waiting") ? "warning" : "danger";
              return (
                <Col key={client_id} className={["mb-3", "col-12 col-sm-6 col-md-4 col-lg-3"].join(" ")}>
                  <Card>
                    <Card.Body className="position-relative">
                      <span className={`badge bg-${badge_color} position-absolute top-0 start-50 translate-middle`}>{status}</span>
                      <h1 className="display-6">{client_name}</h1>
                      <p className="mb-1">Owner: {client_owner.user_name}</p>
                      <p className="mb-1" style={{fontSize:"0.6em"}}>CreatedAt: {new MDate(created_at.getTime()).format("YYYY/MM/DD HH:mm:ss")}</p>
                      <p className="mb-1" style={{fontSize:"0.6em"}}>UpdatedAt: {new MDate(updated_at.getTime()).format("YYYY/MM/DD HH:mm:ss")}</p>
                      {
                        reviewed_by &&
                        <p className="mb-1" style={{fontSize:"0.8em"}}>reviewer: {reviewed_by.user_name}</p>
                      }
                    </Card.Body>
                    <Card.Footer>
                      { userRef.current && client_owner.user_id == userRef.current.user_id &&
                        <Link to={`/client?client_id=${client_id}`}>
                          <span className="btn btn-outline-secondary w-100">Setting</span>
                        </Link>
                      }
                      {
                        status=="waiting" && 
                        <ButtonGroup>
                          <Button size="sm" variant="primary" onClick={e=>sendReview(client_id,"approved")}>Approve</Button>
                          <Button size="sm" variant="danger" onClick={e=>sendReview(client_id,"rejected")}>Reject</Button>
                        </ButtonGroup>
                      }
                    </Card.Footer>
                  </Card>
                </Col>
              )
            })
          }
        </Row>
      </Container>
    </>
  )
}