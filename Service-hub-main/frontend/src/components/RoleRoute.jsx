import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleRoute = ({ children, allowedRoles }) => {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontSize: '1.5rem',
                color: '#646cff'
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Role-based redirection if not authorized for this specific route
    if (allowedRoles && userProfile?.role && !allowedRoles.includes(userProfile?.role)) {
        if (userProfile.role === 'provider') {
            return <Navigate to="/provider/dashboard" replace />;
        }
        if (userProfile.role === 'customer') {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default RoleRoute;
