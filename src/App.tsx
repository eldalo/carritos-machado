import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Schedule from './pages/Schedule'
import Participants from './pages/Participants'
import BlockManager from './pages/BlockManager'
import Points from './pages/Points'
import PublicSchedule from './pages/PublicSchedule'
import { ThemeProvider } from './context/ThemeContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/publico" element={<PublicSchedule />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/horarios" element={<Schedule />} />
              <Route
                path="/participantes"
                element={
                  <RoleRoute permission="participants:view" fallback="/horarios">
                    <Participants />
                  </RoleRoute>
                }
              />
              <Route
                path="/bloques"
                element={
                  <RoleRoute permission="blocks:view" fallback="/horarios">
                    <BlockManager />
                  </RoleRoute>
                }
              />
              <Route
                path="/puntos"
                element={
                  <RoleRoute permission="points:view" fallback="/horarios">
                    <Points />
                  </RoleRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
    </ThemeProvider>
  )
}
