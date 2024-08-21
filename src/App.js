import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Introduce from './components/introduce';
import Login from './components/login';
import Signup from './components/signup';
import MyPage from './components/mypage';
import Navbar from './components/navbar';
import Calendar from './components/calendar';
import Diary from './components/diary';
import AddDiary from './components/adddiary';
import DetailDiary from './components/detaildiary';
import StickerPage from './components/StickerShop';
import { LoginProvider } from './context/LoginContext';


const App = () => {
  return (
    <LoginProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Introduce />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/detaildiary/:id" element={<DetailDiary />} />
          <Route path="/add-diary" element={<AddDiary />} />
          <Route path='/stickershop' element={<StickerPage/>} />
    
        </Routes>
      </Router>
    </LoginProvider>
  );
};

export default App;
