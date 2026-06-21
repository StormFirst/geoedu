import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import Dashboard from './pages/Dashboard'
import SubjectsList from './pages/Subjects/SubjectsList'
import SubjectDetail from './pages/Subjects/SubjectDetail'
import TopicDetail from './pages/Subjects/TopicDetail'
import VideosPage from './pages/Videos/VideosPage'
import MapToolsPage from './pages/MapTools/MapToolsPage'
import GamificationPage from './pages/Gamification/GamificationPage'
import TestsList from './pages/Tests/TestsList'
import TestTaker from './pages/Tests/TestTaker'
import TestResults from './pages/Tests/TestResults'
import AssignmentsList from './pages/Assignments/AssignmentsList'
import MaterialsPage from './pages/Materials/MaterialsPage'
import ProfilePage from './pages/Profile/ProfilePage'
import RatingPage from './pages/Rating/RatingPage'
import CertificatesPage from './pages/Certificates/CertificatesPage'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ManageUsers from './pages/Admin/ManageUsers'
import ManageSubjects from './pages/Admin/ManageSubjects'
import ManageTests from './pages/Admin/ManageTests'
import Statistics from './pages/Admin/Statistics'
import LoadingSpinner from './components/ui/LoadingSpinner'

function ProtectedRoute({ children, roles }) {
  const { currentUser, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!currentUser) return <Navigate to="/login" replace />
  if (roles && !roles.includes(currentUser.role)) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (currentUser) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subjects" element={<SubjectsList />} />
        <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
        <Route path="/subjects/:subjectId/topics/:topicId" element={<TopicDetail />} />
        <Route path="/map-tools" element={<MapToolsPage />} />
        <Route path="/gamification" element={<GamificationPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/tests" element={<TestsList />} />
        <Route path="/tests/:testId" element={<TestTaker />} />
        <Route path="/tests/:testId/results" element={<TestResults />} />
        <Route path="/assignments" element={<AssignmentsList />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/rating" element={<RatingPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['admin', 'teacher']}><Layout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/subjects" element={<ManageSubjects />} />
        <Route path="/admin/tests" element={<ManageTests />} />
        <Route path="/admin/statistics" element={<Statistics />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
