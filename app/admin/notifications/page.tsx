'use client'

import { useState } from 'react'

export default function AdminNotifications() {
    const [form, setForm] = useState({ title: '', message: '', user_email: '' })
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult('')

        const res = await fetch('/api/admin/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })

        const data = await res.json()
        if (res.ok) {
            setResult('✅ Bildirim gönderildi!')
            setForm({ title: '', message: '', user_email: '' })
        } else {
            setResult('❌ Hata: ' + data.error)
        }
        setLoading(false)
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <h1 className="text-2xl font-bold mb-6">📢 Bildirim Gönder</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Başlık" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full p-2 border rounded" />
                <textarea placeholder="Mesaj" required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full p-2 border rounded" />
                <input type="email" placeholder="E-posta (tüm kullanıcılar için boş bırak)" value={form.user_email} onChange={e => setForm({ ...form, user_email: e.target.value })} className="w-full p-2 border rounded" />
                <button type="submit" disabled={loading} className="bg-green-700 text-white px-4 py-2 rounded">{loading ? 'Gönderiliyor...' : 'Gönder'}</button>
            </form>
            {result && <p className="mt-4">{result}</p>}
        </div>
    )
}