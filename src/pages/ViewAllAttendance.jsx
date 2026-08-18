import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    FaArrowLeft,
    FaListAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaCalendarAlt,
    FaSpinner
} from "react-icons/fa";

import "./ViewAllAttendance.css";


function ViewAllAttendance() {

    const navigate = useNavigate();


    // =========================================================
    // USER
    // =========================================================

    const [user, setUser] = useState(null);


    // =========================================================
    // ATTENDANCE
    // =========================================================

    const [attendanceHistory, setAttendanceHistory] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================================================
    // LOAD USER + ATTENDANCE
    // =========================================================

    useEffect(() => {

        const storedUser =
            localStorage.getItem("user");


        console.log(
            "Stored user from localStorage:",
            storedUser
        );


        if (!storedUser) {

            navigate("/", {
                replace: true
            });

            return;
        }


        try {

            const parsedUser =
                JSON.parse(storedUser);


            console.log(
                "Parsed user:",
                parsedUser
            );


            if (
                !parsedUser ||
                !parsedUser.email
            ) {

                console.error(
                    "User email is missing from localStorage."
                );


                localStorage.removeItem("user");


                navigate("/", {
                    replace: true
                });

                return;
            }


            setUser(parsedUser);


            console.log(
                "Loading attendance for email:",
                parsedUser.email
            );


            loadAttendance(
                parsedUser.email
            );


        } catch (err) {

            console.error(
                "User loading error:",
                err
            );


            localStorage.removeItem("user");


            navigate("/", {
                replace: true
            });
        }


    }, [navigate]);


    // =========================================================
    // LOAD COMPLETE ATTENDANCE HISTORY
    // =========================================================

    const loadAttendance = async (email) => {

        try {

            setLoading(true);

            setError("");


            console.log(
                "========================================"
            );

            console.log(
                "Loading COMPLETE attendance history"
            );

            console.log(
                "Email being sent:",
                email
            );

            console.log(
                "API:",
                "http://localhost:8080/api/attendance/all"
            );


            // -------------------------------------------------
            // CALL /all
            // -------------------------------------------------

            const response =
                await axios.get(
                    "http://localhost:8080/api/attendance/all",
                    {
                        params: {
                            email: email
                        }
                    }
                );


            console.log(
                "Response status:",
                response.status
            );


            console.log(
                "Response data:",
                response.data
            );


            console.log(
                "Response data type:",
                typeof response.data
            );


            console.log(
                "Is array:",
                Array.isArray(response.data)
            );


            console.log(
                "Response data length:",
                Array.isArray(response.data)
                    ? response.data.length
                    : "NOT ARRAY"
            );


            console.log(
                "========================================"
            );


            // -------------------------------------------------
            // MAKE SURE RESPONSE IS ARRAY
            // -------------------------------------------------

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];


            // -------------------------------------------------
            // NO DATA
            // -------------------------------------------------

            if (data.length === 0) {

                console.warn(
                    "Backend returned an EMPTY attendance array."
                );

            }


            // -------------------------------------------------
            // GROUP BY MONTH
            // -------------------------------------------------

            const groupedData =
                groupAttendanceByMonth(
                    data
                );


            console.log(
                "Grouped attendance:",
                groupedData
            );


            setAttendanceHistory(
                groupedData
            );


        } catch (err) {

            console.error(
                "========================================"
            );

            console.error(
                "Attendance history loading error:",
                err
            );


            console.error(
                "Error response:",
                err.response?.data
            );


            console.error(
                "Error status:",
                err.response?.status
            );


            console.error(
                "========================================"
            );


            if (
                err.response?.status === 401
            ) {

                setError(
                    "Your session has expired. Please login again."
                );


            } else if (
                err.response?.status === 403
            ) {

                setError(
                    "You are not authorized to view attendance history."
                );


            } else if (
                err.response?.status === 404
            ) {

                setError(
                    err.response?.data?.message ||
                    "Faculty account not found."
                );


            } else {

                setError(
                    err.response?.data?.message ||
                    "Unable to load attendance history."
                );

            }


        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // GROUP ATTENDANCE BY MONTH
    // =========================================================

    const groupAttendanceByMonth = (
        records
    ) => {

        const grouped = {};


        records.forEach(
            (record) => {

                if (
                    !record ||
                    !record.attendanceDate
                ) {

                    return;
                }


                /*
                 * Backend date:
                 *
                 * 2026-08-15
                 *
                 * Adding T00:00:00 prevents
                 * timezone date shifting.
                 */

                const date =
                    new Date(
                        record.attendanceDate +
                        "T00:00:00"
                    );


                if (
                    Number.isNaN(
                        date.getTime()
                    )
                ) {

                    return;
                }


                const year =
                    date.getFullYear();


                const month =
                    date.getMonth();


                const monthKey =
                    `${year}-${String(
                        month + 1
                    ).padStart(2, "0")}`;


                if (
                    !grouped[monthKey]
                ) {

                    grouped[monthKey] = {

                        year: year,

                        month: month,

                        records: []

                    };

                }


                grouped[monthKey]
                    .records
                    .push(record);

            }
        );


        return Object.values(
            grouped
        )

            // Newest month first
            .sort(
                (a, b) => {

                    if (
                        a.year !==
                        b.year
                    ) {

                        return (
                            b.year -
                            a.year
                        );

                    }


                    return (
                        b.month -
                        a.month
                    );

                }
            )

            // Sort records inside month
            .map(
                (monthData) => {

                    return {

                        ...monthData,

                        records:
                            [
                                ...monthData.records
                            ].sort(
                                (a, b) => {

                                    return (
                                        new Date(
                                            b.attendanceDate +
                                            "T00:00:00"
                                        ) -
                                        new Date(
                                            a.attendanceDate +
                                            "T00:00:00"
                                        )
                                    );

                                }
                            )

                    };

                }
            );

    };


    // =========================================================
    // FORMAT MONTH
    // =========================================================

    const formatMonth = (
        year,
        month
    ) => {

        return new Date(
            year,
            month,
            1
        ).toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );

    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (
        dateValue
    ) => {

        if (!dateValue) {

            return "--";

        }


        const date =
            new Date(
                dateValue +
                "T00:00:00"
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                dateValue
            );

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    };


    // =========================================================
    // FORMAT TIME
    // =========================================================

    const formatTime = (
        dateTime
    ) => {

        if (!dateTime) {

            return "--";

        }


        const date =
            new Date(
                dateTime
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "--";

        }


        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        );

    };


    // =========================================================
    // FORMAT WORKING TIME
    // =========================================================

    const formatWorkingTime = (
        workingMinutes
    ) => {

        if (
            workingMinutes === null ||
            workingMinutes === undefined
        ) {

            return "--";

        }


        const minutes =
            Number(
                workingMinutes
            );


        if (
            Number.isNaN(minutes) ||
            minutes < 0
        ) {

            return "--";

        }


        const hours =
            Math.floor(
                minutes / 60
            );


        const remainingMinutes =
            minutes % 60;


        return (
            String(hours)
                .padStart(2, "0") +
            ":" +
            String(
                remainingMinutes
            ).padStart(
                2,
                "0"
            )
        );

    };


    // =========================================================
    // GET STATUS
    // =========================================================

    const getStatus = (
        record
    ) => {

        const status =
            String(
                record?.status || ""
            ).toUpperCase();


        if (
            status === "PRESENT"
        ) {

            return "Present";

        }


        if (
            status === "ABSENT"
        ) {

            return "Absent";

        }


        if (
            status === "HOLIDAY"
        ) {

            return "Holiday";

        }


        /*
         * If status is missing but clockIn
         * exists, treat it as Present.
         */

        if (
            record?.clockIn
        ) {

            return "Present";

        }


        return "Absent";

    };


    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = (
        status
    ) => {

        switch (status) {

            case "Present":

                return "status-present";


            case "Absent":

                return "status-absent";


            case "Holiday":

                return "status-holiday";


            default:

                return "";

        }

    };


    // =========================================================
    // GET DEPARTMENT NAME
    // =========================================================

    const getDepartmentName = () => {

        if (!user?.department) {

            return "Department";

        }


        /*
         * Backend User entity returns:
         *
         * department: {
         *     id: 1,
         *     name: "...",
         *     code: "CSE"
         * }
         */

        if (
            typeof user.department ===
            "object"
        ) {

            return (
                user.department.name ||
                user.department.code ||
                "Department"
            );

        }


        return String(
            user.department
        );

    };


    // =========================================================
    // BACK TO DASHBOARD
    // =========================================================

    const handleBack = () => {

        navigate(
            "/faculty-dashboard"
        );

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <main className="view-all-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="view-all-header">


                <button
                    className="back-button"
                    onClick={
                        handleBack
                    }
                >

                    <FaArrowLeft />

                    <span>
                        Back to Dashboard
                    </span>

                </button>


                <div className="view-all-title">

                    <FaListAlt />

                    <div>

                        <h1>
                            Complete Attendance History
                        </h1>


                        <p>

                            {user?.fullName ||
                                "Faculty"}

                            {" • "}

                            {getDepartmentName()}

                        </p>

                    </div>

                </div>


            </header>


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

                <div className="attendance-loading">

                    <FaSpinner
                        className="loading-spinner"
                    />

                    <span>
                        Loading attendance history...
                    </span>

                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {!loading &&
                error && (

                    <div className="attendance-error">

                        <FaTimesCircle />

                        <h3>
                            Unable to Load Attendance
                        </h3>


                        <p>
                            {error}
                        </p>


                        <button
                            onClick={() => {

                                if (
                                    user?.email
                                ) {

                                    loadAttendance(
                                        user.email
                                    );

                                }

                            }}
                        >

                            Try Again

                        </button>

                    </div>

                )}


            {/* =================================================
                NO RECORDS
            ================================================= */}

            {!loading &&
                !error &&
                attendanceHistory.length === 0 && (

                    <div className="attendance-empty">

                        <FaCalendarAlt />

                        <h3>
                            No Attendance History
                        </h3>


                        <p>
                            No attendance records are
                            available for your account.
                        </p>

                    </div>

                )}


            {/* =================================================
                ATTENDANCE HISTORY
            ================================================= */}

            {!loading &&
                !error &&
                attendanceHistory.length > 0 && (

                    <section className="history-container">


                        {attendanceHistory.map(
                            (monthData) => (

                                <div
                                    className="month-history-card"
                                    key={
                                        `${monthData.year}-${monthData.month}`
                                    }
                                >


                                    {/* =================================
                                        MONTH HEADER
                                    ================================= */}

                                    <div className="month-history-header">


                                        <div>

                                            <FaCalendarAlt />

                                            <h2>
                                                {formatMonth(
                                                    monthData.year,
                                                    monthData.month
                                                )}
                                            </h2>

                                        </div>


                                        <span>

                                            {
                                                monthData
                                                    .records
                                                    .length
                                            }

                                            {" "}

                                            Record

                                            {
                                                monthData
                                                    .records
                                                    .length !== 1
                                                    ? "s"
                                                    : ""
                                            }

                                        </span>


                                    </div>


                                    {/* =================================
                                        TABLE
                                    ================================= */}

                                    <div className="attendance-table-wrapper">


                                        <table className="attendance-table">


                                            <thead>

                                                <tr>

                                                    <th>
                                                        Date
                                                    </th>

                                                    <th>
                                                        Clock In
                                                    </th>

                                                    <th>
                                                        Clock Out
                                                    </th>

                                                    <th>
                                                        Working Time
                                                    </th>

                                                    <th>
                                                        Status
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>


                                                {monthData.records.map(
                                                    (
                                                        record,
                                                        index
                                                    ) => {

                                                        const status =
                                                            getStatus(
                                                                record
                                                            );


                                                        return (

                                                            <tr
                                                                key={
                                                                    record.id ||
                                                                    `${record.attendanceDate}-${index}`
                                                                }
                                                            >


                                                                <td>

                                                                    {formatDate(
                                                                        record.attendanceDate
                                                                    )}

                                                                </td>


                                                                <td>

                                                                    {formatTime(
                                                                        record.clockIn
                                                                    )}

                                                                </td>


                                                                <td>

                                                                    {formatTime(
                                                                        record.clockOut
                                                                    )}

                                                                </td>


                                                                <td>

                                                                    {formatWorkingTime(
                                                                        record.workingMinutes
                                                                    )}

                                                                </td>


                                                                <td>

                                                                    <span
                                                                        className={
                                                                            `attendance-status ${getStatusClass(
                                                                                status
                                                                            )}`
                                                                        }
                                                                    >


                                                                        {status ===
                                                                            "Present" && (

                                                                            <FaCheckCircle />

                                                                        )}


                                                                        {status ===
                                                                            "Absent" && (

                                                                            <FaTimesCircle />

                                                                        )}


                                                                        {status ===
                                                                            "Holiday" && (

                                                                            <FaCalendarAlt />

                                                                        )}


                                                                        {status}

                                                                    </span>

                                                                </td>


                                                            </tr>

                                                        );

                                                    }
                                                )}


                                            </tbody>


                                        </table>


                                    </div>


                                </div>

                            )
                        )}


                    </section>

                )}


        </main>

    );

}


export default ViewAllAttendance;

