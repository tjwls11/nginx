import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// 날짜 형식을 'yyyy-mm-dd'로 변환하는 헬퍼 함수
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더합니다.
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DetailDiary = () => {
  const { id } = useParams(); // URL 파라미터에서 일기 ID 가져오기
  const [diary, setDiary] = useState(null);

  useEffect(() => {
    const fetchDiary = async () => {
      const token = localStorage.getItem('token'); // 저장된 JWT 토큰 가져오기
      try {
        const response = await fetch(`http://localhost:3011/get-diary/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}` // JWT 토큰을 Authorization 헤더에 포함
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setDiary(data.diary || {});
      } catch (error) {
        console.error('Error fetching diary:', error);
      }
    };

    fetchDiary();
  }, [id]);

  if (!diary) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="display-4 mt-4 fw-bold">일기 상세</h1>
      <h2>{diary.title}</h2>
      <p>{diary.content}</p>
      <p><strong>날짜:</strong> {formatDate(diary.date)}</p> {/* 날짜 형식 변경 */}
      <Link to="/diary" className="btn btn-primary">돌아가기</Link>
    </div>
  );
};

export default DetailDiary;