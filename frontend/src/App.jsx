import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DarkModeProvider } from './context/DarkModeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import UsersPage from './pages/UsersPage'
import PlaceholderPage from './pages/PlaceholderPage'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminRoute from './components/AdminRoute'
import Chatbot from './components/Chatbot'
import RoleRoute from './components/RoleRoute'
import CustomersPage from './pages/CustomersPage'
import PricingPage from './pages/PricingPage'
import ExpensesPage from './pages/ExpensesPage'

function App() {
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <AuthProvider>
          <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected Routes wrapped in Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Layout>
                  <CustomersPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pricing"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['manager', 'admin', 'superadmin']}>
                  <Layout>
                    <PricingPage />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['manager', 'admin', 'superadmin']}>
                  <Layout>
                    <ExpensesPage />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />


          {/* Placeholder Routes for Regular Users */}
          {['register-student', 'students', 'review-incidents', 'rewards', 'school-structure'].map(path => (
            <Route
              key={path}
              path={`/${path}`}
              element={
                <ProtectedRoute>
                  <Layout>
                    <PlaceholderPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
          ))}

          {/* Admin-only Routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          {['analytics'].map(path => (
            <Route
              key={path}
              path={`/${path}`}
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <Layout>
                      <PlaceholderPage />
                    </Layout>
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
          ))}
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Chatbot />
        </AuthProvider>
      </DarkModeProvider>
    </BrowserRouter>
  )
}

export default App
