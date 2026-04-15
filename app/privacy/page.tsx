// app/privacy/page.tsx

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Başlık */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Gizlilik Politikası
          </h1>
          <p className="text-gray-600">
            Kişisel verilerinizin güvenliği bizim için önemlidir.
          </p>
        </div>

        {/* İçerik Kartı */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 space-y-8">
          
          {/* Madde 1 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">1</span>
              Veri Sorumlusu
            </h2>
            <p className="text-gray-700 leading-relaxed ml-8">
              Bu site, Pestisit Limit Kontrol (MRL Control) tarafından işletilmektedir. 
              Kişisel verileriniz, aşağıda açıklanan kapsamda işlenmektedir.
            </p>
          </section>

          {/* Madde 2 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">2</span>
              Toplanan Veriler
            </h2>
            <p className="text-gray-700 leading-relaxed ml-8">
              Siteyi kullanırken aşağıdaki bilgiler toplanabilir:
            </p>
            <ul className="list-disc list-inside ml-8 mt-2 text-gray-700 space-y-1">
              <li>E-posta adresi (hesap oluşturma sırasında)</li>
              <li>Şifre (güvenli bir şekilde hash'lenerek saklanır)</li>
              <li>IP adresi ve tarayıcı bilgileri (güvenlik ve analiz amaçlı)</li>
              <li>Kullanım istatistikleri (hangi sayfaların ziyaret edildiği)</li>
            </ul>
          </section>

          {/* Madde 3 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">3</span>
              Verilerin Kullanım Amaçları
            </h2>
            <p className="text-gray-700 leading-relaxed ml-8">
              Toplanan kişisel veriler aşağıdaki amaçlarla kullanılabilir:
            </p>
            <ul className="list-disc list-inside ml-8 mt-2 text-gray-700 space-y-1">
              <li>Hesap oluşturma ve yönetimi</li>
              <li>Site güvenliğinin sağlanması</li>
              <li>Kullanıcı deneyiminin iyileştirilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Kötüye kullanım ve dolandırıcılığın önlenmesi</li>
            </ul>
          </section>

          {/* Madde 4 - Üçüncü Taraflar */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">4</span>
              Üçüncü Taraf Hizmetler
            </h2>
            <p className="text-gray-700 leading-relaxed ml-8">
              Bu site, aşağıdaki üçüncü taraf hizmetlerini kullanmaktadır:
            </p>
            <ul className="list-disc list-inside ml-8 mt-2 text-gray-700 space-y-1">
              <li>
                <span className="font-medium">Supabase:</span> Veritabanı ve kimlik doğrulama hizmetleri. 
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  Gizlilik Politikaları
                </a>
              </li>
              <li>
                <span className="font-medium">Vercel:</span> Barındırma ve dağıtım hizmetleri. 
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  Gizlilik Politikaları
                </a>
              </li>
            </ul>
          </section>

          {/* Madde 5 - Veri Güvenliği */}
          <section className="bg-green-50 p-5 rounded-lg border border-green-200">
            <h2 className="text-xl font-semibold text-green-800 mb-3 flex items-center gap-2">
              <span className="bg-green-200 text-green-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">5</span>
              Veri Güvenliği
            </h2>
            <p className="text-green-700 leading-relaxed ml-8">
              Kişisel verileriniz, endüstri standardı şifreleme yöntemleri (SSL/TLS) 
              kullanılarak korunmaktadır. Şifreleriniz tek yönlü hash algoritmaları ile 
              şifrelenir ve tarafımızca görüntülenemez. Ancak, internet üzerinden yapılan 
              hiçbir veri iletiminin %100 güvenli olmadığını lütfen unutmayın.
            </p>
          </section>

          {/* Madde 6 - Kullanıcı Hakları */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">6</span>
              Kullanıcı Hakları (KVKK / GDPR)
            </h2>
            <p className="text-gray-700 leading-relaxed ml-8">
              Kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside ml-8 mt-2 text-gray-700 space-y-1">
              <li>Verilerinize erişme ve kopya alma</li>
              <li>Yanlış veya eksik verilerin düzeltilmesini isteme</li>
              <li>Belirli koşullarda silinmesini isteme (unutulma hakkı)</li>
              <li>Veri işleme faaliyetlerine itiraz etme</li>
              <li>Verilerin taşınabilirliğini isteme</li>
            </ul>
            <p className="text-gray-700 leading-relaxed ml-8 mt-3">
              Bu haklarınızı kullanmak için bize aşağıdaki iletişim adresinden ulaşabilirsiniz.
            </p>
          </section>

          {/* Madde 7 - Çerezler (Cookies) */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">7</span>
              Çerezler (Cookies)
            </h2>
            <p className="text-gray-700 leading-relaxed ml-8">
              Bu site, oturum yönetimi ve güvenlik amaçlı zorunlu çerezler kullanmaktadır. 
              Bu çerezler, sitenin temel işlevleri için gereklidir ve devre dışı bırakılamaz. 
              Pazarlama veya izleme çerezleri kullanılmamaktadır.
            </p>
          </section>

          {/* Madde 8 - Değişiklikler */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">8</span>
              Politika Değişiklikleri
            </h2>
            <p className="text-gray-700 leading-relaxed ml-8">
              Bu Gizlilik Politikası önceden haber verilmeksizin güncellenebilir. 
              Önemli değişiklikler olması durumunda, site üzerinden bildirim yapılacaktır. 
              Güncellemeleri takip etmek kullanıcıların sorumluluğundadır.
            </p>
          </section>

          {/* Madde 9 - İletişim */}
          <section className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">9</span>
              İletişim
            </h2>
            <p className="text-gray-700 leading-relaxed ml-8">
              Kişisel verilerinizle ilgili herhangi bir soru, talep veya şikayetiniz için 
              aşağıdaki iletişim kanallarını kullanabilirsiniz:
            </p>
            <div className="ml-8 mt-3 p-3 bg-white rounded border border-gray-200">
              <p className="text-gray-700">
                <span className="font-medium">E-posta:</span> destek@pestisit-limits.com
              </p>
              <p className="text-gray-700 mt-1">
                <span className="font-medium">Adres:</span> [İsteğe bağlı - adres bilginizi ekleyebilirsiniz]
              </p>
            </div>
          </section>

          {/* Alt Bilgi */}
          <div className="border-t pt-6 mt-6 text-center text-sm text-gray-500">
            <p>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
            <p className="mt-1">© {new Date().getFullYear()} Pestisit Limit Kontrol (MRL Control)</p>
          </div>
        </div>

        {/* Geri Butonu */}
        <div className="text-center mt-8">
          <a 
            href="/" 
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            ← Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
}