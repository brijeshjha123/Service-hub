import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, DollarSign, AlertTriangle, Briefcase } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [providers, setProviders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);

            const providersRes = await api.get('/admin/providers');
            setProviders(providersRes.data);

            const customersRes = await api.get('/admin/customers');
            setCustomers(customersRes.data);

            const complaintsRes = await api.get('/admin/complaints');
            setComplaints(complaintsRes.data);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const updateComplaintStatus = async (id, status) => {
        try {
            await api.put(`/complaints/${id}`, { status });
            fetchData(); // Refresh
        } catch (error) {
            console.error("Failed to update complaint", error);
        }
    };

    const updateUserStatus = async (id, isBlocked) => {
        try {
            await api.put(`/admin/users/${id}`, { isBlocked });
            fetchData(); // Refresh
            // Optional: Add toast notification here
        } catch (error) {
            console.error("Failed to update user status", error);
            alert("Failed to update user status");
        }
    };

    if (loading) return <div className="p-8 text-white">Loading Admin Data...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center shadow-lg">
                <h1 className="text-xl font-bold text-red-500 flex items-center gap-2">
                    <span className="bg-red-500/10 p-2 rounded-lg">🛡️</span> Admin Dashboard
                </h1>
                <nav className="flex gap-4">
                    {['overview', 'providers', 'customers', 'complaints'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg transition-all ${activeTab === tab
                                ? 'bg-red-600 text-white shadow-red-900/20 shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
            </header>

            <main className="p-8 max-w-7xl mx-auto">
                {activeTab === 'overview' && stats && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatsCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="text-green-400" />} />
                            <StatsCard title="Platform Fees (3%)" value={`$${stats.platformFees.toFixed(2)}`} icon={<DollarSign className="text-blue-400" />} />
                            <StatsCard title="Active Providers" value={stats.totalProviders} icon={<Briefcase className="text-purple-400" />} />
                            <StatsCard title="Total Customers" value={stats.totalCustomers} icon={<Users className="text-orange-400" />} />
                        </div>
                    </div>
                )}

                {activeTab === 'providers' && (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-lg font-semibold">Service Providers</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900/50 text-gray-400 text-sm">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {providers.map(p => (
                                        <tr key={p._id} className="hover:bg-gray-700/50 transition-colors">
                                            <td className="p-4 font-medium">{p.name}</td>
                                            <td className="p-4 text-gray-400">{p.email}</td>
                                            <td className="p-4"><span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs">{p.serviceCategory || 'N/A'}</span></td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs border ${p.isBlocked ? 'bg-red-900/30 text-red-400 border-red-900' : 'bg-green-900/30 text-green-400 border-green-900'
                                                    }`}>
                                                    {p.isBlocked ? 'Suspended' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="p-4 flex gap-2">
                                                {p.isBlocked ? (
                                                    <Button onClick={() => updateUserStatus(p._id, false)} size="sm" className="text-xs h-7 bg-green-600 hover:bg-green-700">Activate</Button>
                                                ) : (
                                                    <Button onClick={() => updateUserStatus(p._id, true)} size="sm" variant="destructive" className="text-xs h-7 bg-red-600 hover:bg-red-700">Suspend</Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'customers' && (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-lg font-semibold">Customers</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900/50 text-gray-400 text-sm">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Joined</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {customers.length === 0 ? (
                                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">No customers found.</td></tr>
                                    ) : (
                                        customers.map(c => (
                                            <tr key={c._id} className="hover:bg-gray-700/50 transition-colors">
                                                <td className="p-4 font-medium">{c.name}</td>
                                                <td className="p-4 text-gray-400">{c.email}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs border ${c.isBlocked ? 'bg-red-900/30 text-red-400 border-red-900' : 'bg-green-900/30 text-green-400 border-green-900'
                                                        }`}>
                                                        {c.isBlocked ? 'Blocked' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-500 text-sm">{new Date(c.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    {c.isBlocked ? (
                                                        <Button onClick={() => updateUserStatus(c._id, false)} size="sm" className="text-xs h-7 bg-green-600 hover:bg-green-700">Unblock</Button>
                                                    ) : (
                                                        <Button onClick={() => updateUserStatus(c._id, true)} size="sm" variant="destructive" className="text-xs h-7 bg-red-600 hover:bg-red-700">Block</Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'complaints' && (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-lg font-semibold text-red-400">Customer Complaints</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900/50 text-gray-400 text-sm">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Reason</th>
                                        <th className="p-4">Description</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {complaints.length === 0 ? (
                                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">No complaints found.</td></tr>
                                    ) : (
                                        complaints.map(c => (
                                            <tr key={c._id} className="hover:bg-gray-700/50 transition-colors">
                                                <td className="p-4 text-sm text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4 font-medium">{c.reason}</td>
                                                <td className="p-4 text-gray-300 max-w-xs truncate" title={c.description}>{c.description}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs border ${c.status === 'Resolved' ? 'bg-green-900/30 text-green-400 border-green-900' :
                                                        c.status === 'In Review' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-900' :
                                                            'bg-red-900/30 text-red-400 border-red-900'
                                                        }`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {c.status !== 'Resolved' && (
                                                        <div className="flex gap-2">
                                                            <Button onClick={() => updateComplaintStatus(c._id, 'In Review')} size="sm" variant="outline" className="text-xs h-7 border-gray-600 hover:bg-gray-700">Review</Button>
                                                            <Button onClick={() => updateComplaintStatus(c._id, 'Resolved')} size="sm" className="text-xs h-7 bg-green-600 hover:bg-green-700 text-white">Resolve</Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const StatsCard = ({ title, value, icon }) => (
    <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <h3 className="text-2xl font-bold mt-1">{value}</h3>
            </div>
            <div className="p-3 bg-gray-700 rounded-full">
                {icon}
            </div>
        </CardContent>
    </Card>
);

export default AdminDashboard;
