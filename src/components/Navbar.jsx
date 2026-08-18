import "./Navbar.css";

import {
    FaBell,
    FaHome,
    FaUserCircle
} from "react-icons/fa";

import collegeLogo from "../assets/collegelogo.jpeg";


function Navbar() {

    return (
        <header className="navbar">

            {/* College Branding */}
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


            {/* Project Related Icons */}
            <div className="navbar-actions">

                <button
                    className="nav-icon"
                    title="Home"
                >
                    <FaHome />
                </button>

                <button
                    className="nav-icon notification-icon"
                    title="Notifications"
                >
                    <FaBell />

                    <span className="notification-badge">
                        0
                    </span>
                </button>

                <button
                    className="nav-icon"
                    title="Profile"
                >
                    <FaUserCircle />
                </button>

            </div>

        </header>
    );
}

export default Navbar;