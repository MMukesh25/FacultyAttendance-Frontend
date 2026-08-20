import { useState } from "react";

import {
    FaEnvelope,
    FaArrowLeft,
    FaKey,
    FaCheckCircle,
    FaLock
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import "./ForgotPassword.css";


function ForgotPassword() {

    const navigate = useNavigate();


    // =========================================================
    // STATE
    // =========================================================

    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");

    const [otp, setOtp] = useState("");

    const [newPassword, setNewPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);


    // =========================================================
    // SEND OTP
    // =========================================================

    const handleSendOtp = async (event) => {

        event.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:8080/api/password/send-otp",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email.trim()
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message || "Failed to send OTP."
                );
            }


            setMessage(
                data.message ||
                "OTP sent successfully to your email."
            );

            setStep(2);

        } catch (error) {

            setError(
                error.message ||
                "Unable to send OTP."
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // VERIFY OTP
    // =========================================================

    const handleVerifyOtp = async (event) => {

        event.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:8080/api/password/verify-otp",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        otp: otp.trim()
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message || "Invalid OTP."
                );
            }


            setMessage(
                data.message ||
                "OTP verified successfully."
            );

            setStep(3);

        } catch (error) {

            setError(
                error.message ||
                "OTP verification failed."
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // RESET PASSWORD
    // =========================================================

    const handleResetPassword = async (event) => {

        event.preventDefault();

        setMessage("");
        setError("");


        if (newPassword !== confirmPassword) {

            setError(
                "New password and confirm password do not match."
            );

            return;
        }


        setLoading(true);


        try {

            const response = await fetch(
                "http://localhost:8080/api/password/reset",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        newPassword: newPassword
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Password reset failed."
                );
            }


            setMessage(
                data.message ||
                "Password reset successfully."
            );

            setStep(4);

        } catch (error) {

            setError(
                error.message ||
                "Unable to reset password."
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // BACK TO LOGIN
    // =========================================================

    const handleBackToLogin = () => {

        navigate("/login");
    };


    // =========================================================
    // CHANGE EMAIL
    // =========================================================

    const handleChangeEmail = () => {

        setStep(1);

        setOtp("");

        setMessage("");

        setError("");
    };


    // =========================================================
    // STEP 1 - EMAIL
    // =========================================================

    if (step === 1) {

        return (

            <main className="forgot-page">

                <div className="forgot-card">

                    <div className="forgot-icon">
                        <FaKey />
                    </div>


                    <div className="forgot-heading">

                        <h1>
                            Forgot Password?
                        </h1>

                        <p>
                            Enter your registered email address
                            and we'll help you reset your password.
                        </p>

                    </div>


                    {error && (
                        <div className="forgot-error">
                            {error}
                        </div>
                    )}


                    <form onSubmit={handleSendOtp}>

                        <div className="forgot-input-group">

                            <label htmlFor="forgot-email">
                                Email Address
                            </label>

                            <div className="forgot-input-wrapper">

                                <FaEnvelope
                                    className="forgot-input-icon"
                                />

                                <input
                                    type="email"
                                    id="forgot-email"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="reset-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Sending OTP..."
                                : "Send OTP"
                            }
                        </button>

                    </form>


                    <button
                        type="button"
                        className="back-login"
                        onClick={handleBackToLogin}
                    >

                        <FaArrowLeft />

                        <span>
                            Back to Login
                        </span>

                    </button>

                </div>

            </main>
        );
    }


    // =========================================================
    // STEP 2 - VERIFY OTP
    // =========================================================

    if (step === 2) {

        return (

            <main className="forgot-page">

                <div className="forgot-card">

                    <div className="forgot-icon">
                        <FaKey />
                    </div>


                    <div className="forgot-heading">

                        <h1>
                            Verify OTP
                        </h1>

                        <p>
                            Enter the 6-digit OTP sent to
                            <br />
                            <strong>{email}</strong>
                        </p>

                    </div>


                    {message && (
                        <div className="forgot-success">
                            {message}
                        </div>
                    )}


                    {error && (
                        <div className="forgot-error">
                            {error}
                        </div>
                    )}


                    <form onSubmit={handleVerifyOtp}>

                        <div className="forgot-input-group">

                            <label htmlFor="forgot-otp">
                                OTP
                            </label>

                            <div className="forgot-input-wrapper">

                                <FaKey
                                    className="forgot-input-icon"
                                />

                                <input
                                    type="text"
                                    id="forgot-otp"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    maxLength={6}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    onChange={(event) =>
                                        setOtp(
                                            event.target.value.replace(
                                                /\D/g,
                                                ""
                                            )
                                        )
                                    }
                                    required
                                />

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="reset-button"
                            disabled={
                                loading ||
                                otp.length !== 6
                            }
                        >
                            {loading
                                ? "Verifying..."
                                : "Verify OTP"
                            }
                        </button>

                    </form>


                    <button
                        type="button"
                        className="back-login"
                        onClick={handleChangeEmail}
                    >

                        <FaArrowLeft />

                        <span>
                            Change Email
                        </span>

                    </button>

                </div>

            </main>
        );
    }


    // =========================================================
    // STEP 3 - NEW PASSWORD
    // =========================================================

    if (step === 3) {

        return (

            <main className="forgot-page">

                <div className="forgot-card">

                    <div className="forgot-icon">
                        <FaLock />
                    </div>


                    <div className="forgot-heading">

                        <h1>
                            Reset Password
                        </h1>

                        <p>
                            Create a new password for your account.
                        </p>

                    </div>


                    {message && (
                        <div className="forgot-success">
                            {message}
                        </div>
                    )}


                    {error && (
                        <div className="forgot-error">
                            {error}
                        </div>
                    )}


                    <form onSubmit={handleResetPassword}>

                        <div className="forgot-input-group">

                            <label htmlFor="new-password">
                                New Password
                            </label>

                            <div className="forgot-input-wrapper">

                                <FaLock
                                    className="forgot-input-icon"
                                />

                                <input
                                    type="password"
                                    id="new-password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="new-password"
                                    required
                                />

                            </div>

                        </div>


                        <div className="forgot-input-group">

                            <label htmlFor="confirm-password">
                                Confirm Password
                            </label>

                            <div className="forgot-input-wrapper">

                                <FaLock
                                    className="forgot-input-icon"
                                />

                                <input
                                    type="password"
                                    id="confirm-password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="new-password"
                                    required
                                />

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="reset-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Resetting Password..."
                                : "Reset Password"
                            }
                        </button>

                    </form>

                </div>

            </main>
        );
    }


    // =========================================================
    // STEP 4 - SUCCESS
    // =========================================================

    return (

        <main className="forgot-page">

            <div className="forgot-card">

                <div className="forgot-icon">
                    <FaCheckCircle />
                </div>


                <div className="forgot-heading">

                    <h1>
                        Password Reset Successful
                    </h1>

                    <p>
                        Your password has been changed successfully.
                        You can now login using your new password.
                    </p>

                </div>


                <div className="forgot-success">

                    {message ||
                        "Password reset successfully."
                    }

                </div>


                <button
                    type="button"
                    className="reset-button"
                    onClick={handleBackToLogin}
                >
                    Go to Login
                </button>

            </div>

        </main>
    );
}


export default ForgotPassword;

