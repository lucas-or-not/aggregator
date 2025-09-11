import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { parseApiError } from './services/apiError'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Article from './pages/Article'
import Search from './pages/Search'
import Saved from './pages/Saved'
import Preferences from './pages/Preferences'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: (failureCount, error: any) => {
        const { status } = parseApiError(error)
        // don't retry on 4xx except 429
        if (status && status >= 400 && status < 500 && status !== 429) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/article/:id" element={<Article />} />
                <Route path="/search" element={<Search />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/preferences" element={<Preferences />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
