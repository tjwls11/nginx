import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddDiary() {
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [oneLine, setOneLine] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 제출 기본 동작 방지
    const token = localStorage.getItem('token'); // 저장된 JWT 토큰 가져오기

    const diaryData = {
      date,
      title,
      one: oneLine,
      content: diaryContent,
    };

    try {
      const response = await fetch('http://localhost:3011/add-diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // JWT 토큰을 Authorization 헤더에 포함
        },
        body: JSON.stringify(diaryData),
      });
      const result = await response.json();

      if (result.isSuccess) {
        alert('일기가 성공적으로 저장되었습니다.');
        setDate('');
        setTitle('');
        setOneLine('');
        setDiaryContent('');
        navigate('/diary'); // 일기 작성 후 목록 페이지로 이동
      } else {
        alert('일기 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error adding diary:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">일기 작성</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="date" className="form-label">날짜</label>
          <input
            type="date"
            className="form-control"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">제목</label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="one-line" className="form-label">한 줄 요약</label>
          <input
            type="text"
            className="form-control"
            id="one-line"
            value={oneLine}
            onChange={(e) => setOneLine(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="content" className="form-label">내용</label>
          <textarea
            className="form-control"
            id="content"
            rows="5"
            value={diaryContent}
            onChange={(e) => setDiaryContent(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">저장</button>
      </form>
    </div>
  );
}

export default AddDiary;
