import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
    const { isAuth, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <p>Loading...</p>
        );
    }

    if (!isAuth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
} 