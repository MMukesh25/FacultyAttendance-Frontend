import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaUserCircle,
    FaSignOutAlt,
    FaClock,
    FaCalendarAlt,
    FaClipboardList,
    FaFileAlt,
    FaListAlt,
    FaMapMarkerAlt
} from "react-icons/fa";

import axios from "axios";

import "./FacultyDashboard.css";


function FacultyDashboard() {

    const navigate = useNavigate();


    // =========================================================
    // USER
    // =========================================================

    const [user, setUser] = useState(null);


    // =========================================================
    // ATTENDANCE
    // =========================================================

    const [attendance, setAttendance] = useState(null);

    const [loadingAttendance, setLoadingAttendance] =
        useState(true);

    const [attendanceLoading, setAttendanceLoading] =
        useState(false);

    const [error, setError] = useState("");


    // =========================================================
    // LIVE TIMER
    // =========================================================

    const [workingSeconds, setWorkingSeconds] =
        useState(0);


    // =========================================================
    // LOAD USER
    // =========================================================

    useEffect(() => {

        const storedUser =
            localStorage.getItem("user");


        if (!storedUser) {

            navigate("/login", {
                replace: true
            });

            return;

        }


        try {

            const parsedUser =
                JSON.parse(storedUser);


            if (!parsedUser?.id) {

                localStorage.removeItem("user");

                navigate("/login", {
                    replace: true
                });

                return;

            }


            setUser(parsedUser);


        } catch (error) {

            localStorage.removeItem("user");

            navigate("/login", {
                replace: true
            });

        }

    }, [navigate]);


    // =========================================================
    // GET TODAY'S ATTENDANCE
    // =========================================================

    useEffect(() => {

        if (!user?.email) {
            return;
        }


        loadTodayAttendance();


    }, [user]);


    const loadTodayAttendance = async () => {

        try {

            setLoadingAttendance(true);

            setError("");


            const response =
                await axios.get(
                    "http://localhost:8080/api/attendance/today",
                    {
                        params: {
                            email: user.email
                        }
                    }
                );


            if (
                response.data &&
                response.data.marked === false
            ) {

                setAttendance(null);

                setWorkingSeconds(0);

            } else {

                setAttendance(response.data);

                calculateWorkingTime(
                    response.data
                );

            }


        } catch (error) {

            console.error(
                "Today's attendance error:",
                error
            );


            if (error.response?.status === 403) {

                setError(
                    "You are not authorized to view attendance."
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "Unable to load today's attendance."
                );

            }

        } finally {

            setLoadingAttendance(false);

        }

    };


    // =========================================================
    // CALCULATE WORKING TIME
    // =========================================================

    const calculateWorkingTime = (
        attendanceData
    ) => {

        if (!attendanceData?.clockIn) {

            setWorkingSeconds(0);

            return;

        }


        const clockInTime =
            new Date(
                attendanceData.clockIn
            ).getTime();


        let endTime;


        if (attendanceData.clockOut) {

            endTime =
                new Date(
                    attendanceData.clockOut
                ).getTime();

        } else {

            endTime =
                Date.now();

        }


        const seconds =
            Math.max(
                0,
                Math.floor(
                    (endTime - clockInTime) / 1000
                )
            );


        setWorkingSeconds(seconds);

    };


    // =========================================================
    // LIVE WORKING TIMER
    // =========================================================

    useEffect(() => {

        if (
            !attendance?.clockIn ||
            attendance?.clockOut
        ) {

            return;

        }


        const timer =
            setInterval(() => {

                calculateWorkingTime(
                    attendance
                );

            }, 1000);


        return () => {

            clearInterval(timer);

        };

    }, [attendance]);


    // =========================================================
    // FORMAT TIME
    // =========================================================

    const formatTimer = (
        totalSeconds
    ) => {

        const hours =
            Math.floor(
                totalSeconds / 3600
            );

        const minutes =
            Math.floor(
                (totalSeconds % 3600) / 60
            );

        const seconds =
            totalSeconds % 60;


        return [
            hours,
            minutes,
            seconds
        ]
            .map(
                value =>
                    String(value)
                        .padStart(2, "0")
            )
            .join(":");

    };


    // =========================================================
    // FORMAT CLOCK TIME
    // =========================================================

    const formatClockTime = (
        value
    ) => {

        if (!value) {
            return "--";
        }


        const date =
            new Date(value);


        if (Number.isNaN(
            date.getTime()
        )) {

            return "--";

        }


        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    };


    // =========================================================
    // GET CURRENT LOCATION
    // =========================================================

    const getCurrentLocation = () => {

        return new Promise(
            (resolve, reject) => {

                if (
                    !navigator.geolocation
                ) {

                    reject(
                        new Error(
                            "Location services are not supported by this browser."
                        )
                    );

                    return;

                }


                navigator.geolocation.getCurrentPosition(

                    position => {

                        resolve({
                            latitude:
                                position.coords.latitude,

                            longitude:
                                position.coords.longitude
                        });

                    },

                    error => {

                        let message =
                            "Unable to get your location.";


                        if (
                            error.code ===
                            error.PERMISSION_DENIED
                        ) {

                            message =
                                "Location permission was denied. Please allow location access.";

                        } else if (
                            error.code ===
                            error.POSITION_UNAVAILABLE
                        ) {

                            message =
                                "Your current location is unavailable.";

                        } else if (
                            error.code ===
                            error.TIMEOUT
                        ) {

                            message =
                                "Location request timed out. Please try again.";

                        }


                        reject(
                            new Error(message)
                        );

                    },

                    {
                        enableHighAccuracy: true,

                        timeout: 15000,

                        maximumAge: 0
                    }

                );

            }
        );

    };


    // =========================================================
    // CLOCK IN
    // =========================================================

    const handleClockIn = async () => {

        if (!user?.email) {
            return;
        }


        try {

            setAttendanceLoading(true);

            setError("");


            const location =
                await getCurrentLocation();


            const response =
                await axios.post(
                    "http://localhost:8080/api/attendance/clock-in",
                    {
                        email: user.email,

                        latitude:
                            location.latitude,

                        longitude:
                            location.longitude
                    }
                );


            setAttendance(
                response.data
            );


            calculateWorkingTime(
                response.data
            );


        } catch (error) {

            console.error(
                "Clock in error:",
                error
            );


            setError(
                error.message ||
                error.response?.data?.message ||
                "Unable to clock in."
            );


            if (
                error.response?.data?.message
            ) {

                setError(
                    error.response.data.message
                );

            }

        } finally {

            setAttendanceLoading(false);

        }

    };


    // =========================================================
    // CLOCK OUT
    // =========================================================

    const handleClockOut = async () => {

        if (!user?.email) {
            return;
        }


        try {

            setAttendanceLoading(true);

            setError("");


            const location =
                await getCurrentLocation();


            const response =
                await axios.post(
                    "http://localhost:8080/api/attendance/clock-out",
                    {
                        email: user.email,

                        latitude:
                            location.latitude,

                        longitude:
                            location.longitude
                    }
                );


            setAttendance(
                response.data
            );


            calculateWorkingTime(
                response.data
            );


        } catch (error) {

            console.error(
                "Clock out error:",
                error
            );


            if (
                error.response?.data?.message
            ) {

                setError(
                    error.response.data.message
                );

            } else {

                setError(
                    error.message ||
                    "Unable to clock out."
                );

            }

        } finally {

            setAttendanceLoading(false);

        }

    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {

        localStorage.removeItem("user");

        navigate("/login", {
            replace: true
        });

    };


    // =========================================================
    // TODAY
    // =========================================================

    const today =
        new Date().toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );


    // =========================================================
    // BUTTON STATE
    // =========================================================

    const isClockedIn =
        attendance?.clockIn &&
        !attendance?.clockOut;


    const isCompleted =
        attendance?.clockIn &&
        attendance?.clockOut;


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <main className="faculty-dashboard">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="faculty-header">

                <div className="faculty-welcome">

                    <FaUserCircle
                        className="faculty-profile-icon"
                    />

                    <div>

                        <p className="welcome-label">
                            Welcome Back
                        </p>

                        <h1>
                            {user?.fullName || "Faculty"}
                        </h1>

                    </div>

                </div>


                <button
                    className="logout-button"
                    onClick={handleLogout}
                >

                    <FaSignOutAlt />

                    <span>
                        Logout
                    </span>

                </button>

            </header>


            {/* =================================================
                FACULTY INFORMATION
            ================================================= */}

            <section className="faculty-profile-card">

                <div className="profile-item">

                    <span>
                        Faculty Name
                    </span>

                    <strong>
                        {user?.fullName || "--"}
                    </strong>

                </div>


                <div className="profile-item">

                    <span>
                        Department
                    </span>

                    <strong>
                        {user?.department || "--"}
                    </strong>

                </div>


                <div className="profile-item">

                    <span>
                        Role
                    </span>

                    <strong>
                        {user?.role || "--"}
                    </strong>

                </div>


                <div className="profile-item">

                    <span>
                        Date
                    </span>

                    <strong>
                        {today}
                    </strong>

                </div>

            </section>


            {/* =================================================
                TODAY'S ATTENDANCE
            ================================================= */}

            <section className="attendance-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Today's Attendance
                        </h2>

                        <p>
                            Mark your attendance from the college location.
                        </p>

                    </div>

                    <FaClock />

                </div>


                {/* ERROR */}

                {error && (

                    <div className="attendance-error">

                        <FaMapMarkerAlt />

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                <div className="attendance-card">


                    {/* ACTIVE IN */}

                    <div className="time-box">

                        <span>
                            Active In
                        </span>

                        <strong>
                            {loadingAttendance
                                ? "Loading..."
                                : formatClockTime(
                                    attendance?.clockIn
                                )
                            }
                        </strong>

                    </div>


                    {/* WORKING TIME */}

                    <div className="time-box timer-box">

                        <span>
                            Working Time
                        </span>

                        <strong>

                            {loadingAttendance
                                ? "--:--:--"
                                : formatTimer(
                                    workingSeconds
                                )
                            }

                        </strong>

                    </div>


                    {/* ACTIVE OUT */}

                    <div className="time-box">

                        <span>
                            Active Out
                        </span>

                        <strong>
                            {formatClockTime(
                                attendance?.clockOut
                            )}
                        </strong>

                    </div>


                    {/* CLOCK BUTTON */}

                    <div className="attendance-action">

                        {!isClockedIn &&
                            !isCompleted && (

                            <button
                                className="clock-button"
                                onClick={
                                    handleClockIn
                                }
                                disabled={
                                    attendanceLoading ||
                                    loadingAttendance
                                }
                            >

                                <FaClock />

                                <span>

                                    {attendanceLoading
                                        ? "GETTING LOCATION..."
                                        : "CLOCK IN"
                                    }

                                </span>

                            </button>

                        )}


                        {isClockedIn && (

                            <button
                                className="clock-button clock-out-button"
                                onClick={
                                    handleClockOut
                                }
                                disabled={
                                    attendanceLoading
                                }
                            >

                                <FaClock />

                                <span>

                                    {attendanceLoading
                                        ? "GETTING LOCATION..."
                                        : "CLOCK OUT"
                                    }

                                </span>

                            </button>

                        )}


                        {isCompleted && (

                            <div className="attendance-completed">

                                <span>
                                    ✓
                                </span>

                                Attendance Completed

                            </div>

                        )}

                    </div>

                </div>

            </section>


            {/* =================================================
                DASHBOARD MODULES
            ================================================= */}

            <section className="dashboard-modules">


                {/* =================================================
                    ATTENDANCE HISTORY
                ================================================= */}

                <div className="dashboard-module">

                    <div className="module-icon calendar-icon">

                        <FaCalendarAlt />

                    </div>


                    <div className="module-content">

                        <h2>
                            Attendance History
                        </h2>

                        <p>
                            View your current month's attendance in a calendar format.
                        </p>

                    </div>


                    <button
                        className="module-button"
                        onClick={() =>
                            navigate(
                                "/attendance-history"
                            )
                        }
                    >

                        <FaCalendarAlt />

                        <span>
                            Open Calendar
                        </span>

                    </button>

                </div>


                {/* =================================================
                    VIEW ALL
                ================================================= */}

                <div className="dashboard-module">

                    <div className="module-icon view-all-icon">

                        <FaListAlt />

                    </div>


                    <div className="module-content">

                        <h2>
                            View All
                        </h2>

                        <p>
                            View your complete attendance history.
                        </p>

                    </div>


                    <button
                        className="module-button"
                        onClick={() =>
                            navigate(
                                "/attendance-all"
                            )
                        }
                    >

                        <FaListAlt />

                        <span>
                            View All
                        </span>

                    </button>

                </div>


                {/* =================================================
                    APPLY LEAVE
                ================================================= */}

                <div className="dashboard-module">

                    <div className="module-icon leave-icon">

                        <FaFileAlt />

                    </div>


                    <div className="module-content">

                        <h2>
                            Leave Request
                        </h2>

                        <p>
                            Apply for leave and track your request status.
                        </p>

                    </div>


                    <button
                        className="module-button"
                        onClick={() =>
                            navigate(
                                "/apply-leave"
                            )
                        }
                    >

                        <FaClipboardList />

                        <span>
                            Apply Leave
                        </span>

                    </button>

                </div>


            </section>

        </main>

    );

}


export default FacultyDashboard;

