import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { DictionaryProvider } from './context/DictionaryContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Movies from './pages/Movies';
import SlangExplorer from './pages/SlangExplorer';
import Dictionary from './pages/Dictionary';
import Flashcards from './pages/Flashcards';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DictionaryProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/slang/:movieId" element={<SlangExplorer />} />
              <Route path="/dictionary" element={<Dictionary />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        </DictionaryProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
