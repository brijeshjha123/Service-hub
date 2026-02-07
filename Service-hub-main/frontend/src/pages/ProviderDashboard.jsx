import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { CheckCircle, XCircle, DollarSign, Calendar, Clock, Bell, MapPin, Handshake } from 'lucide-react';
import { socket } from '../lib/socket';
import Map from '../components/Map';

const ProviderDashboard = () => {
    const { currentUser, userProfile } = useAuth();
    const [pendingBookings, setPendingBookings] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [earnings, setEarnings] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [selectedJobForMap, setSelectedJobForMap] = useState(null);

    // Socket Initialization & Real-time Updates
    useEffect(() => {
        if (!currentUser) return;

        // Join provider-specific room
        socket.emit('join_room', currentUser.id); // Using .id from backend user
        socket.emit('join_room', 'providers');

        socket.on('newBookingRequest', (data) => {
            console.log('[SOCKET] New booking received:', data);

            // Strict Category Matching for Real-time events
            if (userProfile?.serviceCategory && data.serviceCategory !== userProfile.serviceCategory) {
                return;
            }

            setPendingBookings(prev => [data, ...prev]);

            // Add to notifications
            const newNotif = {
                id: Date.now(),
                message: `New Booking Request: ${data.serviceName} at ${data.time}`,
                createdAt: new Date(),
                read: false
            };
            setNotifications(prev => [newNotif, ...prev]);
        });

        socket.on('bookingStatusUpdate', (data) => {
            // If a booking we accepted was updated elsewhere (less likely for provider, but good for sync)
            fetchBookings();
        });

        return () => {
            socket.off('newBookingRequest');
            socket.off('bookingStatusUpdate');
        };
    }, [currentUser]);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings');
            const allBookings = response.data;

            setPendingBookings(allBookings.filter(b => b.status === 'pending'));
            setMyJobs(allBookings.filter(b => ['accepted', 'in-progress', 'completed'].includes(b.status)));

            const total = allBookings
                .filter(job => job.status === 'completed')
                .reduce((acc, job) => acc + (job.price || 0), 0);
            setEarnings(total);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchBookings();
        }
    }, [currentUser]);

    const handleAccept = async (booking) => {
        try {
            await api.patch(`/bookings/${booking.id || booking._id}`, { status: 'accepted' });
            fetchBookings();
        } catch (error) {
            console.error("Error accepting job", error);
        }
    };

    const handleDecline = async (booking) => {
        try {
            await api.patch(`/bookings/${booking.id || booking._id}`, { status: 'cancelled' });
            fetchBookings();
        } catch (error) {
            console.error("Error declining job", error);
        }
    };

    const handleStart = async (booking) => {
        try {
            await api.patch(`/bookings/${booking.id || booking._id}`, { status: 'in-progress' });
            fetchBookings();
        } catch (error) {
            console.error("Error starting job", error);
        }
    };

    const handleComplete = async (booking) => {
        try {
            await api.patch(`/bookings/${booking.id || booking._id}`, { status: 'completed' });
            fetchBookings();
        } catch (error) {
            console.error("Error completing job", error);
        }
    };

    const markRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Provider Dashboard</h1>
                    <Card className="bg-green-600 text-white w-48">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-white/20 rounded-full">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm opacity-80">Total Earnings</p>
                                <p className="text-2xl font-bold">₹{earnings}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Notifications Section */}
                <Card className="border-l-4 border-l-blue-600">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bell className="h-5 w-5 text-blue-600" /> Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {notifications.length === 0 ? (
                                <p className="text-sm text-gray-500">No notifications.</p>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} className={`p-3 rounded-lg text-sm border flex justify-between items-center ${n.read ? 'bg-white opacity-60' : 'bg-blue-50 border-blue-100'}`}>
                                        <div>
                                            <p className="font-semibold">{n.message}</p>
                                            <p className="text-xs text-gray-500">
                                                {n.createdAt instanceof Date ? n.createdAt.toLocaleString() : n.createdAt?.toDate?.()?.toLocaleString() || new Date(n.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!n.read && (
                                            <Button size="xs" variant="ghost" onClick={() => markRead(n.id)} className="h-7 text-xs">
                                                Mark Read
                                            </Button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Available Jobs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>New Job Requests</CardTitle>
                            <CardDescription>Accept jobs to start earning.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {pendingBookings.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No new requests available.</p>
                            ) : (
                                pendingBookings.map(job => (
                                    <div key={job._id || job.id} className="border p-4 rounded-lg flex justify-between items-center bg-white shadow-sm">
                                        <div>
                                            <h3 className="font-bold">{job.serviceName}</h3>
                                            <div className="flex gap-3 text-sm text-gray-600 mt-1">
                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {job.date}</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.time}</span>
                                            </div>
                                            <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {job.location?.address}
                                            </p>
                                            <p className="text-green-600 font-bold mt-2">₹{job.price}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDecline(job)}>Decline</Button>
                                            <Button size="sm" onClick={() => handleAccept(job)}>Accept Job</Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* My Active Jobs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>My Schedule</CardTitle>
                            <CardDescription>Upcoming and ongoing jobs.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {myJobs.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No active jobs.</p>
                            ) : (
                                myJobs.map(job => (
                                    <div key={job._id || job.id} className="border p-4 rounded-lg bg-white shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold">{job.serviceName}</h3>
                                                <p className="text-xs text-gray-500">Customer: {job.customerEmail}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                job.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                {job.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1 text-sm text-gray-600 mb-4">
                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {job.date}</span>
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.time}</span>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="flex items-center gap-1 font-medium text-gray-900">
                                                    <MapPin className="h-3 w-3 text-red-500" /> {job.location?.address}
                                                </span>
                                                {job.location?.lat && (
                                                    <Button
                                                        variant="ghost"
                                                        size="xs"
                                                        className="text-primary h-6 px-2 underline text-[10px]"
                                                        onClick={() => setSelectedJobForMap((selectedJobForMap?._id || selectedJobForMap?.id) === (job._id || job.id) ? null : job)}
                                                    >
                                                        {(selectedJobForMap?._id || selectedJobForMap?.id) === (job._id || job.id) ? 'Hide Map' : 'View on Map'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {(selectedJobForMap?._id || selectedJobForMap?.id) === (job._id || job.id) && job.location?.lat && (
                                            <div className="mb-4 animate-in fade-in duration-300">
                                                <Map center={job.location} height="200px" />
                                            </div>
                                        )}

                                        {job.status === 'accepted' && (
                                            <Button size="sm" className="w-full bg-primary" onClick={() => handleStart(job)}>
                                                Start Service
                                            </Button>
                                        )}

                                        {job.status === 'in-progress' && (
                                            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleComplete(job)}>
                                                Mark as Completed
                                            </Button>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
