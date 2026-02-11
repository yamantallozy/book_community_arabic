import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
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
import AuthModal from './components/AuthModal';

function App() {
  return (
    <AuthProvider>
      <AuthModal />
      <Router>
        <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
          <Navbar />
          <div className="flex-1 pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={
                <BookList />
              } />
              <Route path="/events" element={<Events />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/books" element={<BookList />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="/add-book" element={<AddBook />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/my-books" element={<MyBooks />} />
              <Route path="/profile/:id" element={<UserProfile />} />
              <Route path="/profile/me" element={<UserProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
          <BottomNav />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App

