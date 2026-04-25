'use client'

import { useState } from 'react'

export default function AdminChangelog() {
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        title: '',
        description: '',
        source: '',
        source_url: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const res = await fetch('/api/admin/changelog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ type: 'success', text: '✅ Güncelleme başarıyla eklendi!' })
                setForm({
                    date: new Date().toISOString().split('T')[0],
                    title: '',
                    description: '',
                    source: '',
                    source_url: ''
                })
            } else {
                setMessage({ type: 'error', text: data.error || 'Bir hata oluştu' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bağlantı hatası' })
        }
        setLoading(false)
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-6">
                <a href="/admin" className="text-sm text-gray-500 hover:text-gray-700">← Admin Paneli</a>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-900 font-medium">Yeni Güncelleme Ekle</span>
            </div>

            <h1 className="text-2xl font-bold mb-2">📝 Yeni Güncelleme Ekle</h1>
            <p className="text-gray-600 mb-6">Changelog'a yeni bir kayıt ekleyin.</p>

            {message && (
                <div className={`rounded-lg p-4 mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarih *</label>
                    <input
                        type="date"
                        required
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık *</label>
                    <input
                        type="text"
                        required
                        placeholder="🚀 Yeni özellik eklendi"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama *</label>
                    <textarea
                        required
                        rows={4}
                        placeholder="Değişiklikler hakkında detaylı bilgi..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kaynak *</label>
                    <input
                        type="text"
                        required
                        placeholder="MRL Control Ekibi / Resmi Gazete"
                        value={form.source}
                        onChange={(e) => setForm({ ...form, source: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kaynak URL (isteğe bağlı)</label>
                    <input
                        type="url"
                        placeholder="https://..."
                        value={form.source_url}
                        onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 disabled:opacity-50"
                >
                    {loading ? 'Ekleniyor...' : '✅ Güncellemeyi Kaydet'}
                </button>
            </form>
        </div>
    )
}