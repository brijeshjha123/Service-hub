import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertCircle, Briefcase } from 'lucide-react';

const ProviderLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const { user } = await login(email, password);

            if (user.role === 'provider') {
                navigate('/provider/dashboard');
            } else {
                setError('Invalid credentials for partner login.');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to log in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex h-12 w-12 bg-blue-600 rounded-2xl items-center justify-center shadow-lg mb-4 text-white font-extrabold text-2xl">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Partner Login</h1>
                    <p className="text-gray-600 mt-2 font-medium">Access your service hub</p>
                </div>

                <Card className="border-none shadow-2xl shadow-blue-100/50 backdrop-blur-sm bg-white/95">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl font-bold">Sign In</CardTitle>
                        <CardDescription>
                            Enter your partner account details
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
                                <Label htmlFor="email" className="text-gray-700 font-semibold">Partner Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="partner@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 border-gray-200 focus:border-blue-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" title="Enter your password" className="text-gray-700 font-semibold">Password</Label>
                                    <Link to="#" className="text-sm text-blue-700 hover:underline font-bold">Forgot?</Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 border-gray-200 focus:border-blue-600"
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-100 text-white" disabled={loading}>
                                {loading ? 'Checking...' : 'Sign In as Partner'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-gray-100 mt-4 py-6">
                        <p className="text-sm text-gray-700">
                            New partner?{' '}
                            <Link to="/provider/signup" className="text-blue-700 font-bold hover:underline">
                                Register here
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default ProviderLogin;
