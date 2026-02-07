import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';
import { socket } from '../lib/socket';
import Map from '../components/Map';

import RaiseComplaintModal from '../components/RaiseComplaintModal';

const MyBookings = () => {
    const { currentUser } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingBooking, setRatingBooking] = useState(null);
    const [complaintBooking, setComplaintBooking] = useState(null);
    const [ratingValue, setRatingValue] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [selectedBookingForMap, setSelectedBookingForMap] = useState(null);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings');
            setBookings(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setLoading(false);
        }
    };

    // Socket Initialization & Real-time Updates
    useEffect(() => {
        if (!currentUser) return;

        socket.emit('join_room', currentUser.id);

        socket.on('bookingStatusUpdate', (data) => {
            console.log('[SOCKET] Booking status update:', data);
            alert(`Update for ${data.serviceName}: Status is now ${data.status.toUpperCase()}`);
            fetchBookings();
        });

        return () => {
            socket.off('bookingStatusUpdate');
        };
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchBookings();
        }
    }, [currentUser]);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending': return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Request' };
            case 'accepted': return { color: 'bg-blue-100 text-blue-800', label: 'Accepted' };
            case 'cancelled':
            case 'declined': return { color: 'bg-red-100 text-red-800', label: 'Declined/Cancelled' };
            case 'in-progress': return { color: 'bg-purple-100 text-purple-800', label: 'Service In-Progress' };
            case 'completed': return { color: 'bg-green-100 text-green-800', label: 'Completed' };
            default: return { color: 'bg-gray-100 text-gray-800', label: status };
        }
    };

    const handleRatingSubmit = async (bookingId) => {
        setSubmittingRating(true);
        try {
            await api.patch(`/bookings/${bookingId}`, {
                rating: ratingValue,
                review: reviewText
            });
            setRatingBooking(null);
            setRatingValue(5);
            setReviewText('');
            fetchBookings();
        } catch (error) {
            console.error("Error submitting rating:", error);
            alert("Failed to submit rating");
        } finally {
            setSubmittingRating(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading bookings...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

                {bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No bookings found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(booking => (
                            <Card key={booking._id || booking.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    <img src={booking.serviceImage} alt={booking.serviceName} className="w-20 h-20 rounded-md object-cover bg-gray-200" />

                                    <div className="flex-grow w-full">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-xl">{booking.serviceName}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusInfo(booking.status).color}`}>
                                                {getStatusInfo(booking.status).label}
                                            </span>
                                        </div>
                                        <p className="text-lg font-bold mt-1">₹{booking.price}</p>

                                        <div className="flex gap-4 mt-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" /> {booking.date}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" /> {booking.time}
                                            </div>
                                            {booking.location && (
                                                <button
                                                    className="flex items-center gap-1 text-blue-600 hover:underline"
                                                    onClick={() => setSelectedBookingForMap(selectedBookingForMap === (booking._id || booking.id) ? null : (booking._id || booking.id))}
                                                >
                                                    <MapPin className="h-4 w-4" />
                                                    {selectedBookingForMap === (booking._id || booking.id) ? 'Hide Location' : 'View Location'}
                                                </button>
                                            )}
                                        </div>

                                        {selectedBookingForMap === (booking._id || booking.id) && booking.location?.lat && (
                                            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                                                <Map center={booking.location} height="150px" />
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center mt-4">
                                            {/* Actions Area */}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8"
                                                    onClick={() => setComplaintBooking(booking)}
                                                >
                                                    <AlertCircle className="h-3 w-3 mr-1" /> Report Issue
                                                </Button>
                                            </div>

                                            {booking.status === 'completed' && !booking.rating && (
                                                <div>
                                                    {ratingBooking === (booking._id || booking.id) ? (
                                                        <div className="bg-gray-50 p-4 rounded-lg space-y-3 mt-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium">Rating:</span>
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`h-5 w-5 cursor-pointer ${star <= ratingValue ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                                                        onClick={() => setRatingValue(star)}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <textarea
                                                                className="w-full p-2 border rounded-md text-sm"
                                                                placeholder="Leave a review (optional)"
                                                                value={reviewText}
                                                                onChange={(e) => setReviewText(e.target.value)}
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button size="sm" onClick={() => handleRatingSubmit(booking._id || booking.id)} disabled={submittingRating}>
                                                                    {submittingRating ? 'Submitting...' : 'Submit'}
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={() => setRatingBooking(null)}>Cancel</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => setRatingBooking(booking._id || booking.id)}>
                                                            <Star className="h-4 w-4" /> Rate Service
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {booking.rating && (
                                            <div className="mt-4 flex items-center gap-2 bg-yellow-50 p-2 rounded-md w-fit">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${star <= booking.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                                {booking.review && <span className="text-sm italic text-gray-600">"{booking.review}"</span>}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {complaintBooking && (
                    <RaiseComplaintModal
                        booking={complaintBooking}
                        onClose={() => setComplaintBooking(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default MyBookings;
