import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/common/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BranchesPage from './pages/BranchesPage';
import TasksPage from './pages/TasksPage';
import InventoryPage from './pages/InventoryPage';
import VaultPage from './pages/VaultPage';

function App() {
  const token = localStorage.getItem('token');
  
  // Componente para rutas protegidas SIN navbar (Dashboard)
  const ProtectedRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" />;
    return <>{children}</>;
  };
  
  // Componente para rutas protegidas CON navbar (módulos)
  const ProtectedRouteWithNavbar = ({ children }) => {
    if (!token) return <Navigate to="/login" />;
    return (
      <>
        <Navbar />
        {children}
      </>
    );
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/branches" element={
              <ProtectedRouteWithNavbar>
                <BranchesPage />
              </ProtectedRouteWithNavbar>
            } />
            <Route path="/tasks" element={
              <ProtectedRouteWithNavbar>
                <TasksPage />
              </ProtectedRouteWithNavbar>
            } />
            <Route path="/inventory" element={
              <ProtectedRouteWithNavbar>
                <InventoryPage />
              </ProtectedRouteWithNavbar>
            } />
            <Route path="/vault" element={
              <ProtectedRouteWithNavbar>
                <VaultPage />
              </ProtectedRouteWithNavbar>
            } />
            {/* Próximos módulos */}
            <Route path="/maintenance" element={
              <ProtectedRouteWithNavbar>
                <div className="p-8 text-slate-500 dark:text-slate-400">Módulo Mantenimiento - Próximamente</div>
              </ProtectedRouteWithNavbar>
            } />
            <Route path="/remote" element={
              <ProtectedRouteWithNavbar>
                <div className="p-8 text-slate-500 dark:text-slate-400">Módulo Remote Access - Próximamente</div>
              </ProtectedRouteWithNavbar>
            } />
            <Route path="/snippets" element={
              <ProtectedRouteWithNavbar>
                <div className="p-8 text-slate-500 dark:text-slate-400">Módulo Snippets - Próximamente</div>
              </ProtectedRouteWithNavbar>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;