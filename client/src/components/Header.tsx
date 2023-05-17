import React from 'react';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Container, Nav } from 'react-bootstrap';

export default function Header(){
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand><Link to="/">Auth</Link></Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
        <Nav className="me-auto">
          <LinkContainer to='/'><Nav.Link>Home</Nav.Link></LinkContainer>
          <LinkContainer to='/waitings'><Nav.Link>Waitings</Nav.Link></LinkContainer>
          <LinkContainer to='/register'><Nav.Link>Register</Nav.Link></LinkContainer>
        </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}