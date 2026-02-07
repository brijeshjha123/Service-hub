import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, ShieldCheck, Users, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { categories } from '../data/services';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();

    // Unified Roles: Everyone can stay on Home or choose their dash manually
    /*
    useEffect(() => {
        if (currentUser && userProfile) {
            if (userProfile.role === 'provider') {
                navigate('/pro');
            } else {
                navigate('/dashboard');
            }
        }
    }, [currentUser, userProfile, navigate]);
    */

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative w-full pt-10 pb-20 px-6 md:px-16 lg:px-24">

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Text + Service Selector */}
                    <div className="space-y-10 z-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>Trusted by 12M+ Customers</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                                Home services at your <span className="text-primary italic">doorstep</span>.
                            </h1>
                        </div>

                        {/* "What are you looking for?" Box */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                            <h3 className="text-xl font-semibold mb-6 text-gray-800">What are you looking for?</h3>

                            {/* Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {categories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        onClick={() => navigate(`/services?category=${cat.id}`)}
                                        className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 rounded-xl transition-all cursor-pointer group"
                                    >
                                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                                        <span className="text-xs font-semibold text-center text-gray-700 leading-tight">{cat.name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Search Bar inside the box for quick access */}
                            <div className="mt-8 relative">
                                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    className="pl-10 h-12 bg-gray-50 border-gray-200"
                                    placeholder="Search for 'Kitchen Cleaning', 'AC Repair'..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            navigate(`/services?search=${e.target.value}`);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Trust Stats */}
                        <div className="flex gap-8 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Star className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold">4.8</p>
                                    <p className="text-xs text-gray-500">Service Rating</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold">12M+</p>
                                    <p className="text-xs text-gray-500">Customers Globally</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Collage (3 Images) */}
                    <div className="hidden lg:grid grid-cols-2 gap-4 h-[600px]">
                        {/* Large Left Image */}
                        <div className="row-span-2 rounded-2xl overflow-hidden shadow-2xl relative">
                            <img
                                src={categories[1].services[0].image}
                                alt="Salon"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                                <p className="text-white font-bold text-lg">Salon & Grooming</p>
                            </div>
                        </div>

                        {/* Top Right Image */}
                        <div className="rounded-2xl overflow-hidden shadow-xl relative">
                            <img
                                src={categories[2].services[0].image}
                                alt="Repair"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        {/* Bottom Right Image */}
                        <div className="rounded-2xl overflow-hidden shadow-xl relative">
                            <img
                                src={categories[0].services[2].image}
                                alt="Cleaning"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                                <p className="text-white font-bold text-lg">Deep Cleaning</p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Why Choose ServiceHub - REVERTED TO SECOND SECTION */}
            <section className="py-16 px-6 md:px-16 lg:px-24 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-4xl font-bold">Why choose ServiceHub?</h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <ShieldCheck className="h-8 w-8 text-primary shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-bold">Verified Professionals</h3>
                                        <p className="text-gray-400">Background checked and trained partners.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Clock className="h-8 w-8 text-primary shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-bold">On-Time Service</h3>
                                        <p className="text-gray-400">We value your time and ensure punctuality.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Users className="h-8 w-8 text-primary shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-bold">Transparent Pricing</h3>
                                        <p className="text-gray-400">No hidden costs. Pay what you see.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6">
                                <Button
                                    size="lg"
                                    className="bg-primary text-white hover:bg-primary/90"
                                    onClick={() => navigate('/signup?role=provider')}
                                >
                                    Become a Service Partner
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            {/* Abstract Illustration */}
                            <div className="h-96 w-full bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center p-8">
                                <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 max-w-xs text-center">
                                    <p className="text-2xl font-bold mb-2">4.8/5</p>
                                    <div className="flex justify-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                                    </div>
                                    <p className="text-sm">Based on 12,000+ reviews</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Services Section - MOVED DOWN */}
            <section className="py-16 px-6 md:px-16 lg:px-24 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-gray-900">Most Popular Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            categories[0].services[0], // Bathroom Cleaning
                            categories[2].services[0], // AC Repair
                            categories[2].services[1], // Electrician
                            categories[1].services[0]  // Salon Men
                        ].map((service) => (
                            <Card key={service.id} className="cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/services')}>
                                <div className="h-40 overflow-hidden rounded-t-lg">
                                    <img src={service.image} alt={service.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-lg truncate">{service.name}</h3>
                                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span>{service.rating} ({service.reviews})</span>
                                    </div>
                                    <p className="mt-2 font-bold">₹{service.price}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 px-6 md:px-16 lg:px-24 bg-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-12 text-gray-900">How it works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Choose a Service", desc: "Select from our wide range of services.", icon: "👉" },
                            { title: "Book a Slot", desc: "Pick a date and time that suits you.", icon: "📅" },
                            { title: "Relax & Enjoy", desc: "Our professional will serve you at your doorstep.", icon: "😊" }
                        ].map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="text-5xl">{step.icon}</div>
                                <h3 className="text-xl font-bold">{step.title}</h3>
                                <p className="text-gray-500">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Promotional Banner */}
            <section className="px-6 md:px-24 pb-16">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-10 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Get 20% off your first booking</h2>
                        <p className="text-gray-300 mb-6">Use code <span className="font-mono bg-white/20 px-2 py-1 rounded">NEW20</span> at checkout.</p>
                        <Button size="lg" className="bg-white text-black hover:bg-gray-200 border-none" onClick={() => navigate('/services')}>Book Now</Button>
                    </div>
                    <div className="mt-8 md:mt-0">
                        {/* Abstract graphic */}
                        <div className="h-32 w-32 bg-primary/20 rounded-full blur-2xl relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ShieldCheck className="h-16 w-16 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
