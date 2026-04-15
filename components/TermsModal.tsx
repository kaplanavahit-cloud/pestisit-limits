'use client';

import { useState } from 'react';

type Props = {
  onAccept: () => void;
};

export default function TermsModal({ onAccept }: Props) {
  const [checked, setChecked] = useState(false);
  const [showTermsDetail, setShowTermsDetail] = useState(false);

  // Detaylı sözleşme metni (modal içinde gösterilecek)
  if (showTermsDetail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white max-w-2xl w-full p-6 rounded-2xl shadow-xl mx-4">
          <h2 className="text-xl font-semibold mb-4">Kullanıcı Sözleşmesi</h2>
          
          <div className="max-h-96 overflow-y-auto text-sm text-gray-700 space-y-3 mb-4">
            <h3 className="font-semibold text-base mt-2">1. Bilgilendirme Amaçlıdır</h3>
            <p>Bu sitede sunulan tüm pestisit limit (MRL) verileri, yalnızca genel bilgilendirme ve eğitim amaçlıdır. Resmi mevzuat, hukuki danışmanlık veya ticari rehberlik yerine geçmez.</p>

            <h3 className="font-semibold text-base mt-4">2. Verilerin Doğruluğu</h3>
            <p>Verilerin doğruluğu, güncelliği, eksiksizliği veya belirli bir amaca uygunluğu konusunda hiçbir garanti verilmez. Resmi ve bağlayıcı limitler için lütfen ilgili ülkenin resmi kaynaklarına (TGK, EFSA, USDA vb.) başvurunuz.</p>

            <h3 className="font-semibold text-base mt-4 text-red-700">3. Sorumluluk Reddi (Disclaimer)</h3>
            <p className="text-red-700">Bu sitedeki verilere dayanarak alınan ticari, hukuki veya operasyonel kararlardan doğacak her türlü zarar, kayıp, ceza veya yükümlülükten site sahibi veya geliştiricileri hiçbir şekilde sorumlu tutulamaz. Kullanıcı, verileri kendi sorumluluğunda kullanmayı peşinen kabul eder.</p>

            <h3 className="font-semibold text-base mt-4">4. Üçüncü Taraf Kaynaklar</h3>
            <p>Veriler, güvenilir olduğuna inanılan kamu kaynaklarından derlenmiştir. Ancak bu kaynakların doğruluğu veya güncelliğinden site sahibi sorumlu değildir.</p>

            <h3 className="font-semibold text-base mt-4">5. Değişiklik Hakkı</h3>
            <p>Bu sitedeki veriler, içerik, limitler ve kullanım şartları önceden haber verilmeksizin değiştirilebilir, güncellenebilir veya kaldırılabilir.</p>

            <h3 className="font-semibold text-base mt-4">6. Kabul Şartları</h3>
            <p>Bu siteyi kullanarak, ziyaret ederek veya kayıt olarak yukarıdaki tüm şartları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş sayılırsınız.</p>

            <div className="border-t pt-4 mt-4 text-xs text-gray-500">
              <p>© {new Date().getFullYear()} Pestisit Limit Kontrol (MRL Control)</p>
              <p>Son Güncelleme: 15.04.2026</p>
            </div>
          </div>

          <button
            onClick={() => setShowTermsDetail(false)}
            className="w-full py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition font-medium"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  // Ana modal (checkbox + kabul butonu)
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
            Detaylı bilgi için{' '}
            <button 
              onClick={() => setShowTermsDetail(true)}
              className="text-blue-600 underline cursor-pointer hover:text-blue-800"
            >
              Kullanıcı Sözleşmesi
            </button>
            {' '}sayfasını inceleyebilirsiniz.
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
          onClick={onAccept}
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