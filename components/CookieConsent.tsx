'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const rejectAll = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg z-40 p-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-700">
          Bu site, kullanıcı deneyimini geliştirmek için çerezler (cookies) kullanır.
          Detaylı bilgi için{' '}
          <a href="/privacy" target="_blank" className="text-blue-600 underline hover:text-blue-800">
            Gizlilik Politikası
          </a>
          {' '}sayfasını inceleyebilirsiniz.
        </p>
        <div className="flex gap-2">
          <button
            onClick={rejectAll}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Reddet
          </button>
          <button
            onClick={acceptAll}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}