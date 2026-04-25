import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 60

export default async function AdminFeedback() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const ADMIN_EMAIL = 'mrldestek@gmail.com'

    if (!user || user.email !== ADMIN_EMAIL) {
        redirect('/')
    }

    const { data: feedbacks } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })

    const pendingCount = feedbacks?.filter(f => f.status === 'pending').length || 0
    const readCount = feedbacks?.filter(f => f.status === 'read').length || 0
    const resolvedCount = feedbacks?.filter(f => f.status === 'resolved').length || 0

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Admin Başlık ve Menü */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-2xl font-bold">📬 Admin Paneli</h1>
                <div className="flex gap-2">
                    <Link href="/admin" className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">Ana Sayfa</Link>
                    <Link href="/admin/changelog" className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">📝 Güncelleme Ekle</Link>
                    <Link href="/admin/notifications" className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">📢 Bildirim</Link>
                </div>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-700">{pendingCount}</div>
                    <div className="text-sm text-yellow-600">Bekleyen</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">{readCount}</div>
                    <div className="text-sm text-blue-600">Okunan</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{resolvedCount}</div>
                    <div className="text-sm text-green-600">Çözülen</div>
                </div>
            </div>

            {/* Geri Bildirimler Listesi */}
            <h2 className="text-xl font-semibold mb-4">📋 Gelen Geri Bildirimler</h2>
            <div className="space-y-4">
                {feedbacks?.length === 0 && (
                    <p className="text-gray-500 text-center py-8">Henüz geri bildirim yok.</p>
                )}

                {feedbacks?.map((fb) => (
                    <div
                        key={fb.id}
                        className={`border rounded-lg p-4 bg-white shadow-sm ${fb.status === 'pending' ? 'border-l-4 border-l-red-500' : ''
                            }`}
                    >
                        <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                                <div className="font-semibold">{fb.name || '👤 İsimsiz'}</div>
                                <div className="text-sm text-gray-500">{fb.email || '📧 E-posta yok'}</div>
                            </div>
                            <div className="text-xs text-gray-400">
                                {new Date(fb.created_at).toLocaleString('tr-TR')}
                            </div>
                        </div>

                        <div className="mt-3 text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                            {fb.message}
                        </div>

                        {fb.url && (
                            <div className="mt-2 text-xs">
                                <a href={fb.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    🔗 Sayfaya git: {fb.url}
                                </a>
                            </div>
                        )}

                        <div className="mt-3 flex gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${fb.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    fb.status === 'read' ? 'bg-blue-100 text-blue-800' :
                                        'bg-green-100 text-green-800'
                                }`}>
                                {fb.status === 'pending' ? '⏳ Bekliyor' :
                                    fb.status === 'read' ? '📖 Okundu' :
                                        '✅ Çözüldü'}
                            </span>

                            {/* Durum Güncelleme Butonları */}
                            <div className="flex gap-1 ml-auto">
                                <form action={`/api/admin/feedback/update-status`} method="POST" className="inline">
                                    <input type="hidden" name="id" value={fb.id} />
                                    <input type="hidden" name="status" value="read" />
                                    <button type="submit" className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                                        Okundu
                                    </button>
                                </form>
                                <form action={`/api/admin/feedback/update-status`} method="POST" className="inline">
                                    <input type="hidden" name="id" value={fb.id} />
                                    <input type="hidden" name="status" value="resolved" />
                                    <button type="submit" className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
                                        Çözüldü
                                    </button>
                                </form>
                                <form action={`/api/admin/feedback/update-status`} method="POST" className="inline">
                                    <input type="hidden" name="id" value={fb.id} />
                                    <input type="hidden" name="status" value="pending" />
                                    <button type="submit" className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                                        Bekleme
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}