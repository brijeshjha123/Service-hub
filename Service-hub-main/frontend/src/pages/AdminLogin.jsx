import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertCircle } from 'lucide-react';
import api from '../api/axios';

const AdminLogin = () => {
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

            // Check if user is actually admin before full login (optional security step)
            // For now, we rely on the login function and then check role
            const { user } = await login(email, password);

            if (user.role !== 'admin') {
                setError('Access Denied: You are not an administrator.');
                // Optionally logout immediately
                return;
            }

            navigate('/admin/dashboard');
        } catch (err) {
            console.error(err);
            setError('Invalid Admin Credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
            <Card className="w-full max-w-md border-gray-800 bg-gray-800 text-gray-100">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-red-500">Admin Portal</CardTitle>
                    <CardDescription className="text-center text-gray-400">
                        Restricted Access Only
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-900/50 text-red-300 p-3 rounded text-sm flex items-center gap-2 border border-red-800">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Admin Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-gray-700 border-gray-600 text-white focus:border-red-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-gray-700 border-gray-600 text-white focus:border-red-500"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                            {loading ? 'Authenticating...' : 'Access Dashboard'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogin;
