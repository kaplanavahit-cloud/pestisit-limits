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
                        Web sitesi ve Mobil Uygulama (MRL Control) için geçerlidir.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
                    </p>
                </div>

                {/* İçerik Kartı */}
                <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 space-y-8">

                    {/* GİRİŞ */}
                    <section className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                        <h2 className="text-xl font-semibold text-blue-800 mb-3">📋 Giriş</h2>
                        <p className="text-blue-700 leading-relaxed">
                            MRL Control olarak, kişisel verilerinizin güvenliği bizim için önemlidir.
                            Bu Gizlilik Politikası, <span className="font-semibold">mrlcontrol.com web sitesi</span> ve
                            <span className="font-semibold"> MRL Control mobil uygulaması</span> (Android) için geçerlidir.
                        </p>
                    </section>

                    {/* Madde 1 - Veri Sorumlusu */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">1</span>
                            Veri Sorumlusu
                        </h2>
                        <p className="text-gray-700 leading-relaxed ml-8">
                            MRL Control, web sitesi ve mobil uygulamanın veri sorumlusudur.
                            Kişisel verileriniz, aşağıda açıklanan kapsamda işlenmektedir.
                        </p>
                        <div className="ml-8 mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                            <p className="text-gray-700"><span className="font-medium">İletişim:</span> mrldestek@gmail.com</p>
                        </div>
                    </section>

                    {/* Madde 2 - Toplanan Veriler (Web + Mobil) */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">2</span>
                            Toplanan Veriler
                        </h2>

                        <div className="ml-8 space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">🌐 Web Sitesi İçin:</h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    <li>E-posta adresi (hesap oluşturma sırasında)</li>
                                    <li>Şifre (güvenli bir şekilde hash'lenerek saklanır)</li>
                                    <li>IP adresi ve tarayıcı bilgileri (güvenlik ve analiz amaçlı)</li>
                                    <li>Kullanım istatistikleri (hangi sayfaların ziyaret edildiği)</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">📱 Mobil Uygulama İçin:</h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    <li><span className="font-medium">E-posta adresi</span> (hesap oluşturma ve giriş için)</li>
                                    <li><span className="font-medium">Şifre</span> (Supabase üzerinde şifrelenmiş olarak saklanır)</li>
                                    <li><span className="font-medium">Kamera görüntüsü</span> (sadece anlık OCR işlemi için, kaydedilmez)</li>
                                    <li><span className="font-medium">Favori listesi</span> (kaydedilen ürün-pestisit )</li>
                                    <li><span className="font-medium">Tarama geçmişi</span> (yapılan sorgu kayıtları)</li>
                                    <li><span className="font-medium">Cihaz bilgileri</span> (işletim sistemi sürümü, uygulama sürümü)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="ml-8 mt-4 p-3 bg-amber-50 rounded border border-amber-200">
                            <p className="text-amber-700 text-sm">
                                ⚠️ <span className="font-semibold">Kamera Verisi Uyarısı:</span> Kamera ile çekilen fotoğraflar,
                                sadece anlık metin tanıma (OCR) işlemi için kullanılır. Bu görüntüler cihazınız dışına aktarılmaz,
                                sunucularımıza kaydedilmez ve hiçbir şekilde saklanmaz veya paylaşılmaz.
                            </p>
                        </div>
                    </section>

                    {/* Madde 3 - Verilerin Kullanım Amaçları */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">3</span>
                            Verilerin Kullanım Amaçları
                        </h2>
                        <p className="text-gray-700 leading-relaxed ml-8">
                            Toplanan kişisel veriler aşağıdaki amaçlarla kullanılabilir:
                        </p>
                        <ul className="list-disc list-inside ml-8 mt-2 text-gray-700 space-y-1">
                            <li>Hesap oluşturma, giriş ve yönetimi</li>
                            <li>MRL (Maksimum Kalıntı Limiti) sorgulama hizmetinin sunulması</li>
                            <li>Favori ürün-pestisit çiftlerinin saklanması</li>
                            <li>Tarama geçmişinin kaydedilmesi</li>
                            <li>Uygulama güvenliğinin sağlanması</li>
                            <li>Kullanıcı deneyiminin iyileştirilmesi</li>
                            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                            <li>Kötüye kullanım ve dolandırıcılığın önlenmesi</li>
                        </ul>
                    </section>

                    {/* Madde 4 - İzinler (Mobil Uygulama) */}
                    <section className="bg-purple-50 p-5 rounded-lg border border-purple-200">
                        <h2 className="text-xl font-semibold text-purple-800 mb-3 flex items-center gap-2">
                            <span className="bg-purple-200 text-purple-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">4</span>
                            Mobil Uygulama İzinleri
                        </h2>
                        <p className="text-purple-700 leading-relaxed">
                            MRL Control mobil uygulaması aşağıdaki izinleri talep eder:
                        </p>
                        <div className="mt-3 space-y-3">
                            <div className="bg-white p-3 rounded border border-purple-200">
                                <p className="font-semibold text-purple-800">📷 Kamera (CAMERA)</p>
                                <p className="text-purple-600 text-sm">Ürün etiketlerini okumak ve otomatik sorgulama yapmak için.</p>
                                <p className="text-purple-500 text-xs mt-1">Bu izin olmadan manuel arama yapabilirsiniz.</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-purple-200">
                                <p className="font-semibold text-purple-800">🌐 İnternet (INTERNET)</p>
                                <p className="text-purple-600 text-sm">Sorgular ve kimlik doğrulama için.</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-purple-200">
                                <p className="font-semibold text-purple-800">💾 Yerel Depolama (SecureStore)</p>
                                <p className="text-purple-600 text-sm">Favoriler, geçmiş ve tema tercihlerini kaydetmek için.</p>
                            </div>
                        </div>
                    </section>

                    {/* Madde 5 - Üçüncü Taraf Hizmetler */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">5</span>
                            Üçüncü Taraf Hizmetler
                        </h2>
                        <p className="text-gray-700 leading-relaxed ml-8">
                            Web sitesi ve mobil uygulama aşağıdaki üçüncü taraf hizmetlerini kullanmaktadır:
                        </p>
                        <ul className="list-disc list-inside ml-8 mt-2 text-gray-700 space-y-1">
                            <li>
                                <span className="font-medium">Supabase:</span> Veritabanı, kimlik doğrulama ve depolama hizmetleri.
                                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                    Gizlilik Politikaları
                                </a>
                            </li>
                            <li>
                                <span className="font-medium">Expo (EAS):</span> Uygulama framework'ü ve build hizmetleri.
                                <a href="https://expo.dev/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                    Gizlilik Politikaları
                                </a>
                            </li>
                            <li>
                                <span className="font-medium">Google ML Kit:</span> Kamera OCR (metin tanıma) hizmeti.
                                <a href="https://developers.google.com/ml-kit/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                    Gizlilik Politikaları
                                </a>
                            </li>
                            <li>
                                <span className="font-medium">Vercel:</span> Web sitesi barındırma ve dağıtım hizmetleri.
                                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                    Gizlilik Politikaları
                                </a>
                            </li>
                        </ul>
                    </section>

                    {/* Madde 6 - Veri Güvenliği */}
                    <section className="bg-green-50 p-5 rounded-lg border border-green-200">
                        <h2 className="text-xl font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <span className="bg-green-200 text-green-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">6</span>
                            Veri Güvenliği
                        </h2>
                        <p className="text-green-700 leading-relaxed ml-8">
                            Kişisel verileriniz, endüstri standardı şifreleme yöntemleri (SSL/TLS)
                            kullanılarak korunmaktadır. Şifreleriniz tek yönlü hash algoritmaları ile
                            şifrelenir ve tarafımızca görüntülenemez. Ancak, internet üzerinden yapılan
                            hiçbir veri iletiminin %100 güvenli olmadığını lütfen unutmayın.
                        </p>
                        <p className="text-green-700 leading-relaxed ml-8 mt-3">
                            <span className="font-semibold">Veri Saklama Süresi:</span> Hesabınız aktif olduğu sürece verileriniz saklanır.
                            Hesabınızı sildiğinizde, tüm kişisel verileriniz kalıcı olarak silinir.
                        </p>
                    </section>

                    {/* Madde 7 - Kullanıcı Hakları */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">7</span>
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
                            Bu haklarınızı kullanmak için bize <span className="font-medium">mrldestek@gmail.com</span> adresinden ulaşabilirsiniz.
                        </p>
                    </section>

                    {/* Madde 8 - Çerezler (Cookies) */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">8</span>
                            Çerezler (Cookies)
                        </h2>
                        <p className="text-gray-700 leading-relaxed ml-8">
                            Web sitesi, oturum yönetimi ve güvenlik amaçlı zorunlu çerezler kullanmaktadır.
                            Bu çerezler, sitenin temel işlevleri için gereklidir ve devre dışı bırakılamaz.
                            Pazarlama veya izleme çerezleri kullanılmamaktadır.
                        </p>
                    </section>

                    {/* Madde 9 - Politika Değişiklikleri */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">9</span>
                            Politika Değişiklikleri
                        </h2>
                        <p className="text-gray-700 leading-relaxed ml-8">
                            Bu Gizlilik Politikası önceden haber verilmeksizin güncellenebilir.
                            Önemli değişiklikler olması durumunda, web sitesi üzerinden bildirim yapılacaktır.
                            Güncellemeleri takip etmek kullanıcıların sorumluluğundadır.
                        </p>
                    </section>

                    {/* Madde 10 - İletişim */}
                    <section className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">10</span>
                            İletişim
                        </h2>
                        <p className="text-gray-700 leading-relaxed ml-8">
                            Kişisel verilerinizle ilgili herhangi bir soru, talep veya şikayetiniz için
                            aşağıdaki iletişim kanallarını kullanabilirsiniz:
                        </p>
                        <div className="ml-8 mt-3 p-3 bg-white rounded border border-gray-200">
                            <p className="text-gray-700">
                                <span className="font-medium">📧 E-posta:</span> mrldestek@gmail.com
                            </p>
                            <p className="text-gray-700 mt-1">
                                <span className="font-medium">🌐 Web Sitesi:</span> https://mrlcontrol.com
                            </p>
                        </div>
                    </section>

                    {/* Alt Bilgi */}
                    <div className="border-t pt-6 mt-6 text-center text-sm text-gray-500">
                        <p>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
                        <p className="mt-1">© {new Date().getFullYear()} MRL Control - Pestisit Limit Kontrol Sistemi</p>
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