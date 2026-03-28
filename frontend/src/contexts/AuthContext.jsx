import { createContext, useContext, useState } from 'react'
import { API_URL } from '../config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [owner, setOwner] = useState(() => {
    const token = localStorage.getItem('owner_token')
    return token ? { token, name: 'Shop Owner' } : null
  })

  const login = async (username, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error('Invalid credentials')
    const data = await res.json()
    localStorage.setItem('owner_token', data.token)
    setOwner(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('owner_token')
    setOwner(null)
  }

  return (
    <AuthContext.Provider value={{ owner, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
