import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import './App.scss';
import Home from './pages/Home';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Waitings from './pages/Waitings';
import Register from './pages/Register';

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/signin" element={<Signin/>}></Route>
          <Route path="/signup" element={<Signup/>}></Route>
          <Route path="/waitings" element={<Waitings/>}></Route>
          <Route path="/register" element={<Register/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}