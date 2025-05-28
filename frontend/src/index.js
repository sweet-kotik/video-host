import React from 'react';
import ReactDOM from 'react-dom/client';
import HomePage from './pages/Homepage';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VideoWatchPage from './pages/VideoWatchPage';
import UpperMenu from './components/UpperMenu';
import UploadPage from './pages/UploadPage';
import Login from './pages/LoginPage'
import RegistrPage from './pages/RegistrPage';
import './index.css';
import ProtectedRoute from './components/ProtectedRoute';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
  <UpperMenu />
    <Routes>
      <Route path='/' element={<HomePage/>}/>
      <Route path='/video/watch/' element={<VideoWatchPage />}/>
      <Route path='/login' element={<Login />} />
      <Route path='register' element={<RegistrPage />} />
      <Route path='/upload/' element={
        <ProtectedRoute>
          <UploadPage /> 
        </ProtectedRoute>
      } />
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
