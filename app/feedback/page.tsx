'use client'
import { useState } from 'react'

export default function FeedbackPage() {
    const [form, setForm] = useState({ name: '', email: '', message: '' })
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const res = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                url: window.location.href
            })
        })

        const data = await res.json()

        if (res.ok) {
            setSent(true)
        } else {
            setError(data.error || 'Bir hata oluştu, tekrar deneyin.')
        }
        setLoading(false)
    }

    if (sent) return (
        <div className="text-center py-20">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold mb-2">Mesajınız alındı!</h2>
            <p className="text-gray-500">Geri bildiriminiz için teşekkürler.</p>
        </div>
    )

    return (
        <div className="max-w-lg mx-auto px-4 py-12">
            <h1 className="text-2xl font-bold mb-2">📬 Geri Bildirim Gönder</h1>
            <p className="text-gray-500 mb-6">Öneri, hata bildirimi veya her türlü görüşünüzü paylaşabilirsiniz.</p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                    ❌ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Adınız (isteğe bağlı)"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="E-posta (isteğe bağlı)"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                />
                <textarea
                    placeholder="Mesajınız *"
                    required
                    rows={5}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50"
                >
                    {loading ? 'Gönderiliyor...' : 'Gönder'}
                </button>
            </form>
        </div>
    )
}