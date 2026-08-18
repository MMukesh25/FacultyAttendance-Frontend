import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaArrowLeft,
    FaCalendarAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaUmbrellaBeach
} from "react-icons/fa";

import "./AttendanceHistory.css";


function AttendanceHistory() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [attendance, setAttendance] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =========================================================
    // LOAD USER
    // =========================================================

    useEffect(() => {

        const storedUser =
            localStorage.getItem("user");

        if (!storedUser) {

            navigate("/login");

            return;
        }

        try {

            setUser(
                JSON.parse(storedUser)
            );

        } catch (error) {

            console.error(
                "Invalid user:",
                error
            );

            localStorage.removeItem("user");

            navigate("/login");

        }

    }, [navigate]);


    // =========================================================
    // LOAD CURRENT MONTH ATTENDANCE
    // =========================================================

    useEffect(() => {

        if (!user?.email) {
            return;
        }


        const loadAttendance = async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await fetch(
                        `http://localhost:8080/api/attendance/month?email=${encodeURIComponent(
                            user.email
                        )}`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Unable to load attendance history."
                    );

                }


                const data =
                    await response.json();


                setAttendance(
                    Array.isArray(data)
                        ? data
                        : []
                );


            } catch (error) {

                console.error(
                    "Attendance history error:",
                    error
                );

                setError(
                    "Unable to load attendance history."
                );

            } finally {

                setLoading(false);

            }

        };


        loadAttendance();

    }, [user]);


    // =========================================================
    // CURRENT MONTH
    // =========================================================

    const currentDate =
        new Date();

    const currentYear =
        currentDate.getFullYear();

    const currentMonth =
        currentDate.getMonth();


    const monthName =
        currentDate.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );


    const daysInMonth =
        new Date(
            currentYear,
            currentMonth + 1,
            0
        ).getDate();


    const firstDay =
        new Date(
            currentYear,
            currentMonth,
            1
        ).getDay();


    // =========================================================
    // FIND ATTENDANCE FOR DATE
    // =========================================================

    const getAttendanceForDay =
        (day) => {

            return attendance.find(
                item => {

                    if (
                        !item.attendanceDate
                    ) {
                        return false;
                    }


                    const date =
                        new Date(
                            item.attendanceDate
                        );


                    return (
                        date.getFullYear() ===
                            currentYear &&
                        date.getMonth() ===
                            currentMonth &&
                        date.getDate() ===
                            day
                    );

                }
            );

        };


    // =========================================================
    // CHECK WEEKEND
    // =========================================================

    const isWeekend =
        (day) => {

            const date =
                new Date(
                    currentYear,
                    currentMonth,
                    day
                );

            const weekday =
                date.getDay();

            return (
                weekday === 0 ||
                weekday === 6
            );

        };


    // =========================================================
    // FORMAT TIME
    // =========================================================

    const formatTime =
        (value) => {

            if (!value) {
                return "--";
            }


            return new Date(
                value
            ).toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        };


    // =========================================================
    // GO BACK
    // =========================================================

    const goBack =
        () => {

            navigate(
                "/faculty-dashboard"
            );

        };


    // =========================================================
    // CALENDAR CELLS
    // =========================================================

    const calendarDays = [];


    // Empty cells before day 1

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        calendarDays.push(
            <div
                key={`empty-${i}`}
                className="calendar-day empty-day"
            />
        );

    }


    // Actual days

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const record =
            getAttendanceForDay(day);


        const weekend =
            isWeekend(day);


        let dayStatus =
            "normal";


        if (record) {

            if (
                record.status ===
                "PRESENT"
            ) {

                dayStatus =
                    "present";

            } else {

                dayStatus =
                    "absent";

            }

        } else if (weekend) {

            dayStatus =
                "holiday";

        } else if (
            new Date(
                currentYear,
                currentMonth,
                day
            ) < currentDate
        ) {

            dayStatus =
                "absent";

        }


        const isToday =
            day === currentDate.getDate();


        calendarDays.push(

            <div
                key={day}
                className={`calendar-day ${dayStatus} ${
                    isToday
                        ? "today"
                        : ""
                }`}
                title={
                    record
                        ? `Status: ${record.status}`
                        : dayStatus === "holiday"
                            ? "Holiday"
                            : dayStatus === "absent"
                                ? "Absent"
                                : "No attendance"
                }
            >

                <div className="date-number">
                    {day}
                </div>


                {record &&
                    record.status ===
                        "PRESENT" && (

                    <FaCheckCircle
                        className="day-icon"
                    />

                )}


                {!record &&
                    dayStatus ===
                        "absent" && (

                    <FaTimesCircle
                        className="day-icon"
                    />

                )}


                {dayStatus ===
                    "holiday" && (

                    <FaUmbrellaBeach
                        className="day-icon"
                    />

                )}

            </div>

        );

    }


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <main className="attendance-history-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="history-header">

                <button
                    className="back-button"
                    onClick={goBack}
                >

                    <FaArrowLeft />

                    <span>
                        Back to Dashboard
                    </span>

                </button>


                <div className="history-title">

                    <FaCalendarAlt />

                    <div>

                        <h1>
                            Attendance History
                        </h1>

                        <p>
                            {user?.fullName ||
                                "Faculty"}
                        </p>

                    </div>

                </div>

            </header>


            {/* =================================================
                MONTH TITLE
            ================================================= */}

            <section className="month-header">

                <h2>
                    {monthName}
                </h2>

                <p>
                    Current Month Attendance
                </p>

            </section>


            {/* =================================================
                LEGEND
            ================================================= */}

            <section className="attendance-legend">

                <div className="legend-item">

                    <span className="legend-circle present-color">
                        1
                    </span>

                    <span>
                        Present
                    </span>

                </div>


                <div className="legend-item">

                    <span className="legend-circle absent-color">
                        1
                    </span>

                    <span>
                        Absent
                    </span>

                </div>


                <div className="legend-item">

                    <span className="legend-circle holiday-color">
                        1
                    </span>

                    <span>
                        Holiday
                    </span>

                </div>

            </section>


            {/* =================================================
                CALENDAR
            ================================================= */}

            <section className="calendar-card">


                <div className="weekday-row">

                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>

                </div>


                {loading && (

                    <div className="history-loading">

                        Loading attendance...

                    </div>

                )}


                {!loading && error && (

                    <div className="history-error">

                        {error}

                    </div>

                )}


                {!loading && !error && (

                    <div className="calendar-grid">

                        {calendarDays}

                    </div>

                )}

            </section>


            {/* =================================================
                SELECTED/RECENT RECORDS
            ================================================= */}

            {!loading &&
                attendance.length > 0 && (

                <section className="monthly-records">

                    <div className="records-heading">

                        <h2>
                            Attendance Details
                        </h2>

                        <span>
                            {attendance.length}
                            {" "}
                            record(s)
                        </span>

                    </div>


                    {attendance.map(
                        record => (

                        <div
                            className="attendance-record"
                            key={record.id}
                        >

                            <div>

                                <strong>
                                    {record.attendanceDate}
                                </strong>

                                <span>
                                    {record.status}
                                </span>

                            </div>


                            <div>

                                <small>
                                    Clock In
                                </small>

                                <strong>
                                    {formatTime(
                                        record.clockIn
                                    )}
                                </strong>

                            </div>


                            <div>

                                <small>
                                    Clock Out
                                </small>

                                <strong>
                                    {formatTime(
                                        record.clockOut
                                    )}
                                </strong>

                            </div>


                            <div>

                                <small>
                                    Working Time
                                </small>

                                <strong>
                                    {record.workingMinutes ??
                                        0}
                                    {" "}
                                    min
                                </strong>

                            </div>

                        </div>

                    ))}

                </section>

            )}


        </main>

    );

}


export default AttendanceHistory;

