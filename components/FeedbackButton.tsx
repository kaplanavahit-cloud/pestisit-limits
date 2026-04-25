// components/FeedbackButton.tsx
'use client'

import { useState } from 'react'

export default function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        url: window.location.href
      })
    })
    
    if (res.ok) {
      alert('Geri bildiriminiz için teşekkürler!')
      setOpen(false)
      setForm({ name: '', email: '', message: '' })
    } else {
      alert('Bir hata oluştu, lütfen tekrar deneyin.')
    }
    setLoading(false)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-green-700 text-white p-4 rounded-full shadow-lg hover:bg-green-800 z-50"
      >
        💬
      </button>

      {/* Modal Popup */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Geri Bildirim Gönder</h2>
              <button onClick={() => setOpen(false)} className="text-gray-500 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Adınız (isteğe bağlı)"
                className="w-full p-2 border rounded"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
              <input
                type="email"
                placeholder="E-posta (isteğe bağlı)"
                className="w-full p-2 border rounded"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
              <textarea
                placeholder="Mesajınız / Şikayetiniz / Öneriniz"
                required
                className="w-full p-2 border rounded h-28"
                value={form.message}
                onChange={(e) => setForm({...form, message: e.target.value})}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 disabled:opacity-50"
              >
                {loading ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}