import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    FaUserShield,
    FaSignOutAlt,
    FaUsers,
    FaUserCheck,
    FaUserTimes,
    FaClock,
    FaBuilding,
    FaChevronRight,
    FaBell,
    FaCheck,
    FaTimes,
    FaCalendarDay,
    FaPhone,
    FaEnvelope,
    FaSpinner,
    FaCalendarAlt,
    FaHistory,
    FaArrowLeft,
    FaArrowRight,
    FaMapMarkerAlt
} from "react-icons/fa";

import "./AdminDashboard.css";


function AdminDashboard() {

    const navigate = useNavigate();


    // =========================================================
    // ADMIN
    // =========================================================

    const [user, setUser] = useState(null);


    // =========================================================
    // FACULTY
    // =========================================================

    const [facultyList, setFacultyList] = useState([]);

    const [selectedDepartment, setSelectedDepartment] =
        useState("ALL");

    const [loadingFaculty, setLoadingFaculty] =
        useState(false);

    const [facultyError, setFacultyError] =
        useState("");


    // =========================================================
    // LEAVE REQUESTS
    // =========================================================

    const [leaveRequests, setLeaveRequests] =
        useState([]);

    const [showLeaveRequests, setShowLeaveRequests] =
        useState(false);

    const [loadingLeaves, setLoadingLeaves] =
        useState(false);

    const [leaveError, setLeaveError] =
        useState("");

    const [processingLeaveId, setProcessingLeaveId] =
        useState(null);


    // =========================================================
    // SELECTED FACULTY
    // =========================================================

    const [selectedFaculty, setSelectedFaculty] =
        useState(null);


    // =========================================================
    // FACULTY ATTENDANCE
    // =========================================================

    const [facultyAttendance, setFacultyAttendance] =
        useState([]);

    const [loadingAttendance, setLoadingAttendance] =
        useState(false);

    const [attendanceError, setAttendanceError] =
        useState("");

    const [showAllHistory, setShowAllHistory] =
        useState(false);


    // =========================================================
    // LOAD ADMIN FROM LOCAL STORAGE
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


            if (
                String(parsedUser.role).toUpperCase() !==
                "ADMIN"
            ) {

                navigate("/faculty-dashboard", {
                    replace: true
                });

                return;
            }


            setUser(parsedUser);

        } catch (error) {

            console.error(
                "Admin loading error:",
                error
            );

            localStorage.removeItem("user");

            navigate("/login", {
                replace: true
            });

        }

    }, [navigate]);


    // =========================================================
    // LOAD TODAY'S FACULTY ATTENDANCE
    // =========================================================

    useEffect(() => {

        const loadFaculty = async () => {

            try {

                setLoadingFaculty(true);

                setFacultyError("");


                const response =
                    await axios.get(
                        "http://localhost:8080/api/admin/faculty/today"
                    );


                const data =
                    Array.isArray(response.data)
                        ? response.data
                        : [];


                setFacultyList(data);

            } catch (error) {

                console.error(
                    "Faculty loading error:",
                    error
                );


                if (
                    error.response?.status === 403
                ) {

                    setFacultyError(
                        "You are not authorized to view faculty attendance."
                    );

                } else {

                    setFacultyError(
                        error.response?.data?.message ||
                        "Unable to load today's faculty attendance."
                    );

                }

            } finally {

                setLoadingFaculty(false);

            }

        };


        loadFaculty();

    }, []);


    // =========================================================
    // LOAD PENDING LEAVE REQUESTS
    // =========================================================
    //
    // BACKEND:
    // GET /api/leaves/admin/pending
    //
    // =========================================================

    const loadLeaveRequests = async () => {

        try {

            setLoadingLeaves(true);

            setLeaveError("");


            const response =
                await axios.get(
                    "http://localhost:8080/api/leaves/admin/pending"
                );


            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];


            console.log(
                "Pending leave requests:",
                data
            );


            setLeaveRequests(data);

        } catch (error) {

            console.error(
                "Leave request loading error:",
                error
            );


            if (
                error.response?.status === 403
            ) {

                setLeaveError(
                    "You are not authorized to view leave requests."
                );

            } else if (
                error.response?.status === 404
            ) {

                setLeaveError(
                    "Leave request API was not found."
                );

            } else {

                setLeaveError(
                    error.response?.data?.message ||
                    "Unable to load leave requests."
                );

            }

        } finally {

            setLoadingLeaves(false);

        }

    };


    // =========================================================
    // LOAD PENDING LEAVE COUNT
    // =========================================================

    const loadLeaveCount = async () => {

        try {

            const response =
                await axios.get(
                    "http://localhost:8080/api/leaves/admin/count"
                );


            const count =
                Number(
                    response.data?.count || 0
                );


            /*
             * We keep the actual pending list in state.
             * The count endpoint is mainly useful when
             * opening / refreshing the dashboard.
             */

            console.log(
                "Pending leave count:",
                count
            );

        } catch (error) {

            console.error(
                "Leave count loading error:",
                error
            );

        }

    };


    // =========================================================
    // LOAD LEAVES WHEN ADMIN IS AVAILABLE
    // =========================================================

    useEffect(() => {

        if (!user) {
            return;
        }


        loadLeaveRequests();

        loadLeaveCount();

    }, [user]);


    // =========================================================
    // OPEN LEAVE REQUEST MODAL
    // =========================================================

    const handleLeaveAlert = async () => {

        setShowLeaveRequests(true);

        await loadLeaveRequests();

    };


    // =========================================================
    // APPROVE / REJECT LEAVE
    // =========================================================
    //
    // BACKEND:
    // PUT /api/leaves/admin/process/{id}
    //
    // BODY:
    // {
    //     adminEmail: "...",
    //     status: "APPROVED",
    //     adminMessage: "..."
    // }
    //
    // =========================================================

    const handleLeaveAction = async (
        leaveId,
        action
    ) => {

        if (!leaveId) {
            return;
        }


        if (!user?.email) {

            setLeaveError(
                "Admin email is not available."
            );

            return;
        }


        try {

            setProcessingLeaveId(leaveId);

            setLeaveError("");


            const response =
                await axios.put(
                    `http://localhost:8080/api/leaves/admin/process/${leaveId}`,
                    {
                        adminEmail: user.email,

                        status: action,

                        adminMessage:
                            action === "APPROVED"
                                ? "Leave approved."
                                : "Leave rejected."
                    }
                );


            console.log(
                "Leave action response:",
                response.data
            );


            // Remove processed request
            // from pending list

            setLeaveRequests(
                previousRequests =>
                    previousRequests.filter(
                        request =>
                            request.id !== leaveId
                    )
            );


        } catch (error) {

            console.error(
                `${action} leave error:`,
                error
            );


            setLeaveError(
                error.response?.data?.message ||
                `Unable to ${
                    action === "APPROVED"
                        ? "approve"
                        : "reject"
                } leave request.`
            );

        } finally {

            setProcessingLeaveId(null);

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
    // DATE
    // =========================================================

    const todayDate =
        new Date();


    const todayKey =
        `${todayDate.getFullYear()}-${String(
            todayDate.getMonth() + 1
        ).padStart(2, "0")}-${String(
            todayDate.getDate()
        ).padStart(2, "0")}`;


    const today =
        todayDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );


    // =========================================================
    // DEPARTMENTS
    // =========================================================

    const departments = [
        ...new Map(
            facultyList
                .filter(
                    faculty =>
                        faculty.departmentCode
                )
                .map(
                    faculty => [
                        faculty.departmentCode,
                        {
                            code:
                                faculty.departmentCode,

                            name:
                                faculty.departmentName
                        }
                    ]
                )
        ).values()
    ];


    // =========================================================
    // FILTER FACULTY
    // =========================================================

    const filteredFaculty =
        selectedDepartment === "ALL"
            ? facultyList
            : facultyList.filter(
                faculty =>
                    faculty.departmentCode ===
                    selectedDepartment
            );


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
            new Date(dateTime);


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
    // FORMAT DATE
    // =========================================================

    const formatDate = (
        dateValue
    ) => {

        if (!dateValue) {
            return "--";
        }


        if (
            typeof dateValue === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(
                dateValue
            )
        ) {

            const [
                year,
                month,
                day
            ] = dateValue.split("-");


            return `${day}/${month}/${year}`;

        }


        const date =
            new Date(dateValue);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(dateValue);

        }


        return date.toLocaleDateString(
            "en-IN"
        );

    };


    // =========================================================
    // STATISTICS
    // =========================================================

    const totalFaculty =
        facultyList.length;


    const activeFaculty =
        facultyList.filter(
            faculty =>
                String(
                    faculty.accountStatus || ""
                ).toUpperCase() ===
                "ACTIVE"
        ).length;


    const disabledFaculty =
        facultyList.filter(
            faculty =>
                String(
                    faculty.accountStatus || ""
                ).toUpperCase() ===
                "DISABLED"
        ).length;


    const presentToday =
        facultyList.filter(
            faculty =>
                Boolean(
                    faculty.clockIn
                )
        ).length;


    // =========================================================
    // LOAD FACULTY ATTENDANCE
    // =========================================================

    const loadFacultyAttendance = async (
        facultyId
    ) => {

        try {

            setLoadingAttendance(true);

            setAttendanceError("");


            const now =
                new Date();


            const year =
                now.getFullYear();


            const month =
                now.getMonth() + 1;


            const response =
                await axios.get(
                    `http://localhost:8080/api/admin/faculty/${facultyId}/attendance`,
                    {
                        params: {
                            year,
                            month
                        }
                    }
                );


            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];


            setFacultyAttendance(data);

        } catch (error) {

            console.error(
                "Faculty attendance loading error:",
                error
            );


            if (
                error.response?.status === 404
            ) {

                setAttendanceError(
                    "Faculty attendance history was not found."
                );

            } else if (
                error.response?.status === 400
            ) {

                setAttendanceError(
                    "Invalid attendance year or month."
                );

            } else {

                setAttendanceError(
                    error.response?.data?.message ||
                    "Unable to load faculty attendance history."
                );

            }

        } finally {

            setLoadingAttendance(false);

        }

    };


    // =========================================================
    // OPEN FACULTY DETAILS
    // =========================================================

    const handleFacultyView = async (
        faculty
    ) => {

        setSelectedFaculty(faculty);

        setShowAllHistory(false);

        setFacultyAttendance([]);

        setAttendanceError("");


        await loadFacultyAttendance(
            faculty.id
        );

    };


    // =========================================================
    // NORMALIZE DATE
    // =========================================================

    const getDateKey = (
        value
    ) => {

        if (!value) {
            return null;
        }


        if (
            typeof value === "string" &&
            /^\d{4}-\d{2}-\d{2}/.test(
                value
            )
        ) {

            return value.substring(
                0,
                10
            );

        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return null;

        }


        return (
            `${date.getFullYear()}-` +
            `${String(
                date.getMonth() + 1
            ).padStart(2, "0")}-` +
            `${String(
                date.getDate()
            ).padStart(2, "0")}`
        );

    };


    // =========================================================
    // GET ATTENDANCE DATE
    // =========================================================

    const getAttendanceDate = (
        record
    ) => {

        return (
            record?.attendanceDate ||
            record?.date ||
            record?.attendance_date ||
            record?.day ||
            null
        );

    };


    // =========================================================
    // CHECK PRESENT
    // =========================================================

    const isAttendancePresent = (
        record
    ) => {

        if (!record) {
            return false;
        }


        const status =
            String(
                record.attendanceStatus ||
                record.status ||
                ""
            ).toUpperCase();


        if (
            status === "PRESENT" ||
            status === "COMPLETED"
        ) {

            return true;

        }


        return Boolean(
            record.clockIn ||
            record.clock_in
        );

    };


    // =========================================================
    // CURRENT MONTH
    // =========================================================

    const currentYear =
        todayDate.getFullYear();


    const currentMonth =
        todayDate.getMonth();


    const currentMonthName =
        todayDate.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );


    const daysInCurrentMonth =
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
    // CALENDAR DAYS
    // =========================================================

    const calendarDays = [];


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        calendarDays.push(null);

    }


    for (
        let day = 1;
        day <= daysInCurrentMonth;
        day++
    ) {

        const dateKey =
            `${currentYear}-${String(
                currentMonth + 1
            ).padStart(2, "0")}-${String(
                day
            ).padStart(2, "0")}`;


        const attendance =
            facultyAttendance.find(
                record =>
                    getDateKey(
                        getAttendanceDate(
                            record
                        )
                    ) === dateKey
            );


        const dateObject =
            new Date(
                currentYear,
                currentMonth,
                day
            );


        const todayObject =
            new Date(
                todayDate.getFullYear(),
                todayDate.getMonth(),
                todayDate.getDate()
            );


        const isFuture =
            dateObject >
            todayObject;


        calendarDays.push({
            day,
            dateKey,
            attendance,
            isFuture
        });

    }


    // =========================================================
    // MONTHLY HISTORY
    // =========================================================

    const monthlyHistory = {};


    facultyAttendance.forEach(
        record => {

            const dateKey =
                getDateKey(
                    getAttendanceDate(
                        record
                    )
                );


            if (!dateKey) {
                return;
            }


            const [
                year,
                month
            ] =
                dateKey.split("-");


            const monthKey =
                `${year}-${month}`;


            if (
                !monthlyHistory[
                    monthKey
                ]
            ) {

                monthlyHistory[
                    monthKey
                ] = {

                    year:
                        Number(year),

                    month:
                        Number(month),

                    records: []

                };

            }


            monthlyHistory[
                monthKey
            ].records.push(record);

        }
    );


    const sortedMonthlyHistory =
        Object.values(
            monthlyHistory
        ).sort(
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
        );


    // =========================================================
    // MONTH NAME
    // =========================================================

    const getMonthName = (
        year,
        month
    ) => {

        return new Date(
            year,
            month - 1,
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
    // MONTH PRESENT COUNT
    // =========================================================

    const getPresentCount = (
        records
    ) => {

        return records.filter(
            record =>
                isAttendancePresent(
                    record
                )
        ).length;

    };


    // =========================================================
    // CURRENT MONTH PRESENT COUNT
    // =========================================================

    const currentMonthPresentCount =
        facultyAttendance.filter(
            record => {

                const dateKey =
                    getDateKey(
                        getAttendanceDate(
                            record
                        )
                    );


                if (!dateKey) {
                    return false;
                }


                const expectedPrefix =
                    `${currentYear}-${String(
                        currentMonth + 1
                    ).padStart(2, "0")}`;


                return (
                    dateKey.startsWith(
                        expectedPrefix
                    ) &&
                    isAttendancePresent(
                        record
                    )
                );

            }
        ).length;


    // =========================================================
    // CURRENT MONTH ABSENT COUNT
    // =========================================================

    const currentMonthAbsentCount =
        calendarDays.filter(
            day =>
                day &&
                !day.isFuture &&
                !isAttendancePresent(
                    day.attendance
                )
        ).length;


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <main className="admin-dashboard">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="admin-header">

                <div className="admin-welcome">

                    <FaUserShield
                        className="admin-profile-icon"
                    />

                    <div>

                        <p className="admin-welcome-label">
                            Welcome Back
                        </p>

                        <h1>
                            {
                                user?.fullName ||
                                "System Admin"
                            }
                        </h1>

                    </div>

                </div>


                <div className="admin-header-actions">


                    {/* LEAVE REQUEST BUTTON */}

                    <button
                        className="leave-alert-button"
                        onClick={
                            handleLeaveAlert
                        }
                        title="Leave Requests"
                    >

                        <FaBell />

                        <span className="leave-alert-text">
                            Leave Requests
                        </span>


                        {leaveRequests.length > 0 && (

                            <span className="leave-alert-count">

                                {
                                    leaveRequests.length
                                }

                            </span>

                        )}

                    </button>


                    {/* LOGOUT */}

                    <button
                        className="admin-logout-button"
                        onClick={
                            handleLogout
                        }
                    >

                        <FaSignOutAlt />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </header>


            {/* =================================================
                ADMIN INFORMATION
            ================================================= */}

            <section className="admin-profile-card">

                <div className="admin-profile-item">

                    <span>
                        Administrator
                    </span>

                    <strong>
                        {
                            user?.fullName ||
                            "--"
                        }
                    </strong>

                </div>


                <div className="admin-profile-item">

                    <span>
                        Email Address
                    </span>

                    <strong>
                        {
                            user?.email ||
                            "--"
                        }
                    </strong>

                </div>


                <div className="admin-profile-item">

                    <span>
                        Role
                    </span>

                    <strong>
                        {
                            user?.role ||
                            "ADMIN"
                        }
                    </strong>

                </div>


                <div className="admin-profile-item">

                    <span>
                        Date
                    </span>

                    <strong>
                        {today}
                    </strong>

                </div>

            </section>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="admin-statistics">


                {/* TOTAL */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon faculty-stat-icon">
                        <FaUsers />
                    </div>

                    <div>

                        <span>
                            Total Faculty
                        </span>

                        <strong>
                            {totalFaculty}
                        </strong>

                    </div>

                </div>


                {/* ACTIVE */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon active-stat-icon">
                        <FaUserCheck />
                    </div>

                    <div>

                        <span>
                            Active Faculty
                        </span>

                        <strong>
                            {activeFaculty}
                        </strong>

                    </div>

                </div>


                {/* DISABLED */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon disabled-stat-icon">
                        <FaUserTimes />
                    </div>

                    <div>

                        <span>
                            Disabled Faculty
                        </span>

                        <strong>
                            {disabledFaculty}
                        </strong>

                    </div>

                </div>


                {/* PRESENT */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon present-stat-icon">
                        <FaClock />
                    </div>

                    <div>

                        <span>
                            Present Today
                        </span>

                        <strong>
                            {presentToday}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                TODAY'S FACULTY ATTENDANCE
            ================================================= */}

            <section className="admin-faculty-section">


                <div className="faculty-section-header">

                    <div>

                        <div className="faculty-section-title">

                            <FaUsers />

                            <h2>
                                Today's Attendance
                            </h2>

                        </div>

                        <p>
                            Faculty attendance for today,
                            ordered by clock-in time.
                        </p>

                    </div>


                    <div className="faculty-total-badge">

                        {
                            filteredFaculty.length
                        }

                        <span>
                            Faculty
                        </span>

                    </div>

                </div>


                {/* DEPARTMENT FILTER */}

                <div className="department-filter">


                    <button
                        className={
                            selectedDepartment === "ALL"
                                ? "department-button active"
                                : "department-button"
                        }
                        onClick={() =>
                            setSelectedDepartment(
                                "ALL"
                            )
                        }
                    >

                        All

                        <span>
                            {
                                facultyList.length
                            }
                        </span>

                    </button>


                    {departments.map(
                        department => (

                            <button
                                key={
                                    department.code
                                }
                                className={
                                    selectedDepartment ===
                                    department.code
                                        ? "department-button active"
                                        : "department-button"
                                }
                                onClick={() =>
                                    setSelectedDepartment(
                                        department.code
                                    )
                                }
                            >

                                {
                                    department.code
                                }

                                <span>

                                    {
                                        facultyList.filter(
                                            faculty =>
                                                faculty.departmentCode ===
                                                department.code
                                        ).length
                                    }

                                </span>

                            </button>

                        )
                    )}

                </div>


                {/* LOADING */}

                {loadingFaculty && (

                    <div className="faculty-loading">

                        <FaSpinner className="loading-spinner" />

                        Loading today's attendance...

                    </div>

                )}


                {/* ERROR */}

                {!loadingFaculty &&
                    facultyError && (

                        <div className="faculty-error">

                            {
                                facultyError
                            }

                        </div>

                    )}


                {/* TABLE */}

                {!loadingFaculty &&
                    !facultyError &&
                    filteredFaculty.length > 0 && (

                        <div className="faculty-table-wrapper">

                            <table className="faculty-table">

                                <thead>

                                    <tr>

                                        <th>#</th>

                                        <th>
                                            Faculty
                                        </th>

                                        <th>
                                            Department
                                        </th>

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
                                            Status
                                        </th>

                                        <th>
                                            View
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredFaculty.map(
                                        (
                                            faculty,
                                            index
                                        ) => {

                                            const isPresent =
                                                Boolean(
                                                    faculty.clockIn
                                                );


                                            return (

                                                <tr
                                                    key={
                                                        faculty.id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            index + 1
                                                        }
                                                    </td>


                                                    <td>

                                                        <div className="faculty-cell">

                                                            <div className="faculty-avatar">

                                                                {
                                                                    faculty.fullName
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        ?.toUpperCase()
                                                                }

                                                            </div>

                                                            <strong>
                                                                {
                                                                    faculty.fullName
                                                                }
                                                            </strong>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div className="department-cell">

                                                            <FaBuilding />

                                                            <strong>
                                                                {
                                                                    faculty.departmentCode ||
                                                                    "--"
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    faculty.departmentName ||
                                                                    ""
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>
                                                        {
                                                            formatDate(
                                                                faculty.attendanceDate
                                                            )
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            formatTime(
                                                                faculty.clockIn
                                                            )
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            formatTime(
                                                                faculty.clockOut
                                                            )
                                                        }
                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                isPresent
                                                                    ? "status-badge present"
                                                                    : "status-badge not-present"
                                                            }
                                                        >

                                                            {
                                                                isPresent
                                                                    ? "PRESENT"
                                                                    : "NOT PRESENT"
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <button
                                                            className="faculty-view-button"
                                                            onClick={() =>
                                                                handleFacultyView(
                                                                    faculty
                                                                )
                                                            }
                                                            title="View Attendance"
                                                        >

                                                            <FaChevronRight />

                                                        </button>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}


                {/* EMPTY */}

                {!loadingFaculty &&
                    !facultyError &&
                    filteredFaculty.length === 0 && (

                        <div className="faculty-empty">

                            <FaUsers />

                            <h3>
                                No Faculty Found
                            </h3>

                            <p>
                                No faculty is available
                                for this department.
                            </p>

                        </div>

                    )}

            </section>


            {/* =================================================
                LEAVE REQUEST MODAL
            ================================================= */}

            {showLeaveRequests && (

                <div
                    className="leave-overlay"
                    onClick={() =>
                        setShowLeaveRequests(
                            false
                        )
                    }
                >

                    <div
                        className="leave-panel"
                        onClick={event =>
                            event.stopPropagation()
                        }
                    >


                        {/* HEADER */}

                        <div className="leave-panel-header">

                            <div>

                                <div className="leave-title">

                                    <FaBell />

                                    <h2>
                                        Leave Requests
                                    </h2>

                                </div>

                                <p>
                                    Review pending faculty
                                    leave requests.
                                </p>

                            </div>


                            <button
                                className="close-leave-button"
                                onClick={() =>
                                    setShowLeaveRequests(
                                        false
                                    )
                                }
                            >

                                <FaTimes />

                            </button>

                        </div>


                        {/* LOADING */}

                        {loadingLeaves && (

                            <div className="leave-loading">

                                <FaSpinner className="loading-spinner" />

                                Loading leave requests...

                            </div>

                        )}


                        {/* ERROR */}

                        {!loadingLeaves &&
                            leaveError && (

                                <div className="leave-error">

                                    {
                                        leaveError
                                    }

                                </div>

                            )}


                        {/* EMPTY */}

                        {!loadingLeaves &&
                            !leaveError &&
                            leaveRequests.length === 0 && (

                                <div className="no-leave-requests">

                                    <FaCheck />

                                    <h3>
                                        No Pending Leave Requests
                                    </h3>

                                    <p>
                                        There are no leave
                                        requests waiting
                                        for approval.
                                    </p>

                                </div>

                            )}


                        {/* REQUEST LIST */}

                        {!loadingLeaves &&
                            !leaveError &&
                            leaveRequests.length > 0 && (

                                <div className="leave-request-list">

                                    {leaveRequests.map(
                                        request => {

                                            const isProcessing =
                                                processingLeaveId ===
                                                request.id;


                                            return (

                                                <div
                                                    className="leave-request-card"
                                                    key={
                                                        request.id
                                                    }
                                                >


                                                    {/* FACULTY */}

                                                    <div className="leave-request-top">

                                                        <div className="leave-user-avatar">

                                                            {
                                                                request.facultyName
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    ?.toUpperCase() ||
                                                                "F"
                                                            }

                                                        </div>


                                                        <div>

                                                            <h3>
                                                                {
                                                                    request.facultyName ||
                                                                    "Faculty"
                                                                }
                                                            </h3>

                                                            <p>
                                                                {
                                                                    request.departmentName ||
                                                                    request.departmentCode ||
                                                                    "Department not assigned"
                                                                }
                                                            </p>

                                                        </div>


                                                        <span className="pending-badge">

                                                            {
                                                                request.status ||
                                                                "PENDING"
                                                            }

                                                        </span>

                                                    </div>


                                                    {/* DETAILS */}

                                                    <div className="leave-request-details">


                                                        <div>

                                                            <FaCalendarDay />

                                                            <span>

                                                                <strong>
                                                                    From Date
                                                                </strong>

                                                                {
                                                                    formatDate(
                                                                        request.fromDate
                                                                    )
                                                                }

                                                            </span>

                                                        </div>


                                                        <div>

                                                            <FaCalendarDay />

                                                            <span>

                                                                <strong>
                                                                    To Date
                                                                </strong>

                                                                {
                                                                    formatDate(
                                                                        request.toDate
                                                                    )
                                                                }

                                                            </span>

                                                        </div>


                                                        <div>

                                                            <FaBuilding />

                                                            <span>

                                                                <strong>
                                                                    Department
                                                                </strong>

                                                                {
                                                                    request.departmentCode ||
                                                                    request.departmentName ||
                                                                    "--"
                                                                }

                                                            </span>

                                                        </div>

                                                    </div>


                                                    {/* REASON */}

                                                    <div className="leave-reason">

                                                        <strong>
                                                            Reason
                                                        </strong>

                                                        <p>
                                                            {
                                                                request.reason ||
                                                                "No reason provided."
                                                            }
                                                        </p>

                                                    </div>


                                                    {/* ACTIONS */}

                                                    <div className="leave-actions">


                                                        {/* APPROVE */}

                                                        <button
                                                            className="approve-leave-button"
                                                            disabled={
                                                                isProcessing
                                                            }
                                                            onClick={() =>
                                                                handleLeaveAction(
                                                                    request.id,
                                                                    "APPROVED"
                                                                )
                                                            }
                                                        >

                                                            {isProcessing ? (

                                                                <FaSpinner className="loading-spinner" />

                                                            ) : (

                                                                <FaCheck />

                                                            )}

                                                            Approve

                                                        </button>


                                                        {/* REJECT */}

                                                        <button
                                                            className="reject-leave-button"
                                                            disabled={
                                                                isProcessing
                                                            }
                                                            onClick={() =>
                                                                handleLeaveAction(
                                                                    request.id,
                                                                    "REJECTED"
                                                                )
                                                            }
                                                        >

                                                            {isProcessing ? (

                                                                <FaSpinner className="loading-spinner" />

                                                            ) : (

                                                                <FaTimes />

                                                            )}

                                                            Reject

                                                        </button>

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )}

                                </div>

                            )}

                    </div>

                </div>

            )}


            {/* =================================================
                FACULTY ATTENDANCE DETAILS MODAL
            ================================================= */}

            {selectedFaculty && (

                <div
                    className="faculty-overlay"
                    onClick={() => {

                        setSelectedFaculty(
                            null
                        );

                        setShowAllHistory(
                            false
                        );

                    }}
                >

                    <div
                        className="faculty-details-panel attendance-details-panel"
                        onClick={event =>
                            event.stopPropagation()
                        }
                    >


                        {/* HEADER */}

                        <div className="faculty-details-header">

                            <div>

                                <p>
                                    Faculty Attendance
                                </p>

                                <h2>
                                    {
                                        selectedFaculty.fullName
                                    }
                                </h2>

                                <span>
                                    {
                                        selectedFaculty.departmentCode ||
                                        "--"
                                    }
                                </span>

                            </div>


                            <button
                                className="close-details-button"
                                onClick={() => {

                                    setSelectedFaculty(
                                        null
                                    );

                                    setShowAllHistory(
                                        false
                                    );

                                }}
                            >

                                <FaTimes />

                            </button>

                        </div>


                        {/* BASIC INFORMATION */}

                        <div className="faculty-mini-info">

                            <div>

                                <FaEnvelope />

                                <span>
                                    {
                                        selectedFaculty.email ||
                                        "--"
                                    }
                                </span>

                            </div>


                            <div>

                                <FaPhone />

                                <span>
                                    {
                                        selectedFaculty.phone ||
                                        "--"
                                    }
                                </span>

                            </div>


                            <div>

                                <FaMapMarkerAlt />

                                <span>
                                    {
                                        selectedFaculty.accountStatus ||
                                        "--"
                                    }
                                </span>

                            </div>

                        </div>


                        {/* LOADING */}

                        {loadingAttendance && (

                            <div className="attendance-loading">

                                <FaSpinner className="loading-spinner" />

                                Loading attendance history...

                            </div>

                        )}


                        {/* ERROR */}

                        {!loadingAttendance &&
                            attendanceError && (

                                <div className="attendance-error">

                                    {
                                        attendanceError
                                    }

                                </div>

                            )}


                        {/* CURRENT MONTH */}

                        {!loadingAttendance &&
                            !attendanceError &&
                            !showAllHistory && (

                                <div className="current-month-attendance">


                                    <div className="calendar-heading">

                                        <div>

                                            <div className="calendar-title">

                                                <FaCalendarAlt />

                                                <h3>
                                                    Current Month Attendance
                                                </h3>

                                            </div>

                                            <p>
                                                {
                                                    currentMonthName
                                                }
                                            </p>

                                        </div>


                                        <div className="calendar-legend">

                                            <span>

                                                <i className="legend-dot present-dot"></i>

                                                Present

                                            </span>


                                            <span>

                                                <i className="legend-dot absent-dot"></i>

                                                Absent

                                            </span>


                                            <span>

                                                <i className="legend-dot future-dot"></i>

                                                Not Marked

                                            </span>

                                        </div>

                                    </div>


                                    {/* CALENDAR */}

                                    <div className="attendance-calendar">

                                        <div className="calendar-weekdays">

                                            <span>Sun</span>

                                            <span>Mon</span>

                                            <span>Tue</span>

                                            <span>Wed</span>

                                            <span>Thu</span>

                                            <span>Fri</span>

                                            <span>Sat</span>

                                        </div>


                                        <div className="calendar-grid">

                                            {calendarDays.map(
                                                (
                                                    calendarDay,
                                                    index
                                                ) => {

                                                    if (
                                                        !calendarDay
                                                    ) {

                                                        return (

                                                            <div
                                                                className="calendar-empty"
                                                                key={
                                                                    `empty-${index}`
                                                                }
                                                            />

                                                        );

                                                    }


                                                    const isPresent =
                                                        isAttendancePresent(
                                                            calendarDay.attendance
                                                        );


                                                    const isToday =
                                                        calendarDay.dateKey ===
                                                        todayKey;


                                                    let dayClass =
                                                        "calendar-day";


                                                    if (
                                                        calendarDay.isFuture
                                                    ) {

                                                        dayClass +=
                                                            " future";

                                                    } else if (
                                                        isPresent
                                                    ) {

                                                        dayClass +=
                                                            " present";

                                                    } else {

                                                        dayClass +=
                                                            " absent";

                                                    }


                                                    if (
                                                        isToday
                                                    ) {

                                                        dayClass +=
                                                            " today";

                                                    }


                                                    return (

                                                        <div
                                                            className={
                                                                dayClass
                                                            }
                                                            key={
                                                                calendarDay.dateKey
                                                            }
                                                        >

                                                            <span className="calendar-day-number">

                                                                {
                                                                    calendarDay.day
                                                                }

                                                            </span>


                                                            {!calendarDay.isFuture && (

                                                                <span className="calendar-day-status">

                                                                    {
                                                                        isPresent
                                                                            ? "P"
                                                                            : "A"
                                                                    }

                                                                </span>

                                                            )}


                                                            {isToday && (

                                                                <span className="today-label">
                                                                    TODAY
                                                                </span>

                                                            )}

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    </div>


                                    {/* SUMMARY */}

                                    <div className="calendar-summary">

                                        <div className="summary-box present-summary">

                                            <span>
                                                Present
                                            </span>

                                            <strong>
                                                {
                                                    currentMonthPresentCount
                                                }
                                            </strong>

                                        </div>


                                        <div className="summary-box absent-summary">

                                            <span>
                                                Absent
                                            </span>

                                            <strong>
                                                {
                                                    currentMonthAbsentCount
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    {/* VIEW HISTORY */}

                                    <button
                                        className="view-all-history-button"
                                        onClick={() =>
                                            setShowAllHistory(
                                                true
                                            )
                                        }
                                    >

                                        <FaHistory />

                                        View Attendance History

                                        <FaArrowRight />

                                    </button>

                                </div>

                            )}


                        {/* ATTENDANCE HISTORY */}

                        {!loadingAttendance &&
                            !attendanceError &&
                            showAllHistory && (

                                <div className="all-history-section">


                                    <div className="history-heading">

                                        <div>

                                            <div className="calendar-title">

                                                <FaHistory />

                                                <h3>
                                                    Attendance History
                                                </h3>

                                            </div>

                                            <p>
                                                Attendance records loaded for the selected period
                                            </p>

                                        </div>


                                        <button
                                            className="back-calendar-button"
                                            onClick={() =>
                                                setShowAllHistory(
                                                    false
                                                )
                                            }
                                        >

                                            <FaArrowLeft />

                                            Current Month

                                        </button>

                                    </div>


                                    {sortedMonthlyHistory.length === 0 && (

                                        <div className="no-history">

                                            <FaCalendarAlt />

                                            <h3>
                                                No Attendance History
                                            </h3>

                                            <p>
                                                No attendance records are
                                                available for this faculty.
                                            </p>

                                        </div>

                                    )}


                                    {sortedMonthlyHistory.length > 0 && (

                                        <div className="monthly-history-list">

                                            {sortedMonthlyHistory.map(
                                                history => {

                                                    const presentCount =
                                                        getPresentCount(
                                                            history.records
                                                        );


                                                    const absentCount =
                                                        history.records.filter(
                                                            record =>
                                                                !isAttendancePresent(
                                                                    record
                                                                )
                                                        ).length;


                                                    const sortedRecords =
                                                        [
                                                            ...history.records
                                                        ].sort(
                                                            (
                                                                a,
                                                                b
                                                            ) =>
                                                                String(
                                                                    getAttendanceDate(
                                                                        a
                                                                    ) ||
                                                                    ""
                                                                ).localeCompare(
                                                                    String(
                                                                        getAttendanceDate(
                                                                            b
                                                                        ) ||
                                                                        ""
                                                                    )
                                                                )
                                                        );


                                                    return (

                                                        <div
                                                            className="monthly-history-card"
                                                            key={
                                                                `${history.year}-${history.month}`
                                                            }
                                                        >


                                                            {/* MONTH HEADER */}

                                                            <div className="monthly-history-header">

                                                                <div className="month-icon">

                                                                    <FaCalendarAlt />

                                                                </div>


                                                                <div>

                                                                    <h4>
                                                                        {
                                                                            getMonthName(
                                                                                history.year,
                                                                                history.month
                                                                            )
                                                                        }
                                                                    </h4>

                                                                    <span>

                                                                        {
                                                                            history.records.length
                                                                        }

                                                                        {" "}

                                                                        attendance record

                                                                        {
                                                                            history.records.length !==
                                                                            1
                                                                                ? "s"
                                                                                : ""
                                                                        }

                                                                    </span>

                                                                </div>

                                                            </div>


                                                            {/* STATS */}

                                                            <div className="monthly-history-stats">


                                                                <div className="history-stat present-history">

                                                                    <span>
                                                                        Present
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            presentCount
                                                                        }
                                                                    </strong>

                                                                </div>


                                                                <div className="history-stat absent-history">

                                                                    <span>
                                                                        Absent
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            absentCount
                                                                        }
                                                                    </strong>

                                                                </div>

                                                            </div>


                                                            {/* RECORDS */}

                                                            <div className="monthly-records">

                                                                {sortedRecords.map(
                                                                    (
                                                                        record,
                                                                        recordIndex
                                                                    ) => {

                                                                        const recordDate =
                                                                            getDateKey(
                                                                                getAttendanceDate(
                                                                                    record
                                                                                )
                                                                            );


                                                                        const present =
                                                                            isAttendancePresent(
                                                                                record
                                                                            );


                                                                        return (

                                                                            <div
                                                                                className={
                                                                                    present
                                                                                        ? "history-record present-record"
                                                                                        : "history-record absent-record"
                                                                                }
                                                                                key={
                                                                                    record.attendanceId ||
                                                                                    record.id ||
                                                                                    `${history.year}-${history.month}-${recordIndex}`
                                                                                }
                                                                            >

                                                                                <span className="history-date">

                                                                                    {
                                                                                        recordDate ||
                                                                                        "--"
                                                                                    }

                                                                                </span>


                                                                                <span className="history-status">

                                                                                    {
                                                                                        present
                                                                                            ? "PRESENT"
                                                                                            : "ABSENT"
                                                                                    }

                                                                                </span>


                                                                                <span className="history-clock">

                                                                                    {
                                                                                        present
                                                                                            ? formatTime(
                                                                                                record.clockIn ||
                                                                                                record.clock_in
                                                                                            )
                                                                                            : "--"
                                                                                    }

                                                                                </span>

                                                                            </div>

                                                                        );

                                                                    }
                                                                )}

                                                            </div>

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    )}

                                </div>

                            )}

                    </div>

                </div>

            )}

        </main>

    );

}


export default AdminDashboard;