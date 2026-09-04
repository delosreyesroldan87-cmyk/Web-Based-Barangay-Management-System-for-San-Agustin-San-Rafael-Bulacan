import { Toaster } from "@/components/ui/toaster"
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Residents from '@/pages/Residents';
import Certificates from '@/pages/Certificates';
import Blotter from '@/pages/Blotter';
import Officials from '@/pages/Officials';
import Announcements from '@/pages/Announcements';
import PageNotFound from './lib/PageNotFound';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Main app with Layout - tinanggal ko muna AuthProvider para gumana */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/residents" element={<Residents />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/blotter" element={<Blotter />} />
          <Route path="/officials" element={<Officials />} />
          <Route path="/announcements" element={<Announcements />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App
