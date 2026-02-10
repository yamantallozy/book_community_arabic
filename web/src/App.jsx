import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import BookList from './components/BookList';
import BookDetails from './components/BookDetails';
import UserProfile from './components/UserProfile';
import MyBooks from './components/MyBooks';
import AddBook from './components/AddBook';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Register from './components/Register';
import Footer from './components/Footer';
import Events from './components/Events';
import Blog from './components/Blog';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={
                <>
                  <div className="max-w-7xl mx-auto px-4 pt-10 pb-6 text-center">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">مرحباً بكم في مجتمع الكتب العربي</h1>
                    <p className="text-slate-500">اكتشف، ناقش، وشارك قراءاتك المفضلة.</p>
                  </div>
                  <BookList />
                </>
              } />
              <Route path="/events" element={<Events />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="/add-book" element={<AddBook />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/my-books" element={<MyBooks />} />
              <Route path="/profile/:id" element={<UserProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
