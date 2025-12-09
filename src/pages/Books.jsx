import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { FiGrid, FiList } from 'react-icons/fi';

const Books = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const location = useLocation();

    // Determine book type from URL parameters
    const bookType = location.pathname.includes('English') ? 'English' : 'Myanmar';

    // Mock data with real books
    const mockBooks = [
        {
            id: 1,
            title: "Beyond The Ocean Door",
            author: "Amisha Sathi",
            publisher: "Farrar, Straus and Giroux",
            edition: "First Edition",
            cover: "https://blog-cdn.reedsy.com/directories/gallery/248/large_65b0ae90317f7596d6f95bfdd6131398.jpg",
            date: "2023-08-24",
        },
        {
            id: 2,
            title: "Home",
            author: "Lisa Allen-Agostini",
            publisher: "Pantheon",
            edition: "First Edition",
            cover: "https://images.squarespace-cdn.com/content/v1/5f5f3d9b64b19d7246cffc84/1612124886755-A8Y8RI8TGGSG92DH22UP/HomeHome.jpg",
            date: "2023-05-02",
        },
        {
            id: 3,
            title: "Walk Into The Shadow",
            author: "Estelle Darcy",
            publisher: "Bloom Books",
            edition: "First Edition",
            cover: "https://marketplace.canva.com/EAFfSnGl7II/2/0/1003w/canva-elegant-dark-woods-fantasy-photo-book-cover-vAt8PH1CmqQ.jpg",
            date: "2023-02-21",
        },
        {
            id: 4,
            title: "The Lord Of The Rings",
            author: "JRR Tolkien",
            publisher: "Sourcebooks Fire",
            edition: "Reprint",
            cover: "https://api.chulabook.com/images/pid-162536.jpg",
            date: "2023-03-01",
        },
        {
            id: 5,
            title: "Jurassic Park",
            author: "Michael Crichton",
            publisher: "Little Brown Company",
            edition: "First Edition",
            cover: "https://framerusercontent.com/images/DVJyYKFZ5hFwtkn0zEfEntl7sKs.jpeg",
            date: "2023-08-08",
        }
    ];

    useEffect(() => {
        // Simulate API call
        setIsLoading(true);
        setTimeout(() => {
            setBooks(mockBooks);
            setIsLoading(false);
        }, 1000);
    }, [bookType]);

    return (
        <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
                <div className="p-4 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">{bookType} Books</h1>
                        <div className="flex items-center gap-3">
                            <div className="inline-flex items-center bg-white/95 rounded-xl ring-1 ring-gray-200 overflow-hidden shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-2 text-sm flex items-center gap-2 ${viewMode==='grid' ? 'bg-[#2E6BAA] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <FiGrid size={16} /> Grid
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-2 text-sm flex items-center gap-2 ${viewMode==='list' ? 'bg-[#2E6BAA] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <FiList size={16} /> List
                                </button>
                            </div>
                            <button
                                className="px-4 py-2 bg-[#2E6BAA] text-white rounded-md hover:bg-opacity-90 transition-colors duration-200"
                            >
                                Add New Book
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E6BAA]"></div>
                        </div>
                    ) : (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                                {books.map((book) => (
                                    <div key={book.id} className="bg-white/95 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col ring-1 ring-gray-100">
                                        <div className="relative pt-[100%] w-full max-w-[200px] mx-auto overflow-hidden">
                                            <img
                                                src={book.cover}
                                                alt={book.title}
                                                loading='lazy'
                                                className="absolute inset-0 w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
                                            </div>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <p><span className="font-medium">Author:</span> {book.author}</p>
                                                <p><span className="font-medium">Publisher:</span> {book.publisher}</p>
                                                <p><span className="font-medium">Edition:</span> {book.edition}</p>
                                                <p><span className="font-medium">Date:</span> {book.date}</p>
                                            </div>
                                            <div className="mt-4 flex justify-end space-x-2">
                                                <button className="px-3 py-1 text-sm text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white rounded-md border border-[#2E6BAA] transition-colors duration-200">Edit</button>
                                                <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-600 hover:text-white rounded-md border border-red-600 transition-colors duration-200">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/95 rounded-2xl shadow-xl ring-1 ring-gray-100">
                                <div className="overflow-x-auto">
                                    <table className="min-w-[900px] w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cover</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Author</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Publisher</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Edition</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                                                <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {books.map((book) => (
                                                <tr key={book.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <img src={book.cover} alt={book.title} className="w-10 h-14 object-cover rounded-md" />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-gray-900">{book.title}</div>
                                                        <div className="text-xs text-gray-500">ID: {book.id}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700">{book.author}</td>
                                                    <td className="px-4 py-3 text-gray-700">{book.publisher}</td>
                                                    <td className="px-4 py-3 text-gray-700">{book.edition}</td>
                                                    <td className="px-4 py-3 text-gray-700">{book.date}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <button className="px-3 py-1 text-sm text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white rounded-md border border-[#2E6BAA]">Edit</button>
                                                            <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-600 hover:text-white rounded-md border border-red-600">Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Books;