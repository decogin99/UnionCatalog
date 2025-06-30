import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA]">
            {/* Navbar */}
            <nav className="fixed w-full bg-white/5 backdrop-blur-lg z-50 border-b border-white/10">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="text-3xl">📚</span>
                            Union Catalog
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-6">
                            <Link to="/Login" className="text-white hover:text-gray-200 transition-colors">
                                Sign In
                            </Link>
                            <Link to="/Signup"
                                className="px-6 py-2 bg-white text-[#0C2D57] rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 hover:shadow-lg hover:shadow-white/20">
                                Sign Up
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-white p-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} pb-6 pt-2`}>
                        <div className="flex flex-col space-y-4">
                            <Link to="/Login" className="text-white hover:text-gray-200 transition-colors">
                                Sign In
                            </Link>
                            <Link to="/Signup" className="px-4 py-2 bg-white text-[#0C2D57] rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300">
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className={`pt-10 opacity-0 transition-all duration-1000 ${isVisible ? 'opacity-100' : ''}`}>
                <div className="container mx-auto px-4 py-16 lg:py-24">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="flex-1 text-center lg:text-left">
                            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                Your Digital Library
                                <span className="block text-3xl lg:text-5xl mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                                    Management Solution
                                </span>
                            </h1>
                            <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                                Streamline your library operations with our comprehensive catalog system.
                                Manage books, track inventory, and serve your readers better.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link to="/Signup"
                                    className="px-8 py-4 bg-white text-[#0C2D57] rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-white/20">
                                    Get Started Free
                                </Link>
                                <Link to="#features"
                                    className="px-8 py-4 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-all duration-300">
                                    Learn More
                                </Link>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <div className="w-full h-[500px] bg-white/10 rounded-2xl backdrop-blur-lg p-8 transform hover:scale-105 transition-all duration-300 shadow-xl shadow-black/20">
                                <div className="grid grid-cols-2 gap-6 h-full">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i}
                                            className={`bg-white/20 rounded-xl animate-pulse transition-all duration-500 hover:bg-white/30`}
                                            style={{ animationDelay: `${i * 200}ms` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white/5 backdrop-blur-lg py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, index) => (
                            <div key={index} className="p-6 rounded-xl bg-white/5 backdrop-blur-lg">
                                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                                <div className="text-sm text-gray-300">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-4">
                        Powerful Features
                    </h2>
                    <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
                        Everything you need to manage your library efficiently in one place
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index}
                                className="bg-white/10 rounded-2xl p-8 backdrop-blur-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 group">
                                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-4 py-16 lg:py-24 text-center">
                <div className="bg-white/10 rounded-2xl p-12 backdrop-blur-lg max-w-4xl mx-auto">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Library?
                    </h2>
                    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of libraries already using Union Catalog to streamline their operations
                        and provide better service to their readers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/Signup"
                            className="px-8 py-4 bg-white text-[#0C2D57] rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105">
                            Start Free Now
                        </Link>
                        <Link to="/Login"
                            className="px-8 py-4 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-all duration-300">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-[#0C2D57]/50 backdrop-blur-lg py-12 border-t border-white/10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="text-white font-semibold mb-4">About</h3>
                            <p className="text-gray-300 text-sm">Union Catalog is your comprehensive digital library management solution.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Support</h3>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="#" className="text-gray-300 hover:text-white">Help Center</Link></li>
                                <li><Link to="#" className="text-gray-300 hover:text-white">Documentation</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Contact</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="text-gray-300">Email: info@unioncatalog.com</li>
                                <li className="text-gray-300">Phone: (123) 456-7890</li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-center text-gray-400 text-sm pt-8 border-t border-white/10">
                        <p>&copy; 2025 Union Catalog. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Stats data
const stats = [
    { value: '10K+', label: 'Active Libraries' },
    { value: '1M+', label: 'Books Cataloged' },
    { value: '50K+', label: 'Daily Users' },
    { value: '99.9%', label: 'Uptime' }
];

// Feature data
const features = [
    {
        icon: '📚',
        title: 'Smart Cataloging',
        description: 'Automatically organize and categorize your books with our intelligent cataloging system.'
    },
    {
        icon: '🔍',
        title: 'Advanced Search',
        description: 'Find any book instantly with powerful search filters and real-time suggestions.'
    },
    {
        icon: '📱',
        title: 'Multi-platform Access',
        description: 'Access your library from any device with our responsive web and mobile apps.'
    },
    {
        icon: '⚡',
        title: 'Real-time Updates',
        description: 'Stay informed with instant notifications about your library activities and changes.'
    },
    {
        icon: '📊',
        title: 'Detailed Analytics',
        description: 'Make data-driven decisions with comprehensive reports and usage statistics.'
    },
    {
        icon: '🔐',
        title: 'Enterprise Security',
        description: 'Protect your data with advanced encryption and role-based access control.'
    }
];

export default Landing;
