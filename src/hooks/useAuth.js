import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuthContext } from '../context/AuthContext'

const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { setAuthData } = useAuthContext()

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user, token } = response.data
      
      // Store user data and token in context
      setAuthData({ user, token })
      
      // Store token in localStorage
      localStorage.setItem('token', token)
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post('/auth/register', { name, email, password })
      const { user, token } = response.data
      
      // Store user data and token in context
      setAuthData({ user, token })
      
      // Store token in localStorage
      localStorage.setItem('token', token)
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Clear context
    setAuthData({ user: null, token: null })
    
    // Remove token from localStorage
    localStorage.removeItem('token')
    
    // Remove authorization header
    delete api.defaults.headers.common['Authorization']
    
    navigate('/login')
  }

  return {
    login,
    register,
    logout,
    loading,
    error
  }
}

export default useAuth