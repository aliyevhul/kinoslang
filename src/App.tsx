import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { UserProfileProvider } from './context/UserProfileContext';
import { DictionaryProvider } from './context/DictionaryContext';
import { AchievementProvider } from './context/AchievementContext';
import { StreakProvider } from './context/StreakContext';
import { ModalProvider } from './context/ModalContext';
import Layout from './components/Layout';
import AuthModal from './components/AuthModal';
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

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <UserProfileProvider>
          <DictionaryProvider>
            <StreakProvider>
              <AchievementProvider>
                <ModalProvider>
                  <Layout>
                    <Routes>
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
                    </Routes>
                  </Layout>
                  <AuthModal />
                </ModalProvider>
              </AchievementProvider>
            </StreakProvider>
          </DictionaryProvider>
        </UserProfileProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
