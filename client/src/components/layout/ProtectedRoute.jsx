import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // User logged in but hasn't selected a role yet
    if (user.needsRole) {
        return <Navigate to="/select-role" replace />;
    }

    // Recruiter/College awaiting admin approval
    if (user.pendingApproval || user.approvalStatus === 'PENDING') {
        return <Navigate to="/pending-approval" replace />;
    }

    // Role-based access control
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to role-appropriate page
        if (user.role === 'SUPER_ADMIN') return <Navigate to="/app/admin" replace />;
        if (user.role === 'RECRUITER') return <Navigate to="/app/recruiter" replace />;
        return <Navigate to="/app" replace />;
    }

    return children;
};

export default ProtectedRoute;
