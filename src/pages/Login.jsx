import { useState } from "react";

import {
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaSignInAlt
} from "react-icons/fa";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

import "./Login.css";


function Login() {

    const navigate = useNavigate();


    // =========================================================
    // STATE
    // =========================================================

    const [showPassword, setShowPassword] =
        useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");

    const [loading, setLoading] =
        useState(false);


    // =========================================================
    // INPUT CHANGE
    // =========================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setFormData({
            ...formData,
            [name]: value
        });


        setError("");
    };


    // =========================================================
    // LOGIN
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);


        try {

            const response =
                await axios.post(
                    "http://localhost:8080/api/auth/login",
                    {
                        email:
                            formData.email.trim(),

                        password:
                            formData.password
                    }
                );


            console.log(
                "Login Response:",
                response.data
            );


            const backendUser =
                response.data;


            // =================================================
            // CHECK RESPONSE
            // =================================================

            if (!backendUser) {

                setError(
                    "Invalid response from server."
                );

                return;
            }


            // =================================================
            // ROLE
            // =================================================

            const role =
                String(
                    backendUser.role || ""
                ).toUpperCase();


            if (
                role !== "FACULTY" &&
                role !== "ADMIN"
            ) {

                setError(
                    "Invalid user role."
                );

                return;
            }


            // =================================================
            // CREATE FRONTEND USER OBJECT
            // =================================================

            const user = {

                id:
                    backendUser.id,

                fullName:
                    backendUser.fullName,

                email:
                    backendUser.email,

                phone:
                    backendUser.phone,

                department:
                    backendUser.department,

                role:
                    role,

                status:
                    backendUser.status
            };


            // =================================================
            // STORE USER
            // =================================================

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            console.log(
                "Stored User:",
                user
            );


            // =================================================
            // ROLE BASED NAVIGATION
            // =================================================

            if (role === "FACULTY") {

                navigate(
                    "/faculty-dashboard",
                    {
                        replace: true
                    }
                );

                return;
            }


            if (role === "ADMIN") {

                navigate(
                    "/admin-dashboard",
                    {
                        replace: true
                    }
                );

                return;
            }


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            // =================================================
            // SERVER ERROR
            // =================================================

            if (error.response) {

                const data =
                    error.response.data;


                if (
                    typeof data === "string"
                ) {

                    setError(data);

                } else if (
                    data?.message
                ) {

                    setError(
                        data.message
                    );

                } else {

                    setError(
                        "Invalid email or password."
                    );
                }

            } else if (
                error.request
            ) {

                setError(
                    "Unable to connect to the server. Make sure Spring Boot is running."
                );

            } else {

                setError(
                    "Something went wrong. Please try again."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    const handleForgotPassword = () => {

        navigate(
            "/forgot-password"
        );
    };


    // =========================================================
    // SIGN UP
    // =========================================================

    const handleSignup = () => {

        navigate(
            "/signup"
        );
    };


    // =========================================================
    // UI
    // =========================================================

    return (

        <>
            {/* =================================================
                NAVBAR
            ================================================= */}

            <Navbar />


            {/* =================================================
                LOGIN PAGE
            ================================================= */}

            <main className="login-page">

                <div className="login-container">


                    {/* =================================================
                        LEFT SIDE
                    ================================================= */}

                    <div className="login-introduction">

                        <div className="intro-icon">

                            <FaSignInAlt />

                        </div>


                        <h1>
                            Welcome Back
                        </h1>


                        <p>
                            Sign in to access your faculty
                            attendance dashboard.
                        </p>


                        <div className="intro-line"></div>


                        <span>
                            Secure Faculty Attendance Management
                        </span>

                    </div>


                    {/* =================================================
                        RIGHT SIDE
                    ================================================= */}

                    <div className="login-card">


                        <div className="login-heading">

                            <h2>
                                Login
                            </h2>

                            <p>
                                Enter your account details
                                to continue
                            </p>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                        >


                            {/* =================================================
                                ERROR
                            ================================================= */}

                            {error && (

                                <div className="login-error">

                                    {error}

                                </div>

                            )}


                            {/* =================================================
                                EMAIL
                            ================================================= */}

                            <div className="input-group">

                                <label htmlFor="email">
                                    Email Address
                                </label>


                                <div className="input-wrapper">

                                    <FaEnvelope
                                        className="input-icon"
                                    />


                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        autoComplete="email"
                                        required
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                PASSWORD
                            ================================================= */}

                            <div className="input-group">

                                <label htmlFor="password">
                                    Password
                                </label>


                                <div className="input-wrapper">

                                    <FaLock
                                        className="input-icon"
                                    />


                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        value={
                                            formData.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        autoComplete="current-password"
                                        required
                                    />


                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        title={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >

                                        {
                                            showPassword
                                                ? <FaEyeSlash />
                                                : <FaEye />
                                        }

                                    </button>

                                </div>

                            </div>


                            {/* =================================================
                                FORGOT PASSWORD
                            ================================================= */}

                            <div className="forgot-password">

                                <button
                                    type="button"
                                    onClick={
                                        handleForgotPassword
                                    }
                                    className="forgot-password-button"
                                >
                                    Forgot Password?
                                </button>

                            </div>


                            {/* =================================================
                                LOGIN BUTTON
                            ================================================= */}

                            <button
                                type="submit"
                                className="login-button"
                                disabled={loading}
                            >

                                <FaSignInAlt />


                                <span>

                                    {
                                        loading
                                            ? "LOGGING IN..."
                                            : "LOGIN"
                                    }

                                </span>

                            </button>


                            {/* =================================================
                                SIGN UP
                            ================================================= */}

                            <div className="signup-section">

                                <span>
                                    Don't have an account?
                                </span>


                                <button
                                    type="button"
                                    onClick={
                                        handleSignup
                                    }
                                    className="signup-link"
                                >
                                    Sign Up
                                </button>

                            </div>


                        </form>


                    </div>


                </div>


            </main>

        </>

    );
}


export default Login;

