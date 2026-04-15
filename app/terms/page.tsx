// app/terms/page.tsx

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Başlık */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Kullanıcı Sözleşmesi ve Sorumluluk Reddi
          </h1>
          <p className="text-gray-600">
            Bu siteyi kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
          </p>
        </div>

        {/* İçerik Kartı */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 space-y-8">
          
          {/* Madde 1 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">1</span>
              Bilgilendirme Amaçlıdır
            </h2>
            <p className="text-gray-700 leading-relaxed ml-8">
              Bu sitede sunulan tüm pestisit limit (MRL) verileri, yalnızca genel bilgilendirme 
              ve eğitim amaçlıdır. Resmi mevzuat, hukuki danışmanlık veya ticari rehberlik 
              yerine geçmez.
            </p>
          </section>

          {/* Madde 2 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">2</span>
              Verilerin Doğruluğu
            </h2>
            <p className="text-gray-700 leading-relaxed ml-8">
              Verilerin doğruluğu, güncelliği, eksiksizliği veya belirli bir amaca uygunluğu 
              konusunda hiçbir garanti verilmez. Resmi ve bağlayıcı limitler için lütfen 
              ilgili ülkenin resmi kaynaklarına (TGK, EFSA, USDA vb.) başvurunuz.
            </p>
          </section>

          {/* Madde 3 - Sorumluluk Reddi (En Önemli) */}
          <section className="bg-red-50 p-5 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold text-red-800 mb-3 flex items-center gap-2">
              <span className="bg-red-200 text-red-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">3</span>
              Sorumluluk Reddi (Disclaimer)
            </h2>
            <p className="text-red-700 leading-relaxed ml-8 font-medium">
              Bu sitedeki verilere dayanarak alınan ticari, hukuki veya operasyonel kararlardan 
              doğacak her türlü zarar, kayıp, ceza veya yükümlülükten <span className="underline">site sahibi veya geliştiricileri 
              hiçbir şekilde sorumlu tutulamaz</span>. Kullanıcı, verileri kendi sorumluluğunda 
              kullanmayı peşinen kabul eder.
            </p>
          </section>

          {/* Madde 4 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">4</span>
              Üçüncü Taraf Kaynaklar
            </h2>
            <p className="text-gray-700 leading-relaxed ml-8">
              Veriler, güvenilir olduğuna inanılan kamu kaynaklarından derlenmiştir. 
              Ancak bu kaynakların doğruluğu veya güncelliğinden site sahibi sorumlu değildir.
              Orijinal kaynaklara bağlantılar verilmeye çalışılmıştır.
            </p>
          </section>

          {/* Madde 5 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">5</span>
              Değişiklik Hakkı
            </h2>
            <p className="text-gray-700 leading-relaxed ml-8">
              Bu sitedeki veriler, içerik, limitler ve kullanım şartları önceden haber 
              verilmeksizin değiştirilebilir, güncellenebilir veya kaldırılabilir. 
              Kullanıcıların güncellemeleri takip etmesi önerilir.
            </p>
          </section>

          {/* Madde 6 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">6</span>
              Kabul Şartları
            </h2>
            <p className="text-gray-700 leading-relaxed ml-8">
              Bu siteyi kullanarak, ziyaret ederek veya kayıt olarak yukarıdaki tüm şartları 
              okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş sayılırsınız. 
              Şartları kabul etmiyorsanız lütfen siteyi kullanmayınız.
            </p>
          </section>

          {/* Alt Bilgi */}
          <div className="border-t pt-6 mt-6 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Pestisit Limit Kontrol (MRL Control) - Tüm hakları saklıdır.</p>
            <p className="mt-2">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
          </div>
        </div>

        {/* Geri Butonu */}
        <div className="text-center mt-8">
          <a 
            href="/" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            ← Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
}