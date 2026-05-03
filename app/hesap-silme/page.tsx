// app/hesap-silme/page.tsx

export default function HesapSilmePage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto max-w-2xl px-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Hesap Silme Talebi</h1>
                    <p className="text-gray-500 text-sm mb-6">
                        MRL Control web sitesi ve mobil uygulaması için geçerlidir.
                    </p>

                    <p className="text-gray-700 mb-4">
                        MRL Control <strong>web sitesi (mrlcontrol.com)</strong> veya
                        <strong> mobil uygulamasındaki</strong> hesabınızı ve tüm verilerinizi
                        (favoriler, tarama geçmişi) kalıcı olarak silmek için:
                    </p>

                    <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-6">
                        <li><span className="font-medium">mrldestek@gmail.com</span> adresine e-posta gönderin.</li>
                        <li>E-posta konusuna <span className="font-medium">"Hesap Silme Talebi"</span> yazın.</li>
                        <li>E-posta içeriğine <span className="font-medium">kayıtlı e-posta adresinizi</span> yazın.</li>
                        <li>Hesabınızın hem web hem mobil için silineceğini bilin.</li>
                    </ol>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-yellow-800 text-sm">
                            ⚠️ <span className="font-medium">Uyarı:</span> Hesap silme işlemi geri alınamaz.
                            Tüm favorileriniz ve tarama geçmişiniz <strong>hem web hem mobil platformda </strong>
                            kalıcı olarak silinecektir.
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-800 text-sm">
                            ℹ️ <span className="font-medium">Bilgi:</span> Hesabınız bir kere silindiğinde,
                            her iki platformdan da erişiminiz tamamen kalkar ve kalıcı olarak hesabınız silinir.
                        </p>
                    </div>

                    <p className="text-gray-600 text-sm">
                        Talebiniz aldıktan sonra en geç <span className="font-medium">30 gün</span> içinde hesabınız silinecektir.
                    </p>

                    <hr className="my-6" />

                    <div className="text-center">
                        <p className="text-gray-400 text-xs">
                            © {new Date().getFullYear()} MRL Control - Pestisit Limit Kontrol Sistemi
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                            Web: mrlcontrol.com | Mobil: MRL Control App
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}