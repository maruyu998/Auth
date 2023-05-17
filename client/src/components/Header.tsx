import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { getPacket } from 'mutils/fetch';

export default function Header({
  userRef,
  setUser,
  loadingStatusRef,
  setLoadingStatus
}){

  const location = useLocation();
  useEffect(()=>{
    getPacket("/api/auth/me").then(({title,message,data})=>data).then(user=>{
      if(userRef) setUser(user)
      setLoadingStatus(user ? "loggedin" : "loggedout");
    }).catch(error=>setLoadingStatus("loggedout"))
  }, [location])

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Container>
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to='/'><Nav.Link>Home</Nav.Link></LinkContainer>
            {
              loadingStatusRef.current == "loggedin" && <>
              <LinkContainer to='/clients'><Nav.Link>Clients</Nav.Link></LinkContainer>
              <LinkContainer to='/register'><Nav.Link>Register</Nav.Link></LinkContainer>
              <LinkContainer to='/account'><Nav.Link>Account</Nav.Link></LinkContainer>
              </>
            }
            {
              loadingStatusRef.current == "loggedout" && <>
              <LinkContainer to='/signup'><Nav.Link>Signup</Nav.Link></LinkContainer>
              <LinkContainer to='/signin'><Nav.Link>Signin</Nav.Link></LinkContainer>
              </>
            }
            {
              location.pathname == "/client" && 
              <LinkContainer to='/client'><Nav.Link>Client</Nav.Link></LinkContainer>
            }
            {
              location.pathname == "/client_user" && 
              <LinkContainer to='/client_user'><Nav.Link>ClientUser</Nav.Link></LinkContainer>
            }
          </Nav>
        </Navbar.Collapse>
        <p className="my-0">Hello, {userRef.current ? userRef.current.user_name: "guest"}</p>
      </Container>
    </Navbar>
  )
}