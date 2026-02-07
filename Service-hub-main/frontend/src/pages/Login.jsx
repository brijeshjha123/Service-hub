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

    const { login, loginWithGoogle, userProfile } = useAuth();
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
            navigate('/');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/popup-blocked') {
                setError('Popup blocked! Please allow popups for this site.');
            } else if (window.location.hostname === '127.0.0.1') {
                setError('Google Login often fails on 127.0.0.1. Try using http://localhost:5173 instead.');
            } else {
                setError('Failed to log in with Google. Check your internet or console.');
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
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="h-5 w-5" alt="Google" />
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
