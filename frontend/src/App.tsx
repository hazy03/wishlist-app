import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { WishlistPage } from './pages/Wishlist';
import { PublicWishlist } from './pages/PublicWishlist';
import { Friends } from './pages/Friends';
import { Profile } from './pages/Profile';
import { OAuthCallback } from './pages/OAuthCallback';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useLanguageStore } from './store/languageStore';

function App() {
  const { checkAuth } = useAuthStore();
  const { initTheme } = useThemeStore();
  const { initLanguage } = useLanguageStore();

  useEffect(() => {
    checkAuth();
    initTheme();
    initLanguage();
  }, [checkAuth, initTheme, initLanguage]);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist/:slug"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <Friends />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/w/:slug" element={<PublicWishlist />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

