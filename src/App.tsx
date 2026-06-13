import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { DictionaryProvider } from './context/DictionaryContext';
import Layout from './components/Layout';
import Home from './pages/Home';

const Movies = () => (
  <div className="min-h-[100dvh] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white mb-4">Movies</h1>
      <p className="text-[#999999]">Coming soon...</p>
    </div>
  </div>
);

const SlangExplorer = () => (
  <div className="min-h-[100dvh] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white mb-4">Slang Explorer</h1>
      <p className="text-[#999999]">Coming soon...</p>
    </div>
  </div>
);

const Dictionary = () => (
  <div className="min-h-[100dvh] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white mb-4">Dictionary</h1>
      <p className="text-[#999999]">Coming soon...</p>
    </div>
  </div>
);

const Flashcards = () => (
  <div className="min-h-[100dvh] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white mb-4">Flashcards</h1>
      <p className="text-[#999999]">Coming soon...</p>
    </div>
  </div>
);

const Leaderboard = () => (
  <div className="min-h-[100dvh] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white mb-4">Leaderboard</h1>
      <p className="text-[#999999]">Coming soon...</p>
    </div>
  </div>
);

const Profile = () => (
  <div className="min-h-[100dvh] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white mb-4">Profile</h1>
      <p className="text-[#999999]">Coming soon...</p>
    </div>
  </div>
);

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
