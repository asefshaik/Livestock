import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import BrowseLivestock from './pages/BrowseLivestock'
import LivestockDetails from './pages/LivestockDetails'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/browse" element={<BrowseLivestock />} />
      <Route
        path="/livestock/:id"
        element={
          <ProtectedRoute>
            <LivestockDetails />
          </ProtectedRoute>
        }
      />

      {/* Protected farmer routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute role="farmer">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="text-8xl">🐄</div>
            <h1 className="text-4xl font-black text-gray-900">404 — Page Not Found</h1>
            <p className="text-gray-500">The page you're looking for doesn't exist.</p>
            <a href="/" className="btn-primary mt-2">Go Home</a>
          </div>
        }
      />
    </Routes>
  )
}

export default App
