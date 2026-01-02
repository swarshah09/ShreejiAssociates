import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

// Lazy load route components for code splitting (reduces initial bundle size)
const Home = lazy(() => import('./pages/Home'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const PlotCanvasDemo = lazy(() => import('./components/PlotCanvasDemo'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Navbar />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-premium-gold mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                {/* Option A demo: Konva-based interactive layout for a single project */}
                <Route path="/demo/plots" element={<PlotCanvasDemo />} />
              </Routes>
            </Suspense>
          </motion.main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;