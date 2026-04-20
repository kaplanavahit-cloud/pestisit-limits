// app/terms/page.tsx

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Kullanıcı Sözleşmesi
          </h1>
          <p className="text-gray-600">
            Son güncelleme: 18 Nisan 2026
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">1. Genel Hükümler</h2>
            <p className="text-gray-700">
              Bu site, pestisit kalıntı limitleri (MRL) hakkında bilgi vermek amacıyla kurulmuştur. 
              Siteyi kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">2. Bilgilendirme Amaçlıdır</h2>
            <p className="text-gray-700">
              Bu sitede sunulan tüm pestisit limit (MRL) verileri, yalnızca genel bilgilendirme 
              ve eğitim amaçlıdır. Resmi mevzuat, hukuki danışmanlık veya ticari rehberlik yerine geçmez.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">3. Verilerin Doğruluğu</h2>
            <p className="text-gray-700">
              Verilerin doğruluğu, güncelliği, eksiksizliği veya belirli bir amaca uygunluğu 
              konusunda hiçbir garanti verilmez. Resmi ve bağlayıcı limitler için lütfen 
              ilgili ülkenin resmi kaynaklarına (TGK, EFSA, USDA vb.) başvurunuz.
            </p>
          </section>

          <section className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold text-red-800 mb-2">4. Sorumluluk Reddi</h2>
            <p className="text-red-700">
              Bu sitedeki verilere dayanarak alınan ticari, hukuki veya operasyonel kararlardan 
              doğacak her türlü zarar, kayıp, ceza veya yükümlülükten site sahibi veya geliştiricileri 
              hiçbir şekilde sorumlu tutulamaz. Kullanıcı, verileri kendi sorumluluğunda kullanmayı 
              peşinen kabul eder.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">5. Değişiklik Hakkı</h2>
            <p className="text-gray-700">
              Bu sitedeki veriler, içerik, limitler ve kullanım şartları önceden haber 
              verilmeksizin değiştirilebilir, güncellenebilir veya kaldırılabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">6. İletişim</h2>
            <p className="text-gray-700">
              Soru, görüş ve şikayetleriniz için: mrldestek@gmail.com
            </p>
          </section>

          {/* ✅ YENİ MADDE: FİKRİ MÜLKİYET VE KULLANIM KISITLAMALARI */}
          <section className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">7. Fikri Mülkiyet ve Kullanım Kısıtlamaları</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                <strong>7.1.</strong> Bu platformda yer alan tüm içerik (veritabanı, metinler, görseller, logolar, 
                grafikler, yazılım kodu) ve marka unsurları (<strong>MRL Control</strong> ismi ve logosu), 
                aksi belirtilmediği sürece <strong>Abdulvahit Kaplan</strong>'ın mülkiyetindedir ve uluslararası 
                telif hakkı ve fikri mülkiyet yasaları tarafından korunmaktadır.
              </p>
              <p>
                <strong>7.2.</strong> Platformdaki hiçbir içerik, <strong>yazılı izin olmadan</strong> kopyalanamaz, 
                dağıtılamaz, değiştirilemez, yeniden yayınlanamaz, satılamaz veya ticari amaçla kullanılamaz.
              </p>
              <p>
                <strong>7.3.</strong> Veritabanımızın tamamının veya önemli bir kısmının, otomatik veya manuel yollarla 
                ("ekran kazıma" veya "web scraping" dahil) izinsiz olarak kopyalanması, bu sözleşmenin ihlali 
                anlamına gelir ve yasal işlemlere tabi tutulabilir.
              </p>
              <p>
                <strong>7.4.</strong> <strong>MRL Control</strong> ismi ve logosu tescilli marka adayıdır. 
                Bu isim veya logo, yazılı izin olmadan kullanılamaz.
              </p>
            </div>
          </section>

          <div className="border-t pt-6 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} MRL Control - Abdulvahit Kaplan. Tüm hakları saklıdır.</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <a href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition">
            ← Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
}