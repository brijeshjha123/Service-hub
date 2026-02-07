import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertCircle, Briefcase } from 'lucide-react';

const ProviderSignup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [serviceCategory, setServiceCategory] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (!serviceCategory) {
            return setError('Please select a service category.');
        }

        try {
            setLoading(true);
            await signup(email, password, 'provider', name, serviceCategory);
            navigate('/login'); // Redirect to customer login for now, or provider login once created
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create an account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex h-12 w-12 bg-blue-600 rounded-2xl items-center justify-center shadow-lg mb-4 text-white font-extrabold text-2xl">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Partner Registration</h1>
                    <p className="text-gray-600 mt-2 font-medium">Join our network of professionals</p>
                </div>

                <Card className="border-none shadow-2xl shadow-blue-100/50 backdrop-blur-sm bg-white/95">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl font-bold text-gray-900">Become a Partner</CardTitle>
                        <CardDescription className="text-gray-500">
                            Register as a service provider to start receiving orders
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-100 italic">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700 font-semibold">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="border-gray-200 focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="partner@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="border-gray-200 focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" title="At least 6 characters" className="text-gray-700 font-semibold">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="border-gray-200 focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" title="Repeat your password" className="text-gray-700 font-semibold">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="border-gray-200 focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-gray-700 font-semibold">Service Category</Label>
                                <select
                                    id="category"
                                    value={serviceCategory}
                                    onChange={(e) => setServiceCategory(e.target.value)}
                                    required
                                    className="flex h-12 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select your expertise</option>
                                    <option value="Plumber">Plumber</option>
                                    <option value="Electrician">Electrician</option>
                                    <option value="Cleaner">House Cleaner</option>
                                    <option value="Other">Other Services</option>
                                </select>
                            </div>

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-bold shadow-xl shadow-blue-100 mt-4" disabled={loading}>
                                {loading ? 'Registering...' : 'Complete Registration'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t py-4">
                        <p className="text-sm text-gray-500">
                            Already a partner?{' '}
                            <Link to="/login" className="text-blue-600 font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default ProviderSignup;
