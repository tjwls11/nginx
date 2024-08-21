import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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

const Diary = () => {
    const [diaries, setDiaries] = useState([]);
    const token = localStorage.getItem('token'); // 저장된 JWT 토큰 가져오기

    const fetchDiaries = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3011/get-diaries', {
                headers: {
                    'Authorization': `Bearer ${token}` // JWT 토큰을 Authorization 헤더에 포함
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setDiaries(data.diaries || []);
        } catch (error) {
            console.error('Error fetching diaries:', error);
        }
    }, [token]);

    useEffect(() => {
        fetchDiaries();
    }, [fetchDiaries]);

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:3011/delete-diary/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` // JWT 토큰을 Authorization 헤더에 포함
                }
            });

            if (response.ok) {
                setDiaries(diaries.filter((diary) => diary.id !== id));
            } else {
                // 서버 응답이 성공적이지 않은 경우
                const errorMessage = await response.text(); // 응답 메시지 가져오기
                console.error('Failed to delete the diary:', errorMessage);
            }
        } catch (error) {
            console.error('Error deleting diary:', error);
        }
    };

    return (
        <div>
            <br />
            <div className="container mt-5 text-center">
                <h1 className="display-4 mt-4 fw-bold">
                    <i className="bi bi-book"></i>
                    오늘의<span className="spantag"> 일기</span>
                </h1>
                <br />
                <br />
                <div className="d-grid gap-2">
                    <Link
                        to="/add-diary"
                        className="text-white fw-bold text-decoration-none btn mb-2"
                    >
                        글쓰기
                    </Link>
                </div>
                <table className="table table-striped mt-4 mb-5">
                    <thead className="custom-thead">
                        <tr>
                            <th className="text-center">제목</th>
                            <th className="text-center">날짜</th>
                            <th className="text-center">삭제</th>
                        </tr>
                    </thead>
                    <tbody>
                        {diaries.map((diary) => (
                            <tr key={diary.id}>
                                <td className="text-center">
                                    <Link to={`/detaildiary/${diary.id}`} className="text-decoration-none">
                                        {diary.title}
                                    </Link>
                                </td>
                                <td className="text-center">{formatDate(diary.date)}</td>
                                <td className="text-center">
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(diary.id)}
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Diary;
