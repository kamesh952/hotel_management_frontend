import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    user: null,
    token: null
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const decoded = jwtDecode(token)
          setAuthData({ user: decoded, token })
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Optional: Validate token with backend
          await api.get('/auth/validate')
        } catch (error) {
          console.error('Invalid token:', error)
          logout()
        }
      }
      setLoading(false)
    }
    
    initializeAuth()
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await api.post('/login', { email, password })
      const { user, token } = response.data
      
      localStorage.setItem('token', token)
      setAuthData({ user, token })
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    try {
      const response = await api.post('/register', { name, email, password })
      const { user, token } = response.data
      
      localStorage.setItem('token', token)
      setAuthData({ user, token })
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setAuthData({ user: null, token: null })
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{
      user: authData.user,
      token: authData.token,
      login,
      register,
      logout,
      loading,
      isAuthenticated: !!authData.token
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}