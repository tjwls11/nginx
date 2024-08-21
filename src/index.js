import React from 'react';
import ReactDOM from 'react-dom/client';
import './style/index.css';
import './style/mainpage.css';
import './style/mypage.css'
import './style/login.css';
import './style/calendar.css';
import './style/navbar.css';
import './style/diary.css';
import './style/adddiary.css';

import App from './App';
import { LoginProvider } from './context/LoginContext'; // 수정된 부분

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LoginProvider>
      <App />
    </LoginProvider>
  </React.StrictMode>
);
