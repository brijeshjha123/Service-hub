import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12 mt-auto border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">ServiceHub</h3>
                        <p className="text-gray-400 text-sm">Connecting you with top local professionals for all your home service needs.</p>
                    </div>

                    {/* Quick Link - Services */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Services</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/services?category=cleaning" className="hover:text-white transition-colors">Cleaning</Link></li>
                            <li><Link to="/services?category=repair" className="hover:text-white transition-colors">Repair</Link></li>
                            <li><Link to="/services?category=painting" className="hover:text-white transition-colors">Painting</Link></li>
                            <li><Link to="/services?category=salon" className="hover:text-white transition-colors">Salon & Spa</Link></li>
                        </ul>
                    </div>

                    {/* Quick Link - Company */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Contact or Social */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>help@servicehub.com</li>
                            <li>+1 (800) 123-4567</li>
                            <li className="pt-2 flex gap-4">
                                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 hover:text-blue-500 transition-all">
                                    <Facebook className="h-4 w-4" />
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 hover:text-pink-500 transition-all">
                                    <Instagram className="h-4 w-4" />
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 hover:text-blue-400 transition-all">
                                    <Linkedin className="h-4 w-4" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-xs">
                    &copy; {new Date().getFullYear()} ServiceHub. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
