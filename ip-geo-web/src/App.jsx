import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const navigate = useNavigate();

  useEffect(()=>{
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(()=>{
    if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user');
  }, [user]);

  function handleLogin(token, user){
    setToken(token);
    setUser(user);
    navigate('/home');
  }

  function handleLogout(){
    setToken(null);
    setUser(null);
    navigate('/login');
  }

  return (
    <Routes>
      <Route path="/" element={ token ? <Navigate to="/home" /> : <Navigate to="/login" /> } />
      <Route path="/login" element={<Login onLogin={handleLogin} api={API} />} />
      <Route path="/home" element={ token ? <Home api={API} user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
    </Routes>
  );
}
