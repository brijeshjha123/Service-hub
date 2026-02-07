import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import MyBookings from './MyBookings';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { User, Mail, Phone, LogOut } from 'lucide-react';

const Dashboard = () => {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (!currentUser) return <div className="p-10 text-center">Please log in to view dashboard.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Profile Section - Left Sidebar */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <User className="h-12 w-12 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold">{currentUser.displayName || currentUser.email?.split('@')[0]}</CardTitle>
                            <p className="text-gray-500 text-sm capitalize">{userProfile?.role || 'Customer'}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-700">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{currentUser.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{currentUser.phoneNumber || 'No phone added'}</span>
                            </div>

                            <div className="pt-4">
                                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content - Bookings */}
                <div className="md:col-span-2">
                    <MyBookings />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
