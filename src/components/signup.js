import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const navigate = useNavigate();

  const isFormValid = name.trim() !== '' && userId.trim() !== '' && password.trim() !== '' && password === confirmPassword;

  const handleSignup = () => {
    if (!isFormValid) {
      setSignupError("모든 필드를 올바르게 입력해주세요.");
      return;
    }

    const userData = {
      name: name,
      user_id: userId,
      password: password,
    };

    fetch("http://localhost:3011/signup", { // 변경된 포트와 경로
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(err => { throw err });
        }
        return res.json();
      })
      .then((json) => {
        if (json.isSuccess) {
          alert('회원가입이 완료되었습니다!');
          navigate("/"); // 회원가입 완료 후 로그인 페이지로 이동
        } else {
          setSignupError(json.message); // 실패 메시지 처리
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setSignupError(error.message || "회원가입 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className="page">
      <div className="title">SIGN UP</div>
      <div className="content">
        <input
          className="input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          type="text"
          placeholder="ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <div className="actions">
        <button
          className={`login-button ${isFormValid ? "enabled" : ""}`}
          disabled={!isFormValid}
          onClick={handleSignup}
        >
          회원가입
        </button>
        {signupError && <p className="error-message">{signupError}</p>}
        <Link to="/login" className="signup-link">
          로그인
        </Link>
      </div>
    </div>
  );
}

export default Signup;