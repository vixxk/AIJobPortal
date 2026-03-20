import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Redirects user to their role-specific home page */
export const RoleRedirect = () => {
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
    if (!user) return <Navigate to="/" replace />;
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/app/admin" replace />;
    if (user.role === 'RECRUITER') return <Navigate to="/app/recruiter" replace />;
    if (user.role === 'COLLEGE_ADMIN') return <Navigate to="/app/college" replace />;
    if (user.role === 'TEACHER') return <Navigate to="/app/teacher" replace />;
    return <Navigate to="/app/dashboard" replace />; // STUDENT
};

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
        return <Navigate to="/" replace />;
    }
    if (user.needsRole) {
        return <Navigate to="/select-role" replace />;
    }
    if (user.pendingApproval || user.approvalStatus === 'PENDING') {
        return <Navigate to="/pending-approval" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'SUPER_ADMIN') return <Navigate to="/app/admin" replace />;
        if (user.role === 'RECRUITER') return <Navigate to="/app/recruiter" replace />;
        if (user.role === 'COLLEGE_ADMIN') return <Navigate to="/app/college" replace />;
        if (user.role === 'TEACHER') return <Navigate to="/app/teacher" replace />;
        return <Navigate to="/app/dashboard" replace />; // STUDENT fallback
    }
    return children;
};
export default ProtectedRoute;
