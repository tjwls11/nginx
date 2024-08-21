// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3011;
const saltRounds = 10;
const secretKey = process.env.SECRET_KEY || 'default_secret';

// CORS 설정
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL 연결 설정
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'tjwls100',
  database: process.env.DB_NAME || 'souldiary'
};

const pool = mysql.createPool(dbConfig);

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Authorization: Bearer <token>
  
  if (!token) return res.sendStatus(401); // 토큰이 없으면 401 Unauthorized

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.error('JWT 인증 실패:', err);
      return res.sendStatus(403); // 토큰이 유효하지 않으면 403 Forbidden
    }
    req.user = user;
    next();
  });
};

// 기본 라우트 설정
app.get('/', (req, res) => {
  res.send('<h1>서버에 오신 것을 환영합니다!</h1><p>서버가 정상적으로 실행되고 있습니다.</p>');
});

// 회원가입 엔드포인트
app.post('/signup', async (req, res) => {
  const { name, user_id, password } = req.body;

  if (!name || !user_id || !password) {
    return res.status(400).json({ isSuccess: false, message: '모든 필드를 입력해 주세요.' });
  }

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    await pool.query('INSERT INTO `user` (`name`, `user_id`, `password`, `coin`) VALUES (?, ?, ?, ?)', [name, user_id, hash, 5000]);
    res.status(201).json({ isSuccess: true, message: '회원 가입 성공' });
  } catch (err) {
    console.error('회원 가입 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  }
});

// 로그인 엔드포인트
app.post('/login', async (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res.status(400).json({ isSuccess: false, message: '모든 필드를 입력해 주세요.' });
  }

  try {
    const [results] = await pool.query('SELECT * FROM `user` WHERE `user_id` = ?', [user_id]);

    if (results.length === 0) {
      return res.status(401).json({ isSuccess: false, message: '사용자를 찾을 수 없습니다' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ isSuccess: false, message: '잘못된 비밀번호' });
    }

    const token = jwt.sign({ user_id: user.user_id, name: user.name }, secretKey, { expiresIn: '1h' });
    res.json({ isSuccess: true, message: '로그인 성공', token, user: { user_id: user.user_id, name: user.name } });
  } catch (err) {
    console.error('서버 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  }
});

// 사용자 정보 조회 엔드포인트
app.get('/get-user-info', authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query('SELECT `name`, `user_id`, `coin` FROM `user` WHERE `user_id` = ?', [req.user.user_id]);

    if (results.length === 0) {
      return res.status(404).json({ isSuccess: false, message: '사용자를 찾을 수 없습니다' });
    }

    res.json({ isSuccess: true, user: results[0] });
  } catch (err) {
    console.error('사용자 정보 조회 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  }
});

// 비밀번호 변경 엔드포인트
app.post('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ isSuccess: false, message: '모든 필드를 입력해 주세요' });
  }

  try {
    const [results] = await pool.query('SELECT `password` FROM `user` WHERE `user_id` = ?', [req.user.user_id]);

    if (results.length === 0) {
      return res.status(404).json({ isSuccess: false, message: '사용자를 찾을 수 없습니다' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ isSuccess: false, message: '현재 비밀번호가 올바르지 않습니다' });
    }

    const hash = await bcrypt.hash(newPassword, saltRounds);
    await pool.query('UPDATE `user` SET `password` = ? WHERE `user_id` = ?', [hash, req.user.user_id]);
    res.json({ isSuccess: true, message: '비밀번호가 성공적으로 변경되었습니다' });
  } catch (err) {
    console.error('비밀번호 변경 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  }
});

// 다이어리 관련
// 다이어리 상세 조회 엔드포인트
app.get('/get-diary/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const [results] = await pool.query('SELECT * FROM `diary` WHERE `id` = ? AND `user_id` = ?', [id, req.user.user_id]);
    if (results.length === 0) {
      return res.status(404).json({ isSuccess: false, message: '다이어리를 찾을 수 없습니다.' });
    }
    res.json({ isSuccess: true, diary: results[0] });
  } catch (err) {
    console.error('다이어리 상세 조회 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  }
});


// 다이어리 목록 조회 엔드포인트
app.get('/get-diaries', authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM `diary` WHERE `user_id` = ?', [req.user.user_id]);
    res.json({ isSuccess: true, diaries: results });
  } catch (err) {
    console.error('다이어리 목록 조회 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  }
});

// 다이어리 작성 엔드포인트
app.post('/add-diary', authenticateToken, async (req, res) => {
  const { date, title, one, content } = req.body;
  const user_id = req.user.user_id;

  try {
    const [result] = await pool.query(
      'INSERT INTO `diary` (`date`, `title`, `one`, `content`, `user_id`) VALUES (?, ?, ?, ?, ?)',
      [date, title, one, content, user_id]
    );
    
    if (result.affectedRows > 0) {
      res.json({ isSuccess: true, message: '다이어리가 성공적으로 추가되었습니다.' });
    } else {
      res.json({ isSuccess: false, message: '다이어리 추가에 실패했습니다.' });
    }
  } catch (err) {
    console.error('다이어리 추가 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  }
});

// 다이어리 삭제 엔드포인트
app.delete('/delete-diary/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await pool.query('DELETE FROM `diary` WHERE `id` = ? AND `user_id` = ?', [id, req.user.user_id]);

    if (results.affectedRows > 0) {
      res.json({ isSuccess: true, message: '다이어리가 성공적으로 삭제되었습니다.' });
    } else {
      res.status(404).json({ isSuccess: false, message: '다이어리를 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('다이어리 삭제 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  }
});

//스티커
// 스티커 목록 조회 엔드포인트
app.get('/get-stickers', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM `stickers`');
    res.json({ isSuccess: true, stickers: results });
  } catch (err) {
    console.error('스티커 목록 조회 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  }
});

// 스티커 구매 엔드포인트
// 스티커 구매 엔드포인트
app.post('/buy-sticker', authenticateToken, async (req, res) => {
  const { sticker_id, price } = req.body;
  const user_id = req.user.user_id;

  if (!sticker_id || !price) {
    return res.status(400).json({ isSuccess: false, message: '스티커 ID와 가격을 입력해 주세요.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 사용자 잔액 확인
    const [userResults] = await connection.query('SELECT `coin` FROM `user` WHERE `user_id` = ?', [user_id]);
    if (userResults.length === 0 || userResults[0].coin < price) {
      await connection.rollback();
      return res.status(400).json({ isSuccess: false, message: '잔액이 부족합니다.' });
    }

    // 스티커 구매
    await connection.query('INSERT INTO `user_stickers` (`user_id`, `sticker_id`) VALUES (?, ?)', [user_id, sticker_id]);

    // 사용자 잔액 차감
    await connection.query('UPDATE `user` SET `coin` = `coin` - ? WHERE `user_id` = ?', [price, user_id]);

    await connection.commit();
    res.json({ isSuccess: true, message: '스티커 구매 성공' });
  } catch (err) {
    await connection.rollback();
    console.error('스티커 구매 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  } finally {
    connection.release();
  }
});

// 사용자 스티커 조회 엔드포인트
app.get('/get-user-stickers', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [results] = await pool.query('SELECT * FROM `user_stickers` WHERE `user_id` = ?', [userId]);
    if (!results.length) {
      return res.status(404).json({ isSuccess: false, message: '스티커를 찾을 수 없습니다.' });
    }
    res.json({ isSuccess: true, stickers: results });
  } catch (err) {
    console.error('스티커 조회 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  }
});



//캘린더
// 캘린더: 특정 날짜의 무드 색상과 스티커 설정 엔드포인트
app.post('/set-mood-color', authenticateToken, async (req, res) => {
  const { date, color, sticker_id } = req.body;
  const userId = req.user.user_id;

  if (!date || !color) {
    return res.status(400).json({ isSuccess: false, message: '날짜와 색상을 입력해 주세요.' });
  }

  try {
    const [results] = await pool.query('SELECT * FROM `calendar` WHERE `user_id` = ? AND `date` = ?', [userId, date]);
    if (results.length > 0) {
      // 이미 해당 날짜의 데이터가 있는 경우 업데이트
      await pool.query('UPDATE `calendar` SET `color` = ?, `sticker_id` = ? WHERE `user_id` = ? AND `date` = ?', [color, sticker_id, userId, date]);
    } else {
      // 새로운 데이터 삽입
      await pool.query('INSERT INTO `calendar` (`user_id`, `date`, `color`, `sticker_id`) VALUES (?, ?, ?, ?)', [userId, date, color, sticker_id]);
    }
    res.json({ isSuccess: true, message: '색상과 스티커가 설정되었습니다.' });
  } catch (err) {
    console.error('색상 및 스티커 설정 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  }
});


// 캘린더: 특정 날짜의 무드 색상과 스티커 조회 엔드포인트
app.get('/get-mood-color', authenticateToken, async (req, res) => {
  const { date } = req.query; // req.query로 변경
  const userId = req.user.user_id;

  if (!date) {
    return res.status(400).json({ isSuccess: false, message: '날짜를 입력해 주세요.' });
  }

  try {
    const [results] = await pool.query('SELECT * FROM `calendar` WHERE `user_id` = ? AND `date` = ?', [userId, date]);
    if (results.length > 0) {
      res.json({ isSuccess: true, color: results[0].color, sticker_id: results[0].sticker_id });
    } else {
      res.json({ isSuccess: false, message: '해당 날짜에 대한 데이터가 없습니다.' });
    }
  } catch (err) {
    console.error('무드 색상 조회 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  }
});


// 사용자 캘린더 데이터 가져오기 엔드포인트
app.get('/get-user-calendar', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [results] = await pool.query('SELECT `date`, `color`, `sticker_id` FROM `calendar` WHERE `user_id` = ?', [userId]);
    res.json({ isSuccess: true, data: results });
  } catch (err) {
    console.error('캘린더 데이터 조회 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  }
});

// 캘린더: 특정 날짜에 스티커 추가 엔드포인트
app.post('/apply-sticker', authenticateToken, async (req, res) => {
  const { sticker_id, date } = req.body;
  const userId = req.user.user_id;

  console.log(`Received sticker_id: ${sticker_id}, date: ${date}`); // 디버깅용 로그 추가

  if (!sticker_id || !date) {
    return res.status(400).json({ isSuccess: false, message: '스티커 ID와 날짜를 입력해 주세요.' });
  }

  try {
    const [results] = await pool.query('SELECT * FROM `calendar` WHERE `user_id` = ? AND `date` = ?', [userId, date]);
    if (results.length > 0) {
      // 이미 해당 날짜의 데이터가 있는 경우 업데이트
      await pool.query('UPDATE `calendar` SET `sticker_id` = ? WHERE `user_id` = ? AND `date` = ?', [sticker_id, userId, date]);
    } else {
      // 새로운 데이터 삽입
      await pool.query('INSERT INTO `calendar` (`user_id`, `date`, `sticker_id`) VALUES (?, ?, ?)', [userId, date, sticker_id]);
    }
    res.json({ isSuccess: true, message: '스티커가 성공적으로 추가되었습니다.' });
  } catch (err) {
    console.error('스티커 추가 오류:', err);
    res.status(500).json({ isSuccess: false, message: '서버 오류' });
  }
});


// 서버 실행
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
