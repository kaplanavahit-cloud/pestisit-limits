'use client'

import { useState } from 'react'

export default function FeedbackPage() {
    const [form, setForm] = useState({ name: '', email: '', message: '' })
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
        if (res.ok) setSent(true)
    }

    if (sent) return <div className="text-center py-20">✅ Mesajınız alındı. Teşekkürler!</div>

    return (
        <div className="max-w-lg mx-auto px-4 py-12">
            <h1 className="text-2xl font-bold mb-6">📬 Geri Bildirim Gönder</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Adınız" className="w-full p-2 border rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input type="email" placeholder="E-posta" className="w-full p-2 border rounded" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <textarea placeholder="Mesajınız" required rows={5} className="w-full p-2 border rounded" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded">Gönder</button>
            </form>
        </div>
    )
}