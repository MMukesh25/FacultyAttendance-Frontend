import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    FaArrowLeft,
    FaCalendarAlt,
    FaFileAlt,
    FaPaperPlane,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaClipboardList
} from "react-icons/fa";

import "./ApplyLeave.css";


function ApplyLeave() {

    const navigate = useNavigate();

    // =========================================================
    // USER
    // =========================================================

    const [user, setUser] = useState(null);

    // =========================================================
    // FORM
    // =========================================================

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reason, setReason] = useState("");

    // =========================================================
    // REQUEST STATE
    // =========================================================

    const [submitting, setSubmitting] = useState(false);
    const [loadingRequests, setLoadingRequests] = useState(true);

    const [requests, setRequests] = useState([]);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // =========================================================
    // LOAD USER
    // =========================================================

    useEffect(() => {

        const storedUser = localStorage.getItem("user");

        if (!storedUser) {

            navigate("/", {
                replace: true
            });

            return;
        }

        try {

            const parsedUser = JSON.parse(storedUser);

            if (!parsedUser || !parsedUser.email) {

                localStorage.removeItem("user");

                navigate("/", {
                    replace: true
                });

                return;
            }

            console.log("Logged-in faculty:", parsedUser);

            setUser(parsedUser);

            loadMyLeaveRequests(parsedUser.email);

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
    // LOAD FACULTY LEAVE REQUESTS
    // =========================================================

    const loadMyLeaveRequests = async (email) => {

        try {

            setLoadingRequests(true);
            setError("");

            console.log(
                "Loading leave requests for:",
                email
            );

            const response = await axios.get(
                "http://localhost:8080/api/leaves/my",
                {
                    params: {
                        email: email
                    }
                }
            );

            console.log(
                "Leave history response:",
                response.data
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setRequests(data);

        } catch (err) {

            console.error(
                "Leave history loading error:",
                err
            );

            if (err.response?.status === 403) {

                setError(
                    "You are not authorized to view leave requests."
                );

            } else if (err.response?.status === 404) {

                setError(
                    "Faculty account not found."
                );

            } else {

                setError(
                    err.response?.data?.message ||
                    "Unable to load your leave requests."
                );
            }

        } finally {

            setLoadingRequests(false);
        }
    };


    // =========================================================
    // SUBMIT LEAVE REQUEST
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        // -----------------------------------------------------
        // Validate user
        // -----------------------------------------------------

        if (!user?.email) {

            setError(
                "User information is unavailable. Please login again."
            );

            return;
        }


        // -----------------------------------------------------
        // Validate from date
        // -----------------------------------------------------

        if (!fromDate) {

            setError(
                "Please select the from date."
            );

            return;
        }


        // -----------------------------------------------------
        // Validate to date
        // -----------------------------------------------------

        if (!toDate) {

            setError(
                "Please select the to date."
            );

            return;
        }


        // -----------------------------------------------------
        // Validate date range
        // -----------------------------------------------------

        if (toDate < fromDate) {

            setError(
                "To date cannot be before from date."
            );

            return;
        }


        // -----------------------------------------------------
        // Validate reason
        // -----------------------------------------------------

        if (!reason.trim()) {

            setError(
                "Please enter the reason for leave."
            );

            return;
        }


        try {

            setSubmitting(true);

            console.log(
                "Submitting leave request..."
            );


            const response = await axios.post(
                "http://localhost:8080/api/leaves/apply",
                {
                    email: user.email,
                    fromDate: fromDate,
                    toDate: toDate,
                    reason: reason.trim()
                }
            );


            console.log(
                "Leave request submitted:",
                response.data
            );


            setSuccess(
                "Leave request submitted successfully."
            );


            // Clear form

            setFromDate("");
            setToDate("");
            setReason("");


            // Reload leave requests

            await loadMyLeaveRequests(
                user.email
            );

        } catch (err) {

            console.error(
                "Leave submission error:",
                err
            );


            if (err.response?.status === 400) {

                setError(
                    err.response?.data?.message ||
                    "Invalid leave request."
                );

            } else if (err.response?.status === 403) {

                setError(
                    "You are not authorized to submit a leave request."
                );

            } else if (err.response?.status === 404) {

                setError(
                    "Faculty account not found."
                );

            } else {

                setError(
                    err.response?.data?.message ||
                    "Unable to submit leave request."
                );
            }

        } finally {

            setSubmitting(false);
        }
    };


    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = (status) => {

        const normalizedStatus =
            String(status || "").toUpperCase();

        switch (normalizedStatus) {

            case "APPROVED":
                return "leave-status-approved";

            case "REJECTED":
                return "leave-status-rejected";

            case "PENDING":
                return "leave-status-pending";

            default:
                return "";
        }
    };


    // =========================================================
    // STATUS ICON
    // =========================================================

    const getStatusIcon = (status) => {

        const normalizedStatus =
            String(status || "").toUpperCase();

        switch (normalizedStatus) {

            case "APPROVED":
                return <FaCheckCircle />;

            case "REJECTED":
                return <FaTimesCircle />;

            case "PENDING":
                return <FaClock />;

            default:
                return <FaClock />;
        }
    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "--";
        }

        const date = new Date(
            `${dateValue}T00:00:00`
        );

        if (Number.isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
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

        <main className="apply-leave-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="apply-leave-header">

                <button
                    type="button"
                    className="leave-back-button"
                    onClick={handleBack}
                >

                    <FaArrowLeft />

                    <span>
                        Back to Dashboard
                    </span>

                </button>


                <div className="leave-title">

                    <FaFileAlt />

                    <div>

                        <h1>
                            Leave Request
                        </h1>

                        <p>
                            Apply for leave and track your request
                        </p>

                    </div>

                </div>

            </header>


            <div className="apply-leave-content">

                {/* =================================================
                    FACULTY INFORMATION
                ================================================= */}

                <section className="leave-profile-card">

                    <div>

                        <span>
                            Faculty
                        </span>

                        <strong>
                            {user?.fullName || "--"}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Department
                        </span>

                        <strong>
                            {user?.department || "--"}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Role
                        </span>

                        <strong>
                            {user?.role || "--"}
                        </strong>

                    </div>

                </section>


                {/* =================================================
                    SUCCESS MESSAGE
                ================================================= */}

                {success && (

                    <div className="leave-success">

                        <FaCheckCircle />

                        <span>
                            {success}
                        </span>

                    </div>

                )}


                {/* =================================================
                    ERROR MESSAGE
                ================================================= */}

                {error && (

                    <div className="leave-error">

                        <FaTimesCircle />

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                {/* =================================================
                    APPLY LEAVE FORM
                ================================================= */}

                <section className="leave-form-card">

                    <div className="leave-section-heading">

                        <div className="leave-heading-icon">

                            <FaPaperPlane />

                        </div>

                        <div>

                            <h2>
                                Apply for Leave
                            </h2>

                            <p>
                                Enter the details of your leave request.
                            </p>

                        </div>

                    </div>


                    <form
                        className="leave-form"
                        onSubmit={handleSubmit}
                    >

                        {/* =================================================
                            DATE ROW
                        ================================================= */}

                        <div className="leave-date-row">

                            {/* FROM DATE */}

                            <div className="leave-field">

                                <label htmlFor="fromDate">

                                    <FaCalendarAlt />

                                    <span>
                                        From Date
                                    </span>

                                </label>

                                <input
                                    id="fromDate"
                                    type="date"
                                    value={fromDate}
                                    min={
                                        new Date()
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    onChange={(event) =>
                                        setFromDate(
                                            event.target.value
                                        )
                                    }
                                    disabled={submitting}
                                />

                            </div>


                            {/* TO DATE */}

                            <div className="leave-field">

                                <label htmlFor="toDate">

                                    <FaCalendarAlt />

                                    <span>
                                        To Date
                                    </span>

                                </label>

                                <input
                                    id="toDate"
                                    type="date"
                                    value={toDate}
                                    min={
                                        fromDate ||
                                        new Date()
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    onChange={(event) =>
                                        setToDate(
                                            event.target.value
                                        )
                                    }
                                    disabled={submitting}
                                />

                            </div>

                        </div>


                        {/* =================================================
                            REASON
                        ================================================= */}

                        <div className="leave-field">

                            <label htmlFor="reason">

                                <FaFileAlt />

                                <span>
                                    Reason for Leave
                                </span>

                            </label>

                            <textarea
                                id="reason"
                                rows="6"
                                maxLength={1000}
                                placeholder="Enter the reason for your leave..."
                                value={reason}
                                onChange={(event) =>
                                    setReason(
                                        event.target.value
                                    )
                                }
                                disabled={submitting}
                            />

                            <small>
                                {reason.length}/1000 characters
                            </small>

                        </div>


                        {/* =================================================
                            SUBMIT BUTTON
                        ================================================= */}

                        <button
                            type="submit"
                            className="submit-leave-button"
                            disabled={submitting}
                        >

                            <FaPaperPlane />

                            <span>

                                {submitting
                                    ? "Submitting..."
                                    : "Submit Leave Request"
                                }

                            </span>

                        </button>

                    </form>

                </section>


                {/* =================================================
                    MY LEAVE REQUESTS
                ================================================= */}

                <section className="my-leaves-card">

                    <div className="leave-section-heading">

                        <div className="leave-heading-icon">

                            <FaClipboardList />

                        </div>

                        <div>

                            <h2>
                                My Leave Requests
                            </h2>

                            <p>
                                Track the status of your submitted requests.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loadingRequests && (

                        <div className="leave-loading">

                            Loading leave requests...

                        </div>

                    )}


                    {/* =================================================
                        NO REQUESTS
                    ================================================= */}

                    {!loadingRequests &&
                        requests.length === 0 && (

                            <div className="no-leaves">

                                <FaFileAlt />

                                <h3>
                                    No Leave Requests
                                </h3>

                                <p>
                                    You have not submitted any leave requests yet.
                                </p>

                            </div>

                        )}


                    {/* =================================================
                        REQUEST LIST
                    ================================================= */}

                    {!loadingRequests &&
                        requests.length > 0 && (

                            <div className="leave-request-list">

                                {requests.map((request) => {

                                    const status =
                                        String(
                                            request.status || "PENDING"
                                        ).toUpperCase();

                                    return (

                                        <article
                                            className="leave-request-item"
                                            key={request.id}
                                        >

                                            <div className="leave-request-main">

                                                {/* DATE */}

                                                <div className="leave-request-dates">

                                                    <FaCalendarAlt />

                                                    <strong>

                                                        {formatDate(
                                                            request.fromDate
                                                        )}

                                                        {" - "}

                                                        {formatDate(
                                                            request.toDate
                                                        )}

                                                    </strong>

                                                </div>


                                                {/* REASON */}

                                                <p className="leave-request-reason">

                                                    {request.reason || "--"}

                                                </p>


                                                {/* ADMIN MESSAGE */}

                                                {request.adminMessage && (

                                                    <p className="admin-message">

                                                        <strong>
                                                            Admin:
                                                        </strong>{" "}

                                                        {request.adminMessage}

                                                    </p>

                                                )}

                                            </div>


                                            {/* STATUS */}

                                            <div
                                                className={
                                                    `leave-status ${getStatusClass(
                                                        status
                                                    )}`
                                                }
                                            >

                                                {getStatusIcon(
                                                    status
                                                )}

                                                <span>
                                                    {status}
                                                </span>

                                            </div>

                                        </article>

                                    );

                                })}

                            </div>

                        )}

                </section>

            </div>

        </main>
    );
}


export default ApplyLeave;