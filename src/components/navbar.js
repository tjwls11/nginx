import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../context/LoginContext'; // LoginContext에서 훅을 가져옵니다.

const Navbar = () => {
  const { user, logout } = useLogin(); // useLogin 훅을 사용하여 로그인 상태와 로그아웃 기능을 가져옵니다.
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅

  const handleLogout = () => {
    logout(); // 로그아웃 함수 호출
    navigate('/'); // 홈 페이지로 리디렉션
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/diary">Diary</Link>
            <Link to="/calendar">Mood Tracker</Link>
            <Link to="/mypage">My Page</Link>
            <Link to="/stickershop">sticker</Link>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
