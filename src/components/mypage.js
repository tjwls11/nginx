import React, { useState, useEffect } from 'react';
import { fetchUserInfo, changePassword } from './api/api'; 

const MyPage = () => {
  const [user, setUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("로그인이 필요합니다.");
        window.location.href = "/Login";
        return;
      }

      try {
        const response = await fetchUserInfo(token);
        if (response.isSuccess) {
          setUser(response.user); // `response.user`에 유저 정보를 저장
          localStorage.setItem('user', JSON.stringify(response.user)); // 사용자 정보 로컬 저장
        } else {
          setError("유저 정보 요청 중 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("유저 정보 요청 중 오류가 발생했습니다.", error);
        setError("유저 정보 요청 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    getUserInfo();
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert("모든 필드를 입력하세요.");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword, token);
      alert("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("비밀번호 변경 중 오류가 발생했습니다.", error);
      alert("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>로그인 후 다시 시도해 주세요.</div>;
  }

  return (
    <div className="mypage">
      <section className="sec">
        <div className="sec-box">
          <h1 className="sec-main">My Page</h1>
          <div className="sec-img">
            <img
              src={process.env.PUBLIC_URL + "/img/mypage.png"}
              alt="mypage"
            />
          </div>
          <table>
            <tbody>
              <tr>
                <th className="name">이름</th>
                <td>{user.name || '정보 없음'}</td>
              </tr>
              <tr>
                <th className="name">아이디</th>
                <td>{user.user_id || '정보 없음'}</td>
              </tr>
              <tr>
                <th className="name">내 코인</th>
                <td>{user.coin || '0'}</td>
              </tr>
            </tbody>
          </table>
          <div className="password-change">
            <h3>비밀번호 변경</h3>
            <input
              className="input"
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              className="input"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button className="Change-button" onClick={handleChangePassword}>Change Password</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyPage;
