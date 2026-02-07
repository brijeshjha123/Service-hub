import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categories } from '../data/services';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Calendar, Clock, CreditCard, CheckCircle, MapPin as MapPinIcon, AlertCircle } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';
import { socket } from '../lib/socket';

const BookService = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();

    // Find service details
    const allServices = categories.flatMap(c => c.services);
    const service = allServices.find(s => s.id === serviceId);

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success

    if (!service) return <div className="p-10 text-center">Service not found</div>;

    const handleBook = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (userProfile?.role === 'provider') {
            return setError('Service Providers cannot book services. Please use a Customer account.');
        }

        // Future Date & Time Validation
        const selectedDateTime = new Date(`${date}T${time}`);
        const now = new Date();

        if (selectedDateTime <= now) {
            return setError('Booking date and time must be in the future.');
        }

        if (!location?.address) {
            return setError('Please provide a service address.');
        }

        setError('');
        setStep(2); // Move to Mock Payment
    };

    const confirmPayment = async () => {
        setLoading(true);
        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // detailed category mapping
            const categoryGroup = categories.find(c => c.services.some(s => s.id === serviceId));
            let providerCategory = 'Other';

            if (categoryGroup?.id === 'cleaning') providerCategory = 'Cleaner';
            if (service.name.toLowerCase().includes('electric')) providerCategory = 'Electrician';
            if (service.name.toLowerCase().includes('plumb')) providerCategory = 'Plumber';

            const bookingData = {
                serviceId: service.id,
                serviceName: service.name,
                serviceImage: service.image,
                price: service.price,
                date: date,
                time: time,
                location: location,
                providerId: service.providerId || 'mock-provider-id',
                serviceCategory: providerCategory
            };

            // Set a timeout of 15 seconds for the entire operation
            const response = await api.post('/bookings', bookingData);

            console.log("✅ Booking confirmed:", response.data._id);
            setStep(3); // Success
        } catch (error) {
            console.error("❌ CRITICAL ERROR: Booking failed:", error);
            setError(`Booking failed: ${error.response?.data?.message || error.message || 'Unknown error'}.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                {step === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Book {service.name}</CardTitle>
                            <CardDescription>Select a convenient slot for your service.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                            <div className="flex gap-4 p-4 bg-blue-50 rounded-lg items-center">
                                <img src={service.image} alt={service.name} className="w-20 h-20 object-cover rounded-md" />
                                <div>
                                    <p className="font-bold text-lg">₹{service.price}</p>
                                    <p className="text-sm text-gray-600">Duration: 45-60 mins</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input type="date" className="pl-10" value={date} onChange={e => setDate(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Time</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input type="time" className="pl-10" value={time} onChange={e => setTime(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <LocationPicker onLocationSelect={setLocation} />
                            </div>

                            <Button className="w-full" size="lg" onClick={handleBook} disabled={!date || !time || !location}>
                                Proceed to Pay
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment</CardTitle>
                            <CardDescription>Mock Payment Gateway (No actual charge)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 text-center">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 justify-center">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                            <div className="py-8">
                                <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-xl font-bold">Total Amount: ₹{service.price}</p>
                                <p className="text-gray-500 text-sm mt-2">Click "Pay Now" to simulate a successful transaction.</p>
                            </div>
                            <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" onClick={confirmPayment} disabled={loading}>
                                {loading ? 'Processing...' : `Pay ₹${service.price}`}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 3 && (
                    <Card className="text-center py-10">
                        <CardContent className="space-y-6">
                            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
                            <p className="text-gray-600">Your service for {service.name} has been booked successfully.</p>
                            <Button onClick={() => navigate('/bookings')}>Go to My Bookings</Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default BookService;
