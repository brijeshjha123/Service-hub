import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { User, LogOut, Bell, LayoutDashboard, Briefcase } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const Navbar = () => {
    const { currentUser, userProfile, loading, logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser || !currentUser.uid) return;

        const q = query(
            collection(db, "notifications"),
            where("recipientId", "==", currentUser.uid),
            where("read", "==", false)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setUnreadCount(snapshot.docs.length);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2 group transition-all duration-300">
                        <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/25 group-hover:-rotate-3 transition-all duration-300">
                            <span className="text-white font-extrabold text-xl">S</span>
                        </div>
                        <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">ServiceHub</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
                        <Link to="/services" className="text-sm font-medium hover:text-primary transition-colors">Find Services</Link>
                        {loading ? (
                            <span className="text-xs text-gray-400 animate-pulse">Syncing profile...</span>
                        ) : (
                            <>
                                {currentUser && userProfile?.role === 'customer' && (
                                    <Link to="/customer/dashboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                                        <LayoutDashboard className="h-4 w-4" /> My Bookings
                                    </Link>
                                )}
                                {currentUser && userProfile?.role === 'provider' && (
                                    <Link to="/provider/dashboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" /> Service Requests
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        {loading ? (
                            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        ) : currentUser ? (
                            <div className="flex items-center gap-4">
                                <div className="relative cursor-pointer" onClick={() => navigate(userProfile?.role === 'provider' ? '/pro' : '/dashboard')}>
                                    <Bell className="h-5 w-5 text-gray-600" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                                    <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
                                        <User className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-800">
                                        {userProfile?.displayName || userProfile?.name || currentUser.email?.split('@')[0]}
                                    </span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="hover:bg-red-50 hover:text-red-600 transition-colors">
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login">
                                    <Button variant="ghost">Login</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button>Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
