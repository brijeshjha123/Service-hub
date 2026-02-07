import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const { user } = await login(email, password);

            // Strict Role-Based Redirection
            if (user.role === 'provider') {
                navigate('/provider/dashboard');
            } else if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                // Default to Customer Dashboard
                navigate('/customer/dashboard');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to log in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            navigate('/customer/dashboard');
        } catch (err) {
            console.error("GOOGLE SIGNIN ERROR:", err);
            if (err.code === 'auth/popup-blocked') {
                setError('Popup blocked! Please allow popups for this site.');
            } else if (err.code === 'auth/unauthorized-domain') {
                setError('This domain is not authorized in Firebase. Add "' + window.location.hostname + '" to Authorized Domains in Firebase Console > Auth > Settings.');
            } else if (window.location.hostname === '127.0.0.1') {
                setError('Google Login often fails on 127.0.0.1. Try using http://localhost:5173 instead.');
            } else {
                setError(`Google Login failed: ${err.code || 'Network error'}. ${err.message || ''}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex h-12 w-12 bg-indigo-600 rounded-2xl items-center justify-center shadow-lg mb-4 text-white font-extrabold text-2xl">
                        S
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-700 mt-2 font-semibold">Login to your ServiceHub account</p>
                </div>

                <Card className="border-none shadow-2xl shadow-indigo-100/50 backdrop-blur-sm bg-white/95">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl font-bold">Login</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
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
                                <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 border-gray-300 focus:border-indigo-600 bg-white text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" title="Enter your password" className="text-gray-700 font-semibold">Password</Label>
                                    <Link to="#" className="text-sm text-indigo-700 hover:underline font-bold">Forgot password?</Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 border-gray-300 focus:border-indigo-600 bg-white text-gray-900"
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100 text-white" disabled={loading}>
                                {loading ? 'Logging in...' : 'Sign In'}
                            </Button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-gray-400 font-medium tracking-widest">Or continue with</span></div>
                        </div>

                        <Button variant="outline" type="button" className="w-full h-12 border-gray-200 hover:bg-gray-50 transition-all font-semibold flex items-center justify-center gap-2 shadow-sm" onClick={handleGoogleSignIn} disabled={loading}>
                            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </Button>

                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-gray-100 mt-4 py-6">
                        <p className="text-sm text-gray-700">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-indigo-700 font-bold hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Login;
