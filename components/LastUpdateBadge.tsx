'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ChangelogEntry {
    id: number
    date: string
    title: string
    description: string
}

export default function LastUpdateBadge() {
    const [lastUpdates, setLastUpdates] = useState<ChangelogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [isExpanded, setIsExpanded] = useState(true)

    // LocalStorage'dan durumu oku
    useEffect(() => {
        const saved = localStorage.getItem('lastUpdateBadgeExpanded')
        if (saved === 'false') {
            setIsExpanded(false)
        }
    }, [])

    useEffect(() => {
        Promise.all([
            fetch('/api/last-update').then(res => res.json()),
            fetch('/api/changelog').then(res => res.json())
        ])
            .then(([lastUpdateData, changelogData]) => {
                const latestThree = Array.isArray(changelogData)
                    ? changelogData.slice(0, 3)
                    : []
                setLastUpdates(latestThree)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    // Durumu kaydet
    const saveExpanded = (expanded: boolean) => {
        setIsExpanded(expanded)
        localStorage.setItem('lastUpdateBadgeExpanded', String(expanded))
    }

    if (loading) return null
    if (lastUpdates.length === 0) return null

    // Küçültülmüş hal (yuvarlak buton)
    if (!isExpanded) {
        return (
            <div className="fixed bottom-6 left-6 z-40 group">
                <button
                    onClick={() => saveExpanded(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                    <div className="relative">
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-lg">📋</span>
                    </div>
                </button>
                <div className="absolute bottom-full left-0 mb-2 w-32 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-1.5 opacity-0 group-hover:opacity-100 transition pointer-events-none text-center">
                    Son güncellemeleri göster
                </div>
            </div>
        )
    }

    // Genişletilmiş hal (kutucuk)
    return (
        <div className="fixed bottom-6 left-6 z-40 group cursor-pointer">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-300 w-64">
                {/* Başlık ve kapatma butonu */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-xs font-semibold text-green-800">📋 Son Güncellemeler</span>

                    {/* Küçültme butonu */}
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            saveExpanded(false)
                        }}
                        className="ml-auto text-gray-400 hover:text-gray-600 transition text-xs"
                        title="Küçült"
                    >
                        ➖
                    </button>
                </div>

                {/* Son 3 güncelleme listesi */}
                <div className="space-y-2">
                    {lastUpdates.map((update) => (
                        <Link href="/changelog" key={update.id}>
                            <div className="border-l-2 border-green-300 pl-2 hover:bg-green-100/30 rounded transition">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-mono text-green-600">
                                        {new Date(update.date).toLocaleDateString('tr-TR')}
                                    </span>
                                    <span className="text-[10px] font-medium text-gray-700 truncate">
                                        {update.title}
                                    </span>
                                </div>
                                <p className="text-[9px] text-gray-500 line-clamp-1 mt-0.5">
                                    {update.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Alt bilgi */}
                <Link href="/changelog">
                    <div className="mt-2 pt-1 border-t border-green-100 text-[9px] text-green-600 text-center hover:text-green-700">
                        Tüm güncellemeleri gör ›
                    </div>
                </Link>
            </div>
        </div>
    )
}