import React, { useState, useEffect } from 'react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays,
    isSameMonth, eachMonthOfInterval, startOfYear, endOfYear, addYears, subYears, setMonth, setYear,
    isAfter
} from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';
import { setMoodColor, fetchUserStickers, fetchUserCalendar,applySticker  } from './api/api'; 

function Calendar() {
    // Mood colors used to color-code dates
    const colors = ['#FFABAB', '#FFC3A0', '#FFF58E', '#CDE6A5', '#ACD1EA', '#9FB1D9', '#C8BFE7'];

    // State hooks for managing calendar data and UI state
    const [currentMonth, setCurrentMonth] = useState(new Date()); // Current month for calendar view
    const [selectedDate, setSelectedDate] = useState(null); // Currently selected date
    const [moodColors, setMoodColors] = useState({}); // Mood colors for each date
    const [stickers, setStickers] = useState({}); // Stickers assigned to each date
    const [today, setToday] = useState(new Date()); // Current date
    const [isEditingMonth, setIsEditingMonth] = useState(false); // Flag to toggle month editing
    const [isEditingYear, setIsEditingYear] = useState(false); // Flag to toggle year editing
    const [inputMonth, setInputMonth] = useState(format(currentMonth, 'M')); // Month input for editing
    const [inputYear, setInputYear] = useState(format(currentMonth, 'yyyy')); // Year input for editing
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Flag to control sidebar visibility
    const [isYearlyView, setIsYearlyView] = useState(false); // Flag to toggle yearly view
    const [currentYear, setCurrentYear] = useState(new Date()); // Current year for yearly view
    const [isEditingYearInYearlyView, setIsEditingYearInYearlyView] = useState(false); // Flag to toggle year editing in yearly view
    const [userStickers, setUserStickers] = useState([]); // User's stickers

    const token = localStorage.getItem('token'); // Authentication token from local storage
    
    // Fetch user calendar data and stickers on component mount
    useEffect(() => {
        const initializeCalendar = async () => {
            try {
                // 캘린더 데이터 가져오기
                const calendarData = await fetchUserCalendar();
                console.log('Received calendar data:', calendarData);
    
                if (calendarData.isSuccess) {
                    // 데이터 로드 성공
                    // 데이터 처리 로직을 추가
                } else {
                    console.error('캘린더 데이터 조회 실패:', calendarData.message);
                }
            } catch (error) {
                console.error('Error initializing calendar data:', error);
            }
        };
    
        // 사용자 스티커 로드
        const loadUserStickers = async () => {
            try {
                if (!token) throw new Error('Token not provided.');
                const ownedStickers = await fetchUserStickers(token);
                setUserStickers(ownedStickers || []);
            } catch (error) {
                console.error('Error fetching user stickers:', error);
            }
        };
    
        initializeCalendar();
        loadUserStickers();
    }, [token]);
    
    

    // Load mood colors and stickers from local storage and fetch user stickers on component mount
    useEffect(() => {
        setToday(new Date());
        const storedMoodColors = JSON.parse(localStorage.getItem('moodColors')) || {};
        const storedStickers = JSON.parse(localStorage.getItem('stickers')) || {};
        setMoodColors(storedMoodColors);
        setStickers(storedStickers);

        const loadUserStickers = async () => {
            try {
                if (!token) throw new Error('Token not provided.'); // Check if token is available
                const ownedStickers = await fetchUserStickers(token); // Fetch stickers from API
                setUserStickers(ownedStickers || []); // Update state with fetched stickers
            } catch (error) {
                console.error('Error fetching user stickers:', error); // Log any errors
            }
        };
        loadUserStickers();
    }, [token]); // Dependency on token, so effect runs when token changes

    // Save mood colors and stickers to local storage when they change
    useEffect(() => {
        localStorage.setItem('moodColors', JSON.stringify(moodColors));
        localStorage.setItem('stickers', JSON.stringify(stickers));
    }, [moodColors, stickers]);

    // Navigate to previous month
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    // Navigate to next month
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    // Navigate to previous year
    const prevYear = () => setCurrentYear(subYears(currentYear, 1));
    // Navigate to next year
    const nextYear = () => setCurrentYear(addYears(currentYear, 1));

    // Handle date click to select a date and open sidebar
    const onDateClick = (day) => {
        if (!isAfter(day, today)) { // Ensure the date is not in the future
            setSelectedDate(day); // Set selected date
            setIsSidebarOpen(true); // Open sidebar
        }
    };

    // Handle mood color selection and save to server
    const handleColorClick = async (color) => {
        if (selectedDate) {
            const dateStr = format(selectedDate, 'yyyy-MM-dd'); // Format date for key
            setMoodColors(prevColors => ({
                ...prevColors,
                [dateStr]: color,
            }));
            try {
                if (!token) throw new Error('Token not provided.'); // Check if token is available
                await setMoodColor(dateStr, color, token); // Save color to server
                console.log('Color saved to server'); // Log success
            } catch (error) {
                console.error('Error saving color:', error); // Log any errors
            }
        }
    };

    const handleStickerAdd = async (stickerId) => {
        if (selectedDate) {
            const dateStr = format(selectedDate, 'yyyy-MM-dd'); // 날짜 형식 지정
            setStickers(prevStickers => ({
                ...prevStickers,
                [dateStr]: stickerId,
            }));
    
            try {
                const result = await applySticker(stickerId, dateStr, token);
                console.log('Sticker added to server:', result); // 성공적으로 추가된 스티커 정보 출력
            } catch (error) {
                console.error('Error adding sticker:', error); // 에러 로그
            }
        }
    };
    
    

    // Handle removing a sticker from the selected date
    const handleStickerRemove = async () => {
        if (selectedDate) {
            const dateStr = format(selectedDate, 'yyyy-MM-dd'); // Format date for key
            setStickers(prevStickers => {
                const updatedStickers = { ...prevStickers };
                delete updatedStickers[dateStr]; // Remove sticker
                return updatedStickers;
            });
            try {
                console.log('Sticker removed from server'); // Log success
            } catch (error) {
                console.error('Error removing sticker:', error); // Log any errors
            }
        }
    };

    // Handle month input change and update current month
    const handleMonthChange = () => {
        const newMonth = parseInt(inputMonth, 10);
        if (newMonth >= 1 && newMonth <= 12) {
            setCurrentMonth(setMonth(currentMonth, newMonth - 1));
            setIsEditingMonth(false); // Exit editing mode
        }
    };

    // Handle year input change and update current month
    const handleYearChange = () => {
        const newYear = parseInt(inputYear, 10);
        if (newYear >= 1900 && newYear <= today.getFullYear()) {
            setCurrentMonth(setYear(currentMonth, newYear));
            setIsEditingYear(false); // Exit editing mode
        } else {
            alert("Please enter a valid year."); // Alert for invalid year
        }
    };

    // Handle year input change in yearly view and update current year
    const handleYearChangeInYearlyView = () => {
        const newYear = parseInt(inputYear, 10);
        if (newYear >= 1900 && newYear <= today.getFullYear()) {
            setCurrentYear(setYear(currentYear, newYear));
            setIsEditingYearInYearlyView(false); // Exit editing mode
        } else {
            alert("Please enter a valid year."); // Alert for invalid year
        }
    };

    // Handle Enter key press in input fields
    const handleKeyDown = (e, callback) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default behavior
            callback(); // Call the callback function
        }
    };

    // Render header with month/year navigation
    const RenderHeader = ({ currentMonth, prevMonth, nextMonth }) => (
        <div className="d-flex justify-content-between align-items-center mb-3">
            <button className="btn btn-outline-primary" onClick={prevMonth}>◀</button>
            <div className="text-center">
                {isEditingYear ? (
                    <input
                        type="number"
                        value={inputYear}
                        onChange={(e) => setInputYear(e.target.value)}
                        onBlur={handleYearChange}
                        onKeyDown={(e) => handleKeyDown(e, handleYearChange)}
                        autoFocus
                        className="form-control"
                    />
                ) : (
                    <span onClick={() => setIsEditingYear(true)}>{format(currentMonth, 'yyyy년')}</span>
                )}
                {isEditingMonth ? (
                    <input
                        type="number"
                        value={inputMonth}
                        onChange={(e) => setInputMonth(e.target.value)}
                        onBlur={handleMonthChange}
                        onKeyDown={(e) => handleKeyDown(e, handleMonthChange)}
                        autoFocus
                        className="form-control"
                    />
                ) : (
                    <span onClick={() => setIsEditingMonth(true)}>{format(currentMonth, 'M월')}</span>
                )}
            </div>
            <button className="btn btn-outline-primary" onClick={nextMonth}>▶</button>
        </div>
    );

    // Render day labels (SUN, MON, TUE, etc.)
    const RenderDays = () => {
        const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

        return (
            <div className="row">
                {dayLabels.map((label, i) => (
                    <div className="col text-center p-2" key={i}>
                        {label}
                    </div>
                ))}
            </div>
        );
    };

    // Render calendar cells for the current month
    const RenderCells = ({ currentMonth, moodColors, stickers, onDateClick }) => {
        const monthStart = startOfMonth(currentMonth); // Start of the current month
        const monthEnd = endOfMonth(monthStart); // End of the current month
        const startDate = startOfWeek(monthStart); // Start of the week containing the first of the month
        const endDate = endOfWeek(monthEnd); // End of the week containing the end of the month
    
        const rows = [];
        let day = startDate;
    
        // Generate rows for each week
        while (day <= endDate) {
            const days = [];
    
            for (let i = 0; i < 7; i++) {
                const currentDay = day;
                const dayKey = format(currentDay, 'yyyy-MM-dd'); // Format date for key
                const dayColor = moodColors[dayKey] || 'transparent'; // Get color for the day
                const stickerId = stickers[dayKey]; // Get sticker ID for the day
                const sticker = userStickers.find(s => s.sticker_id === stickerId); // Find sticker info
    
                days.push(
                    <div
                        className={`col text-center p-2 border ${
                            !isSameMonth(currentDay, currentMonth) ? 'text-muted' : ''
                        }`}
                        key={dayKey}
                        onClick={() => onDateClick(currentDay)} // Click handler for selecting a date
                        style={{
                            cursor: 'pointer',
                            backgroundColor: dayColor,
                            position: 'relative',
                            paddingBottom: '40px',
                            overflow: 'hidden',
                        }}
                    >
                        <div className="position-relative">
                            {format(currentDay, 'd')} {/* Day number */}
                            {sticker && (
                                <img
                                    src={sticker.image_url} // Sticker image
                                    alt={sticker.name}
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        position: 'absolute',
                                        bottom: '5px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        objectFit: 'contain',
                                    }}
                                />
                            )}
                        </div>
                    </div>
                );
                day = addDays(day, 1); // Move to the next day
            }
            rows.push(<div className="row" key={format(day, 'yyyy-MM-dd')}>{days}</div>); // Add row to rows
        }
    
        return <div>{rows}</div>; // Return rows
    };
    

    // Render mini month view for yearly view
    const RenderMiniMonth = ({ month, moodColors }) => {
        const monthStart = startOfMonth(month); // Start of the month
        const monthEnd = endOfMonth(month); // End of the month
        const startDate = startOfWeek(monthStart); // Start of the week containing the first of the month
        const endDate = endOfWeek(monthEnd); // End of the week containing the end of the month

        const rows = [];
        let day = startDate;

        // Generate rows for each week
        while (day <= endDate) {
            const days = [];

            for (let i = 0; i < 7; i++) {
                const currentDay = day;
                const dayKey = format(currentDay, 'yyyy-MM-dd'); // Format date for key
                const dayColor = moodColors[dayKey] || 'transparent'; // Get color for the day

                days.push(
                    <div
                        className={`col text-center p-2 border ${
                            !isSameMonth(currentDay, month) ? 'text-muted' : ''
                        }`}
                        key={dayKey}
                    >
                        <div
                            className="rounded-circle"
                            style={{
                                width: '10px',
                                height: '10px',
                                backgroundColor: dayColor,
                            }}
                        ></div>
                        <div>{format(currentDay, 'd')}</div> {/* Day number */}
                    </div>
                );
                day = addDays(day, 1); // Move to the next day
            }
            rows.push(<div className="row" key={format(day, 'yyyy-MM-dd')}>{days}</div>); // Add row to rows
        }

        return <div>{rows}</div>; // Return rows
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between mb-4">
                <button className="btn btn-outline-primary" onClick={() => setIsYearlyView(!isYearlyView)}>
                    {isYearlyView ? '월별 보기' : '연간 보기'}
                </button>
            </div>

            {isSidebarOpen && (
                <div className="sidebar bg-light p-3" style={{ position: 'fixed', bottom: '0', left: '0', width: '100%', borderTop: '1px solid #ddd' }}>
                    {selectedDate && (
                        <div className="mb-3">
                            <h5>색상 선택</h5>
                            {colors.map(color => (
                                <button
                                    key={color}
                                    className="btn"
                                    style={{ backgroundColor: color, width: '30px', height: '30px', border: 'none', margin: '2px' }}
                                    onClick={() => handleColorClick(color)}
                                ></button>
                            ))}
                        </div>
                    )}

                    {selectedDate && (
                        <div>
                            <h5>스티커</h5>
                            <div className="sticker-list">
                                {userStickers.map(sticker => (
                                    <div key={sticker.sticker_id} className="sticker-item">
                                        <img src={sticker.image_url} alt={sticker.name} className="sticker-image"
                                        onClick={() => handleStickerAdd(sticker.sticker_id)} />
                                        <div className="sticker-info">
                                            <h2>{sticker.name}</h2>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    className="btn btn-danger"
                                    onClick={handleStickerRemove}
                                    disabled={!stickers[format(selectedDate, 'yyyy-MM-dd')]}
                                >
                                    스티커 제거
                                </button>
                            </div>
                        </div>
                    )}

                    <button className="btn btn-secondary mt-3" onClick={() => setIsSidebarOpen(false)}>닫기</button>
                </div>
            )}

            {isYearlyView ? (
                <div>
                    <RenderHeader currentMonth={currentYear} prevMonth={prevYear} nextMonth={nextYear} />
                    {eachMonthOfInterval({ start: startOfYear(currentYear), end: endOfYear(currentYear) }).map(month => (
                        <div key={month} className="mb-4">
                            <h5>{format(month, 'MMM yyyy')}</h5>
                            <RenderMiniMonth month={month} moodColors={moodColors} />
                        </div>
                    ))}
                    {isEditingYearInYearlyView && (
                        <input
                            type="number"
                            value={inputYear}
                            onChange={(e) => setInputYear(e.target.value)}
                            onBlur={handleYearChangeInYearlyView}
                            onKeyDown={(e) => handleKeyDown(e, handleYearChangeInYearlyView)}
                            autoFocus
                            className="form-control mt-2"
                        />
                    )}
                </div>
            ) : (
                <div>
                    <RenderHeader currentMonth={currentMonth} prevMonth={prevMonth} nextMonth={nextMonth} />
                    <RenderDays />
                    <RenderCells currentMonth={currentMonth} moodColors={moodColors} stickers={stickers} onDateClick={onDateClick} />
                </div>
            )}
        </div>
    );
}

export default Calendar;
