import { useState } from "react";

import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaBuilding,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaUserPlus
} from "react-icons/fa";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./Signup.css";


function Signup() {

    const navigate = useNavigate();


    // =========================================================
    // PASSWORD VISIBILITY
    // =========================================================

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    // =========================================================
    // FORM DATA
    // =========================================================

    const [formData, setFormData] = useState({

        fullName: "",
        email: "",
        phone: "",
        departmentCode: "",
        password: "",
        confirmPassword: ""

    });


    // =========================================================
    // STATUS
    // =========================================================

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

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
        setSuccess("");
    };


    // =========================================================
    // SIGNUP
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        // =====================================================
        // FULL NAME VALIDATION
        // =====================================================

        if (!formData.fullName.trim()) {

            setError(
                "Full name is required."
            );

            return;
        }


        // =====================================================
        // EMAIL VALIDATION
        // =====================================================

        if (!formData.email.trim()) {

            setError(
                "Email is required."
            );

            return;
        }


        // =====================================================
        // PHONE VALIDATION
        // =====================================================

        if (
            !/^[0-9]{10}$/.test(
                formData.phone
            )
        ) {

            setError(
                "Please enter a valid 10-digit phone number."
            );

            return;
        }


        // =====================================================
        // DEPARTMENT VALIDATION
        // =====================================================

        if (!formData.departmentCode) {

            setError(
                "Please select your department."
            );

            return;
        }


        // =====================================================
        // PASSWORD VALIDATION
        // =====================================================

        if (formData.password.length < 8) {

            setError(
                "Password must contain at least 8 characters."
            );

            return;
        }


        // =====================================================
        // CONFIRM PASSWORD
        // =====================================================

        if (
            formData.password !==
            formData.confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        setLoading(true);


        try {

            // =================================================
            // REQUEST SENT TO SPRING BOOT
            // =================================================

            const requestData = {

                fullName:
                    formData.fullName.trim(),

                email:
                    formData.email.trim().toLowerCase(),

                phone:
                    formData.phone.trim(),

                departmentCode:
                    formData.departmentCode,

                password:
                    formData.password,

                confirmPassword:
                    formData.confirmPassword
            };

            console.log(
                "Signup Request:",
                requestData
            );


            const response =
                await axios.post(
                    "http://localhost:8080/api/auth/signup",
                    requestData
                );


            console.log(
                "Signup Response:",
                response.data
            );


            // =================================================
            // SUCCESS
            // =================================================

            setSuccess(
                "Account created successfully. Redirecting to login..."
            );


            // =================================================
            // CLEAR FORM
            // =================================================

            setFormData({

                fullName: "",
                email: "",
                phone: "",
                departmentCode: "",
                password: "",
                confirmPassword: ""

            });


            // =================================================
            // REDIRECT TO LOGIN
            // =================================================

            setTimeout(() => {

                navigate(
                    "/login",
                    {
                        replace: true
                    }
                );

            }, 1200);


        } catch (error) {

            console.error(
                "Signup error:",
                error
            );


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
                        "Unable to create account."
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
    // GO TO LOGIN
    // =========================================================

    const handleLogin = () => {

        navigate("/login");

    };


    // =========================================================
    // UI
    // =========================================================

    return (

        <main className="signup-page">

            <div className="signup-container">


                {/* =================================================
                    LEFT SECTION
                ================================================= */}

                <div className="signup-introduction">

                    <div className="signup-icon">

                        <FaUserPlus />

                    </div>


                    <h1>
                        Create Account
                    </h1>


                    <p>
                        Register your faculty account
                        to access the attendance management
                        system.
                    </p>


                    <div className="signup-line"></div>


                    <span>
                        Faculty Registration
                    </span>

                </div>


                {/* =================================================
                    RIGHT SECTION
                ================================================= */}

                <div className="signup-card">

                    <div className="signup-heading">

                        <h2>
                            Faculty Sign Up
                        </h2>

                        <p>
                            Enter your details to create
                            your account
                        </p>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                    >


                        {/* =================================================
                            ERROR
                        ================================================= */}

                        {error && (

                            <div className="signup-error">

                                {error}

                            </div>

                        )}


                        {/* =================================================
                            SUCCESS
                        ================================================= */}

                        {success && (

                            <div className="signup-success">

                                {success}

                            </div>

                        )}


                        {/* =================================================
                            FULL NAME
                        ================================================= */}

                        <div className="input-group">

                            <label htmlFor="fullName">
                                Full Name
                            </label>


                            <div className="input-wrapper">

                                <FaUser
                                    className="input-icon"
                                />


                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Enter your full name"
                                    value={
                                        formData.fullName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                        </div>


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
                                    required
                                />

                            </div>

                        </div>


                        {/* =================================================
                            PHONE
                        ================================================= */}

                        <div className="input-group">

                            <label htmlFor="phone">
                                Phone Number
                            </label>


                            <div className="input-wrapper">

                                <FaPhone
                                    className="input-icon"
                                />


                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="Enter your phone number"
                                    value={
                                        formData.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    maxLength="10"
                                />

                            </div>

                        </div>


                        {/* =================================================
                            DEPARTMENT
                        ================================================= */}

                        <div className="input-group">

                            <label htmlFor="departmentCode">
                                Department
                            </label>


                            <div className="input-wrapper">

                                <FaBuilding
                                    className="input-icon"
                                />


                                <select
                                    id="departmentCode"
                                    name="departmentCode"
                                    value={
                                        formData.departmentCode
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select your department
                                    </option>


                                    <option value="CSE">
                                        Computer Science & Engineering
                                    </option>


                                    <option value="ECE">
                                        Electronics & Communication Engineering
                                    </option>


                                    <option value="EEE">
                                        Electrical & Electronics Engineering
                                    </option>


                                    <option value="MECH">
                                        Mechanical Engineering
                                    </option>


                                    <option value="CIVIL">
                                        Civil Engineering
                                    </option>

                                </select>

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
                                    placeholder="Create a password"
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    minLength="8"
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
                            CONFIRM PASSWORD
                        ================================================= */}

                        <div className="input-group">

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>


                            <div className="input-wrapper">

                                <FaLock
                                    className="input-icon"
                                />


                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    minLength="8"
                                />


                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    title={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >

                                    {
                                        showConfirmPassword
                                            ? <FaEyeSlash />
                                            : <FaEye />
                                    }

                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            CREATE ACCOUNT
                        ================================================= */}

                        <button
                            type="submit"
                            className="signup-button"
                            disabled={loading}
                        >

                            <FaUserPlus />


                            <span>

                                {
                                    loading
                                        ? "CREATING ACCOUNT..."
                                        : "CREATE ACCOUNT"
                                }

                            </span>

                        </button>


                        {/* =================================================
                            LOGIN
                        ================================================= */}

                        <div className="login-section">

                            <span>
                                Already have an account?
                            </span>


                            <button
                                type="button"
                                className="login-link"
                                onClick={
                                    handleLogin
                                }
                            >

                                Login

                            </button>

                        </div>


                    </form>

                </div>

            </div>

        </main>

    );

}


export default Signup;

