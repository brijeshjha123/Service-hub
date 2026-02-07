import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { categories } from '../data/services';
import ServiceCard from '../components/ServiceCard';
import { Button } from '../components/ui/Button';
import { getSmartSearchResults } from '../lib/gemini';
import { Sparkles, Loader2 } from 'lucide-react';

const Services = () => {
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get('category');
    const searchQuery = searchParams.get('search');
    const navigate = useNavigate();

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiActive, setAiActive] = useState(false);

    const category = categories.find(c => c.id === categoryId);
    const allServices = categories.flatMap(c => c.services);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            setAiActive(false);

            if (categoryId) {
                // Category Filter
                setServices(category ? category.services : []);
            } else if (searchQuery) {
                // AI Smart Search
                setAiActive(true); // Assuming we are using AI
                const results = await getSmartSearchResults(searchQuery, allServices);
                setServices(results);
            } else {
                // Show All
                setServices(allServices);
            }
            setLoading(false);
        };

        fetchServices();
    }, [categoryId, searchQuery]);

    const title = category
        ? category.name
        : searchQuery
            ? `Search Results for "${searchQuery}"`
            : 'All Services';

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                            {title}
                            {aiActive && <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" title="AI Powered" />}
                        </h1>
                        <p className="text-gray-500 mt-2">Professional services at your doorstep.</p>
                    </div>

                    {/* Category Filter Pills (if showing all or search) */}
                    {!categoryId && (
                        <div className="hidden md:flex gap-2 flex-wrap">
                            {categories.map(cat => (
                                <Button key={cat.id} variant="outline" size="sm" onClick={() => navigate(`/services?category=${cat.id}`)}>
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.length > 0 ? (
                            services.map((service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                No services found matching your criteria.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Services;
