import { Navigate, useLocation } from "react-router-dom";


function ProtectedRoute({ children, role }) {

    const location = useLocation();

    const storedUser =
        localStorage.getItem("user");


    // =========================================================
    // NO USER LOGGED IN
    // =========================================================

    if (!storedUser) {

        return (
            <Navigate
                to="/login"
                state={{
                    from: location.pathname
                }}
                replace
            />
        );

    }


    // =========================================================
    // READ USER
    // =========================================================

    let user;

    try {

        user = JSON.parse(storedUser);

    } catch (error) {

        console.error(
            "Invalid user data in localStorage:",
            error
        );

        localStorage.removeItem("user");

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    // =========================================================
    // INVALID USER
    // =========================================================

    if (
        !user ||
        !user.id ||
        !user.role
    ) {

        localStorage.removeItem("user");

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    // =========================================================
    // ROLE PROTECTION
    // =========================================================

    if (
        role &&
        user.role !== role
    ) {

        // Faculty trying to access Admin page
        if (user.role === "FACULTY") {

            return (
                <Navigate
                    to="/faculty-dashboard"
                    replace
                />
            );

        }


        // Admin trying to access Faculty page
        if (user.role === "ADMIN") {

            return (
                <Navigate
                    to="/admin-dashboard"
                    replace
                />
            );

        }


        // Unknown role
        localStorage.removeItem("user");

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    // =========================================================
    // AUTHENTICATED + CORRECT ROLE
    // =========================================================

    return children;

}


export default ProtectedRoute;

