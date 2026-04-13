'use client';

import { useState } from 'react';
import Link from 'next/link';

interface InfoCardProps {
  title: string;
  description: string;
  icon: string;
  items?: any[];
  onItemClick: (pesticideName: string) => void;
  loading?: boolean;
  badgeColor?: string;
  showButton?: boolean;
  buttonText?: string;
  buttonLink?: string;
}

export default function InfoCard({ 
  title, 
  description, 
  icon, 
  items = [], 
  onItemClick, 
  loading = false,
  badgeColor = 'emerald',
  showButton = false,
  buttonText = 'Detaylı Liste',
  buttonLink = '#'
}: InfoCardProps) {
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const safeItems = Array.isArray(items) ? items : [];
  
  const filteredItems = searchTerm.trim() === '' 
    ? safeItems 
    : safeItems.filter(item => {
        const name = typeof item === 'string' ? item : item.pesticide_name;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
  
  const displayItems = showAll ? filteredItems : filteredItems.slice(0, 15);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <h3 className="font-semibold text-gray-800">{title}</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const badgeColors: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700',
    purple: 'bg-purple-100 text-purple-700',
    blue: 'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${badgeColors[badgeColor] || badgeColors.emerald}`}>
            {safeItems.length}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        {/* Arama Kutusu */}
        <div className="relative mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Listede ara..."
            className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Liste */}
        <div className="flex-1 max-h-80 overflow-y-auto">
          {filteredItems.length > 0 ? (
            <>
              <ul className="space-y-1">
                {displayItems.map((item, idx) => (
                  <li 
                    key={idx}
                    onClick={() => onItemClick(typeof item === 'string' ? item : item.pesticide_name)}
                    className="text-sm text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="flex-1 truncate">
                        {typeof item === 'string' ? item : item.pesticide_name}
                      </span>
                      {typeof item !== 'string' && item.source_type === 'custom' && (
                        <span className="ml-2 text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          📋 özel
                        </span>
                      )}
                    </div>
                    {typeof item !== 'string' && item.mrl_value && (
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {item.mrl_value}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {filteredItems.length > 15 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-medium w-full text-center py-1.5 border-t border-gray-100"
                >
                  {showAll ? '📖 Daralt' : `📖 Tümünü Göster (${filteredItems.length})`}
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">🔍 Sonuç bulunamadı</p>
          )}
        </div>
        
        {/* Detaylı Liste Butonu */}
        {showButton && (
          <Link href={buttonLink} className="mt-3 w-full">
            <button className="w-full py-2 text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg transition-all duration-200 shadow-sm flex items-center justify-center gap-2">
              <span>📋</span>
              <span>{buttonText}</span>
              <span>→</span>
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}