import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewJob from './pages/NewJob';
import AllJobs from './pages/AllJobs';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="new" element={<NewJob />} />
          <Route path="jobs" element={<AllJobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
