'use client'

import { useState, useEffect } from 'react'

const MAX_CHARS = 200

export default function FeedbackFloatingButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Oturum açmış kullanıcıyı al
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setEmail(data.user.email || '')
          setName(data.user.user_metadata?.full_name || '')
        }
      })
      .catch(() => {})
  }, [])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    if (text.length <= MAX_CHARS) {
      setFeedbackText(text)
    }
  }

  const handleSend = async () => {
    if (!feedbackText.trim()) return
    if (feedbackText.length > MAX_CHARS) {
      alert(`Mesajınız ${MAX_CHARS} karakterden uzun olamaz.`)
      return
    }
    
    setSending(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name || null,
          email: email || null,
          message: feedbackText, 
          url: window.location.href 
        })
      })
      
      if (res.ok) {
        setSent(true)
        setTimeout(() => {
          setIsOpen(false)
          setSent(false)
          setFeedbackText('')
          if (!user) {
            setName('')
            setEmail('')
          }
        }, 2000)
      } else {
        const data = await res.json()
        alert('Hata: ' + (data.error || 'Bir sorun oluştu'))
      }
    } catch (error) {
      alert('Gönderilemedi, lütfen tekrar deneyin')
    }
    setSending(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-green-400 rounded-full px-3 py-2 shadow-md hover:shadow-lg transition-all duration-300 group"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">💬</span>
          <span className="text-xs font-medium text-gray-700 group-hover:text-green-700">Bildir</span>
          <span className="text-xs text-gray-400 hidden sm:inline">|</span>
          <span className="text-xs text-gray-500 hidden sm:inline group-hover:text-green-600">Bir sorun mu var? Hemen bildir</span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-96 animate-in slide-in-from-bottom-2 duration-200">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-1">✅</div>
              <p className="text-green-700 font-medium text-sm">Teşekkürler!</p>
              <p className="text-gray-500 text-xs">İncelenecek ve gerekirse güncellenecek.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📢</span>
                  <span className="font-medium text-gray-800 text-sm">Geri Bildirim</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
              </div>
              
              {/* İsim alanı - oturum açmamışsa göster */}
              {!user && (
                <input
                  type="text"
                  placeholder="Adınız (isteğe bağlı)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg mb-2 focus:outline-none focus:border-green-400"
                />
              )}
              
              {/* E-posta alanı - oturum açmamışsa göster */}
              {!user && (
                <input
                  type="email"
                  placeholder="E-posta (isteğe bağlı)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg mb-2 focus:outline-none focus:border-green-400"
                />
              )}
              
              {/* Oturum açmışsa gösterilen bilgi */}
              {user && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg mb-2">
                  ✅ {user.email} olarak giriş yaptınız
                </div>
              )}
              
              <p className="text-xs text-gray-500 mb-2">
                Sizleri önemsiyoruz, her türlü tavsiye, görüş ve önerilerinize açığız. Bir limit yanlış mı? Güncel değil mi? Lütfen bildirin.
              </p>
              
              <textarea
                placeholder="Hangi ürün/pestisit? Ne olmalı?"
                rows={3}
                value={feedbackText}
                onChange={handleTextChange}
                className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-400"
              />
              
              <div className="flex justify-between items-center mt-1">
                <span className={`text-[10px] ${feedbackText.length > MAX_CHARS ? 'text-red-500' : 'text-gray-400'}`}>
                  {feedbackText.length}/{MAX_CHARS}
                </span>
              </div>
              
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSend}
                  disabled={sending || !feedbackText.trim() || feedbackText.length > MAX_CHARS}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 rounded-lg transition disabled:opacity-50"
                >
                  {sending ? 'Gönderiliyor...' : '📤 Bildir'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-1.5 rounded-lg transition"
                >
                  Vazgeç
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Anonim. En fazla {MAX_CHARS} karakter.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}