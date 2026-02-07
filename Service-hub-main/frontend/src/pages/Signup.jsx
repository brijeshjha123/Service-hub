import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertCircle } from 'lucide-react';

const Signup = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const initialRole = queryParams.get('role') || 'customer';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState(initialRole); // Default to customer or param
    const [serviceCategory, setServiceCategory] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (role === 'provider' && !serviceCategory) {
            return setError('Please select a service category.');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password, role, name, serviceCategory);
            navigate('/login'); // Redirect to login after signup for backend auth
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create an account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex h-12 w-12 bg-indigo-600 rounded-2xl items-center justify-center shadow-lg mb-4 text-white font-extrabold text-2xl">
                        S
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-600 mt-2 font-medium">Join ServiceHub today</p>
                </div>

                <Card className="border-none shadow-2xl shadow-indigo-100/50 backdrop-blur-sm bg-white/95">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl font-bold text-gray-900">Signup</CardTitle>
                        <CardDescription className="text-gray-500">
                            Enter your details to create your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4 text-gray-900">
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
                                    className="border-gray-200 focus:border-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="border-gray-200 focus:border-indigo-500"
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
                                    className="border-gray-200 focus:border-indigo-500"
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
                                    className="border-gray-200 focus:border-indigo-500"
                                />
                            </div>
                            {/* Role Selection - REMOVED to enforce strict separation */}
                            {/* The role is determined by the URL parameter (?role=provider) or defaults to customer */}

                            {role === 'provider' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <Label htmlFor="category" className="text-gray-700 font-semibold">Service Category</Label>
                                    <select
                                        id="category"
                                        value={serviceCategory}
                                        onChange={(e) => setServiceCategory(e.target.value)}
                                        required
                                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select a category</option>
                                        <option value="Plumber">Plumber</option>
                                        <option value="Electrician">Electrician</option>
                                        <option value="Cleaner">Cleaner</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg font-bold shadow-xl shadow-indigo-100 mt-4" disabled={loading}>
                                {loading ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t py-4">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Signup;
