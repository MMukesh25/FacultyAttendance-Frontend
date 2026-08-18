import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

// =========================================================
// PUBLIC PAGES
// =========================================================

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

// =========================================================
// FACULTY PAGES
// =========================================================

import FacultyDashboard from "./pages/FacultyDashboard";
import AttendanceHistory from "./pages/AttendanceHistory";
import ViewAllAttendance from "./pages/ViewAllAttendance";
import ApplyLeave from "./pages/ApplyLeave";

// =========================================================
// ADMIN PAGE
// =========================================================

import AdminDashboard from "./pages/AdminDashboard";

// =========================================================
// PROTECTED ROUTE
// =========================================================

import ProtectedRoute from "./components/ProtectedRoute";


function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* =================================================
                    PUBLIC ROUTES
                ================================================= */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />


                {/* =================================================
                    FACULTY DASHBOARD
                ================================================= */}

                <Route
                    path="/faculty-dashboard"
                    element={
                        <ProtectedRoute role="FACULTY">
                            <FacultyDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    FACULTY - ATTENDANCE HISTORY
                ================================================= */}

                <Route
                    path="/attendance-history"
                    element={
                        <ProtectedRoute role="FACULTY">
                            <AttendanceHistory />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    FACULTY - VIEW ALL ATTENDANCE
                ================================================= */}

                <Route
                    path="/attendance-all"
                    element={
                        <ProtectedRoute role="FACULTY">
                            <ViewAllAttendance />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    FACULTY - APPLY LEAVE
                ================================================= */}

                <Route
                    path="/apply-leave"
                    element={
                        <ProtectedRoute role="FACULTY">
                            <ApplyLeave />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    ADMIN DASHBOARD
                ================================================= */}

                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute role="ADMIN">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    UNKNOWN ROUTE
                ================================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}


export default App;