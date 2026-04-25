'use client'

import { useEffect, useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async () => {
    if (!password.trim()) {
      alert('Lütfen şifre girin')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/admin/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      
      if (data.success) {
        localStorage.setItem('admin_auth', 'true')
        setIsAuthenticated(true)
        setPassword('')
      } else {
        alert('Şifre yanlış!')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
    setLoading(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-4">🔐 Admin Girişi</h1>
          <p className="text-sm text-gray-500 mb-4">Bu alana sadece yetkili kişiler girebilir.</p>
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg mb-4"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? 'Kontrol ediliyor...' : 'Giriş Yap'}
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}