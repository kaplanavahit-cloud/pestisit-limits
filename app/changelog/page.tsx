import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export const revalidate = 3600

export default async function ChangelogPage() {
    const supabase = createClient()

    const { data: changelog, error } = await supabase
        .from('changelog')
        .select('*')
        .order('date', { ascending: false })

    if (error) {
        console.error('Changelog hatası:', error)
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            {/* Geri butonu */}
            <div className="mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Ana Sayfaya Dön
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-2">📋 Güncelleme Geçmişi</h1>
            <p className="text-gray-600 mb-8">Sistemde yapılan tüm değişiklikler buradan takip edilebilir.</p>

            {error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-800">Veritabanı bağlantı hatası.</p>
                    <p className="text-red-600 text-sm mt-2">Lütfen daha sonra tekrar deneyin.</p>
                </div>
            ) : (!changelog || changelog.length === 0) ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <p className="text-yellow-800">Henüz güncelleme kaydı bulunmuyor.</p>
                    <p className="text-yellow-600 text-sm mt-2">İlk güncelleme eklendiğinde burada görünecektir.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {changelog.map((item) => (
                        <div key={item.id} className="border-l-4 border-green-700 bg-white p-5 rounded-lg shadow-sm">
                            <div className="text-green-700 font-semibold text-sm mb-1">
                                📅 {new Date(item.date).toLocaleDateString('tr-TR')}
                            </div>
                            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                            <p className="text-gray-700 mb-3">{item.description}</p>
                            <div className="text-sm text-gray-500">
                                📌 Kaynak: {item.source}
                                {item.source_url && (
                                    <a
                                        href={item.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-green-700 hover:underline"
                                    >
                                        → Bağlantı
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
                ⚡ Bu sayfa her saat başı otomatik olarak güncellenir.
            </div>
        </div>
    )
}