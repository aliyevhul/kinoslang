import { Routes, Route, Outlet } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { MoviesProvider } from './context/MoviesContext';
import { UserProfileProvider } from './context/UserProfileContext';
import { DictionaryProvider } from './context/DictionaryContext';
import { AchievementProvider } from './context/AchievementContext';
import { StreakProvider } from './context/StreakContext';
import { ModalProvider } from './context/ModalContext';
import Layout from './components/Layout';
import AuthModal from './components/AuthModal';
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import { Toaster } from './components/ui/sonner';
import Home from './pages/Home';
import Movies from './pages/Movies';
import SlangExplorer from './pages/SlangExplorer';
import Dictionary from './pages/Dictionary';
import Flashcards from './pages/Flashcards';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';
import PublicProfile from './pages/PublicProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMovies from './pages/admin/AdminMovies';
import AdminMovieEdit from './pages/admin/AdminMovieEdit';

function SiteLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AdminProvider>
          <MoviesProvider>
            <UserProfileProvider>
              <DictionaryProvider>
                <StreakProvider>
                  <AchievementProvider>
                    <ModalProvider>
                      <Routes>
                        <Route
                          path="/admin"
                          element={
                            <AdminRoute>
                              <AdminLayout />
                            </AdminRoute>
                          }
                        >
                          <Route index element={<AdminDashboard />} />
                          <Route path="movies" element={<AdminMovies />} />
                          <Route path="movies/:movieId" element={<AdminMovieEdit />} />
                        </Route>

                        <Route element={<SiteLayout />}>
                          <Route path="/" element={<Home />} />
                          <Route path="/movies" element={<Movies />} />
                          <Route path="/slang/:movieId" element={<SlangExplorer />} />
                          <Route path="/dictionary" element={<Dictionary />} />
                          <Route path="/flashcards" element={<Flashcards />} />
                          <Route path="/leaderboard" element={<Leaderboard />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/achievements" element={<Achievements />} />
                          <Route path="/user/:userId" element={<PublicProfile />} />
                        </Route>
                      </Routes>
                      <AuthModal />
                      <Toaster theme="dark" richColors position="top-right" />
                    </ModalProvider>
                  </AchievementProvider>
                </StreakProvider>
              </DictionaryProvider>
            </UserProfileProvider>
          </MoviesProvider>
        </AdminProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
