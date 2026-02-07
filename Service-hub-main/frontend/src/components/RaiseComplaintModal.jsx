import { useState } from 'react';
import api from '../api/axios';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card';
import { Label } from './ui/Label';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const RaiseComplaintModal = ({ booking, onClose, onComplaintSubmitted }) => {
    const { userProfile } = useAuth();
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            await api.post('/complaints', {
                customerId: userProfile.uid || userProfile._id,
                providerId: booking.provider?._id || booking.provider,
                orderId: booking._id,
                reason,
                description
            });

            setSuccess(true);
            setTimeout(() => {
                if (onComplaintSubmitted) onComplaintSubmitted();
                onClose();
            }, 2000);
        } catch (err) {
            console.error("Complaint error:", err);
            setError(err.response?.data?.error || 'Failed to submit complaint.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md bg-white border-green-500 border-2">
                    <CardContent className="flex flex-col items-center py-10">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Complaint Submitted</h3>
                        <p className="text-gray-500 text-center mt-2">The admin team will review your issue shortly.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white">
                <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Raise a Complaint
                    </CardTitle>
                    <CardDescription>
                        Reporting an issue for order #{booking?._id?.slice(-6)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <select
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            >
                                <option value="">Select a reason</option>
                                <option value="Service Quality">Service Quality</option>
                                <option value="Provider Behavior">Provider Behavior</option>
                                <option value="Payment Issue">Payment Issue</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows="4"
                                className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                placeholder="Please describe the issue in detail..."
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Complaint'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default RaiseComplaintModal;
