import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Books = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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
            price: "$28.99"
        },
        {
            id: 2,
            title: "Home",
            author: "Lisa Allen-Agostini",
            publisher: "Pantheon",
            edition: "First Edition",
            cover: "https://images.squarespace-cdn.com/content/v1/5f5f3d9b64b19d7246cffc84/1612124886755-A8Y8RI8TGGSG92DH22UP/HomeHome.jpg",
            date: "2023-05-02",
            price: "$27.00"
        },
        {
            id: 3,
            title: "Walk Into The Shadow",
            author: "Estelle Darcy",
            publisher: "Bloom Books",
            edition: "First Edition",
            cover: "https://marketplace.canva.com/EAFfSnGl7II/2/0/1003w/canva-elegant-dark-woods-fantasy-photo-book-cover-vAt8PH1CmqQ.jpg",
            date: "2023-02-21",
            price: "$19.99"
        },
        {
            id: 4,
            title: "The Lord Of The Rings",
            author: "JRR Tolkien",
            publisher: "Sourcebooks Fire",
            edition: "Reprint",
            cover: "https://api.chulabook.com/images/pid-162536.jpg",
            date: "2023-03-01",
            price: "$16.99"
        },
        {
            id: 5,
            title: "Jurassic Park",
            author: "Michael Crichton",
            publisher: "Little Brown Company",
            edition: "First Edition",
            cover: "https://framerusercontent.com/images/DVJyYKFZ5hFwtkn0zEfEntl7sKs.jpeg",
            date: "2023-08-08",
            price: "$30.00"
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
                        <h1 className="text-2xl font-bold text-gray-800">{bookType} Books</h1>
                        <button
                            className="px-4 py-2 bg-[#2E6BAA] text-white rounded-md hover:bg-opacity-90 transition-colors duration-200"
                        >
                            Add New Book
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E6BAA]"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                            {books.map((book) => (
                                <div key={book.id} className="bg-gray-100 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
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
                                            <p><span className="font-medium">Book ID:</span> {book.id}</p>
                                            <p><span className="font-medium">Author:</span> {book.author}</p>
                                            <p><span className="font-medium">Publisher:</span> {book.publisher}</p>
                                            <p><span className="font-medium">Edition:</span> {book.edition}</p>
                                            <p><span className="font-medium">Date:</span> {book.date}</p>
                                            <p><span className="font-medium">Price:</span> {book.price}</p>
                                        </div>
                                        <div className="mt-4 flex justify-end space-x-2">
                                            <button className="px-3 py-1 text-sm text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white rounded-md border border-[#2E6BAA] transition-colors duration-200">
                                                Edit
                                            </button>
                                            <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-600 hover:text-white rounded-md border border-red-600 transition-colors duration-200">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Books;