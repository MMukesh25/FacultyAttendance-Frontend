import "./Navbar.css";

import {
    FaUserCheck
} from "react-icons/fa";

import collegeLogo from "../assets/collegelogo.jpeg";


function Navbar() {

    return (

        <header className="navbar">

            {/* =================================================
                COLLEGE BRANDING
            ================================================= */}

            <div className="navbar-brand">

                <div className="logo-container">

                    <img
                        src={collegeLogo}
                        alt="Sri Venkatesa Perumal College Logo"
                        className="college-logo"
                    />

                </div>


                <div className="college-details">

                    <h1>
                        SRI VENKATESA PERUMAL
                    </h1>

                    <h2>
                        COLLEGE OF ENGINEERING & TECHNOLOGY
                    </h2>

                    <span>
                        AUTONOMOUS
                    </span>

                </div>

            </div>


            {/* =================================================
                FACULTY ATTENDANCE PROJECT ICON
                Design only - no functionality/API changes
            ================================================= */}

            <div className="navbar-actions">

                <div
                    className="attendance-project-icon"
                    title="Faculty Attendance System"
                    aria-label="Faculty Attendance System"
                >

                    <div className="attendance-icon-card">

                        <FaUserCheck />

                        <span className="attendance-check">
                            ✓
                        </span>

                    </div>

                    <span className="attendance-icon-shadow"></span>

                </div>

            </div>


        </header>

    );

}


export default Navbar;

