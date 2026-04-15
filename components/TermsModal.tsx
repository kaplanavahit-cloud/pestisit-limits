'use client';

import { useState } from 'react';

type Props = {
  onAccept: () => void;
};

export default function TermsModal({ onAccept }: Props) {
  const [checked, setChecked] = useState(false);

  const handleAccept = () => {
    if (!checked) return;
    
    // localStorage'e kaydet (eski sistemle uyumluluk için)
    localStorage.setItem('terms_accepted', 'true');
    
    // Cookie'ye de kaydet (middleware için)
    document.cookie = "terms_accepted=true; path=/; max-age=31536000"; // 1 yıl
    document.cookie = "terms_version=v1; path=/; max-age=31536000";
    
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white max-w-xl w-full p-6 rounded-2xl shadow-xl mx-4">
        <h2 className="text-xl font-semibold mb-4">
          Kullanım Koşulları ve Sorumluluk Reddi
        </h2>

        <div className="text-sm text-gray-700 max-h-64 overflow-y-auto space-y-3 mb-4">
          <p>
            Bu platformda sunulan pestisit kalıntı limitleri ve ilgili tüm veriler yalnızca bilgilendirme amaçlıdır.
          </p>
          <p>
            Veriler farklı resmi kaynaklardan derlenmiş olup güncellik, doğruluk ve eksiksizlik garanti edilmemektedir.
          </p>
          <p>
            Kullanıcı, bu platformda yer alan bilgilere dayanarak vereceği kararların tamamen kendi sorumluluğunda olduğunu kabul eder.
          </p>
          <p>
            Platform geliştiricisi, verilerde bulunabilecek hata, eksiklik veya gecikmelerden doğabilecek hiçbir zarardan sorumlu değildir.
          </p>
          <p>
            Farklı ülke ve kurumlara ait limitler arasında farklılıklar olabilir.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Detaylı bilgi için <a href="/terms" target="_blank" className="text-blue-600 underline">Kullanıcı Sözleşmesi</a> sayfasını inceleyebilirsiniz.
          </p>
        </div>

        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span className="text-sm">
            Okudum, anladım ve kabul ediyorum
          </span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!checked}
          className={`w-full py-2 rounded-lg text-white transition ${
            checked 
              ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Devam Et
        </button>
      </div>
    </div>
  );
}