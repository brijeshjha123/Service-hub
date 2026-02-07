import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Star, Clock } from 'lucide-react';

const ServiceCard = ({ service }) => {
    const navigate = useNavigate();

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow border-none shadow-sm flex flex-col h-full bg-white">
            <div className="h-48 overflow-hidden relative group">
                <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold shadow-sm">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    {service.rating} ({service.reviews})
                </div>
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="text-xl">{service.name}</CardTitle>
                <CardDescription className="line-clamp-2">{service.description}</CardDescription>
            </CardHeader>

            <CardContent className="py-2 flex-grow">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" /> 45 - 60 mins • ₹{service.price}
                </div>
                <ul className="mt-3 space-y-1 text-sm text-gray-600 list-disc list-inside">
                    <li>Verified Professional</li>
                    <li>Contactless Service</li>
                </ul>
            </CardContent>

            <CardFooter className="pt-2 pb-6 border-t bg-gray-50/50">
                <Button className="w-full" size="lg" onClick={() => navigate(`/book/${service.id}`)}>
                    Book Now
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ServiceCard;
