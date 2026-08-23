import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/ui/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import MapPage from './pages/MapPage'
import ReportPage from './pages/ReportPage'
import IssueDetailPage from './pages/IssueDetailPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import AnalyticsPage from './pages/AnalyticsPage'
import NGODashboard from './pages/NGODashboard'
import AuthorityDashboard from './pages/AuthorityDashboard'
import NotificationsPage from './pages/NotificationsPage'
import TrackAnonymousPage from './pages/TrackAnonymousPage'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore()
  return user ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  const { user } = useAuthStore()
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/feed" /> : <LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/track" element={<TrackAnonymousPage />} />
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/issues/:id" element={<IssueDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/ngo" element={<NGODashboard />} />
        <Route path="/authority" element={<AuthorityDashboard />} />
      </Route>
    </Routes>
  )
}
