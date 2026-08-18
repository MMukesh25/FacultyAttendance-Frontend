import { useState } from "react";

import {
    FaEnvelope,
    FaArrowLeft,
    FaKey
} from "react-icons/fa";

import "./ForgotPassword.css";


function ForgotPassword() {

    const [email, setEmail] = useState("");

    const handleSubmit = (event) => {

        event.preventDefault();

        console.log("Forgot password email:", email);

        // Backend password reset API will be connected later.
    };


    return (

        <main className="forgot-page">

            <div className="forgot-card">

                {/* ICON */}

                <div className="forgot-icon">
                    <FaKey />
                </div>


                {/* HEADING */}

                <div className="forgot-heading">

                    <h1>
                        Forgot Password?
                    </h1>

                    <p>
                        Enter your registered email address
                        and we'll help you reset your password.
                    </p>

                </div>


                {/* FORM */}

                <form onSubmit={handleSubmit}>

                    <div className="forgot-input-group">

                        <label htmlFor="forgot-email">
                            Email Address
                        </label>

                        <div className="forgot-input-wrapper">

                            <FaEnvelope className="forgot-input-icon" />

                            <input
                                type="email"
                                id="forgot-email"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                            />

                        </div>

                    </div>


                    <button
                        type="submit"
                        className="reset-button"
                    >
                        Send Reset Link
                    </button>

                </form>


                {/* BACK TO LOGIN */}

                <a
                    href="/login"
                    className="back-login"
                >

                    <FaArrowLeft />

                    <span>
                        Back to Login
                    </span>

                </a>

            </div>

        </main>

    );
}

export default ForgotPassword;