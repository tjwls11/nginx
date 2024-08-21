import React, { useState } from 'react';
import { useLogin } from '../context/LoginContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ user_id: '', password: '' });
  const [loginError, setLoginError] = useState(''); // 로그인 오류 상태 추가
  const { login } = useLogin();
  const navigate = useNavigate();

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  // 로그인 요청 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(''); // 로그인 시 오류 초기화

    try {
      const response = await fetch('http://localhost:3011/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        login(data.user, data.token); // 로그인 성공 시 상태 업데이트
        navigate('/calendar'); // 성공 시 이동
      } else {
        setLoginError(data.message || '로그인 실패');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setLoginError('로그인 중 오류가 발생했습니다.');
    }
  };

  // 폼 유효성 검사
  const isFormValid = credentials.user_id && credentials.password;

  return (
    <div className="page">
      <div className="title">LOGIN</div>
      <form className="content" onSubmit={handleSubmit}>
        <input
          className="input"
          type="text"
          name="user_id"
          placeholder="ID"
          value={credentials.user_id}
          onChange={handleChange}
        />
        <input
          className="input"
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
        />
        <button
          className={`login-button ${isFormValid ? 'enabled' : 'disabled'}`}
          disabled={!isFormValid}
          type="submit"
        >
          로그인
        </button>
      </form>
      {loginError && <p className="error-message">{loginError}</p>}
      <div className="actions">
        <Link to="/signup" className="signup-link">회원가입</Link>
      </div>
    </div>
  );
};

export default Login;
