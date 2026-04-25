'use client'

import Link from 'next/link'

export default function AdminPage() {
  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    window.location.href = '/admin'
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">🔧 Admin Paneli</h1>
      <div className="grid gap-3">
        <Link href="/admin/feedback" className="block p-3 bg-white border rounded hover:shadow">📬 Geri Bildirimler</Link>
        <Link href="/admin/changelog" className="block p-3 bg-white border rounded hover:shadow">📝 Yeni Güncelleme Ekle</Link>
        <Link href="/admin/notifications" className="block p-3 bg-white border rounded hover:shadow">📢 Bildirim Gönder</Link>
        
        {/* Çıkış Butonu */}
        <button
          onClick={handleLogout}
          className="block p-3 bg-red-50 border border-red-200 rounded hover:shadow text-red-700 text-left mt-4"
        >
          🚪 Çıkış Yap
        </button>
      </div>
    </div>
  )
}