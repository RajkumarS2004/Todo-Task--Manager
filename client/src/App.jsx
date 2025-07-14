import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/Authcontext';
import { useAuth } from './hooks/useAuth';
import { SocketProvider } from './context/SocketContext';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import DashboardLayout from './layout/Dashboardlayouts';
import Dashboard from './pages/dashboard/Dashboard';
import Tasks from './pages/dashboard/Tasks';
import Analytics from './pages/dashboard/Analytics';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';
import AuthSuccess from './pages/AuthSuccess';
import Notfound from './pages/Notfound';
import LogoutSuccess from './pages/LogoutSuccess';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/signin" element={
                <PublicRoute>
                  <Signin />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } />
              <Route path="/auth-success" element={<AuthSuccess />} />
              
              {/* Dashboard Routes with Layout */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              <Route path="/logout-success" element={<LogoutSuccess />} />
              <Route path="*" element={<Notfound />} />
            </Routes>
            
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
