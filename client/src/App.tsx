import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { Footer } from '@/components/Footer';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { useSocket } from '@/hooks/useSocket';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { FeedPage } from '@/pages/FeedPage';
import { ReportIssuePage } from '@/pages/ReportIssuePage';
import { IssueDetailPage } from '@/pages/IssueDetailPage';
import { MapPage } from '@/pages/MapPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { NGODashboard } from '@/pages/NGODashboard';
import { AuthorityDashboard } from '@/pages/AuthorityDashboard';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { AnonymousTrackPage } from '@/pages/AnonymousTrackPage';
import { DeveloperDashboard } from '@/pages/DeveloperDashboard';
import { AIShowcasePage } from '@/pages/AIShowcasePage';

import '@/i18n';

const queryClient = new QueryClient();

function SocketInitializer() {
  useSocket();
  return null;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <SocketInitializer />
        <div className="min-h-screen bg-bg text-text-primary flex flex-col font-sans">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/report" element={<ReportIssuePage />} />
              <Route path="/issues/:id" element={<IssueDetailPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/ngo" element={<NGODashboard />} />
              <Route path="/authority" element={<AuthorityDashboard />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/track" element={<AnonymousTrackPage />} />
              <Route path="/ai" element={<AIShowcasePage />} />
              <Route path="/developer" element={<DeveloperDashboard />} />
            </Routes>
          </main>

          <Footer />
          <MobileNav />
          <ChatbotWidget />
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111E17',
              color: '#E8F5EE',
              border: '1px solid rgba(34, 166, 106, 0.3)',
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
