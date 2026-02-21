import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for mock session on load
        const storedUser = localStorage.getItem('gradnex_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Hardcoded demo credentials
        if (email === 'demo@user.com' && password === 'password123') {
            const mockUser = {
                name: 'Alex Johnson',
                role: 'Student',
                email: 'demo@user.com',
                avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
            };
            setUser(mockUser);
            localStorage.setItem('gradnex_user', JSON.stringify(mockUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('gradnex_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
