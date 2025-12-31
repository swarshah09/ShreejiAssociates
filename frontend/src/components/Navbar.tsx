import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Building2, Shield, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll event to darken navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Projects', path: '/#projects', icon: Building2 },
    { name: 'Admin', path: '/admin', icon: Shield },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 ${
          isScrolled
            ? 'bg-gradient-to-b from-black/95 via-black/90 to-black/85 shadow-lg'
            : 'bg-gradient-to-b from-black/40 via-black/30 to-black/20 shadow-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Burger Menu - Left */}
            <button
              onClick={toggleSidebar}
              className="p-3 rounded-xl text-white hover:bg-white/20 backdrop-blur-sm bg-white/10 border-2 border-white/20 transition-all duration-200 hover:border-premium-gold shadow-lg hover:shadow-premium-gold/50"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Website Name and Logo - Center */}
            <Link to="/" className="flex items-center space-x-0 group">
              <div className="transition-transform duration-300 group-hover:scale-110">
                <img 
                  src="/logosja.png" 
                  alt="Shree Ji Associates Logo" 
                  className="h-20 w-20 md:h-20 md:w-20 object-contain"
                />
              </div>
              <span className="text-lg md:text-xl lg:text-2xl font-bold text-white text-center leading-tight tracking-tight group-hover:text-premium-gold transition-colors duration-300 whitespace-nowrap">
                Shree Ji Associates
              </span>
            </Link>

            {/* Empty space for balance - Right */}
            <div className="w-12"></div>
          </div>
        </div>
      </motion.nav>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/50 z-[60]"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-[60] overflow-y-auto"
            >
              {/* Sidebar Header */}
              <div className="bg-gradient-to-br from-premium-navy via-premium-navy-dark to-premium-navy p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.1)_0%,_transparent_50%)]"></div>
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center">
                      <img 
                        src="/logosja.png" 
                        alt="Shree Ji Associates Logo" 
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg tracking-tight">Shree Ji Associates</h2>
                      <p className="text-premium-gold/80 text-sm font-medium">Premium Real Estate</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors border border-transparent hover:border-premium-gold/30"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="py-6">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        onClick={toggleSidebar}
                        className={`flex items-center space-x-4 px-6 py-4 mx-4 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-premium-gold to-premium-gold-light text-premium-navy shadow-lg shadow-premium-gold/30 font-semibold'
                            : 'text-gray-700 hover:bg-premium-cream hover:text-premium-navy hover:shadow-md'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="font-medium text-lg">{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Sidebar Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gray-50 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Building Dreams, Creating Homes</p>
                  <p className="text-gray-500 text-xs mt-1">© 2024 Shree Ji Associates</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;