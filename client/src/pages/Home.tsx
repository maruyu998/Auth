import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';

export default function Home() {  
  return (
    <Container className="mt-4" style={{maxWidth:"40rem"}}>
      <h1>Auth - maruyu.work</h1>
      <p>authentication and access managing system for apps</p>
    </Container>
  )
}