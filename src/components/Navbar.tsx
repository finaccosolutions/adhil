import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mountain, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../public/Va oru trippadikkam.jpg';
export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
            <div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <img
              src="/Va oru trippadikkam.jpg"  // ✅ correct way for public folder
              alt="Va Oru Trippadikkam Logo"
              className="h-10 w-auto rounded-md shadow-sm transition-transform duration-300 group-hover:scale-110"
            />
            <span className="ml-3 text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
              Va Oru Trippadikkam
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => navigate('/')}
              className={`relative px-4 py-2 font-medium transition-all duration-300 group ${
                currentPage === '/'
                  ? 'text-emerald-600'
                  : 'text-gray-700 hover:text-emerald-600'
              }`}
            >
              <span className="relative z-10">Packages</span>
              <div
                className={`absolute inset-0 bg-emerald-50 rounded-lg transition-all duration-300 ${
                  currentPage === '/'
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                }`}
              ></div>
            </button>
            {user && (
              <>
                <button
                  onClick={() => navigate('/bookings')}
                  className={`relative px-4 py-2 font-medium transition-all duration-300 group ${
                    currentPage === '/bookings'
                      ? 'text-emerald-600'
                      : 'text-gray-700 hover:text-emerald-600'
                  }`}
                >
                  <span className="relative z-10">My Bookings</span>
                  <div
                    className={`absolute inset-0 bg-emerald-50 rounded-lg transition-all duration-300 ${
                      currentPage === '/bookings'
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                    }`}
                  ></div>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className={`relative px-4 py-2 font-medium transition-all duration-300 group flex items-center ${
                      currentPage.startsWith('/admin')
                        ? 'text-emerald-600'
                        : 'text-gray-700 hover:text-emerald-600'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-1 relative z-10" />
                    <span className="relative z-10">Admin</span>
                    <div
                      className={`absolute inset-0 bg-emerald-50 rounded-lg transition-all duration-300 ${
                        currentPage.startsWith('/admin')
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                      }`}
                    ></div>
                  </button>
                )}
              </>
            )}
            <div className="ml-4 flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700 text-sm font-medium">
                    {profile?.full_name || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="group flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="group relative px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <User className="h-4 w-4 relative z-10 group-hover:scale-110 transition-transform" />
                  <span className="relative z-10">Sign In</span>
                </button>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-emerald-600 p-2 hover:bg-emerald-50 rounded-lg transition-all duration-300"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 transform rotate-0 transition-transform duration-300" />
              ) : (
                <Menu className="h-6 w-6 transform rotate-0 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            <button
              onClick={() => {
                navigate('/');
                setIsMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                currentPage === '/'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
              }`}
            >
              Packages
            </button>
            {user && (
              <>
                <button
                  onClick={() => {
                    navigate('/bookings');
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    currentPage === '/bookings'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  My Bookings
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      navigate('/admin');
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      currentPage.startsWith('/admin')
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    Admin Dashboard
                  </button>
                )}
              </>
            )}
            {user ? (
              <>
                <div className="px-4 py-3 text-gray-700 text-sm font-medium border-t border-gray-100 mt-2 pt-4">
                  {profile?.full_name || user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-all duration-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-lg hover:shadow-lg font-medium transition-all duration-300"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
