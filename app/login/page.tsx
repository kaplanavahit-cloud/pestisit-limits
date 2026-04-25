"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();
    const supabase = createClient();

    async function handleSubmit() {
        setLoading(true);
        setMessage("");

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) setMessage(error.message);
            else setMessage("Kayıt olundu! E-postanı kontrol et.");
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setMessage("Hatalı e-posta veya şifre");
            else router.push("/dashboard");
        }
        setLoading(false);
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f8" }}>
            <div style={{ background: "white", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "2rem", width: 360 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
                    <div style={{ width: 32, height: 32, background: "#1D9E75", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5L2.25 5.25v3.75C2.25 13.05 5.1 17.1 9 18c3.9-.9 6.75-4.95 6.75-8.95V5.25L9 1.5z" stroke="white" strokeWidth="1.5" fill="none" /><path d="M6 9l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </div>
                    <span style={{ fontWeight: 500, fontSize: 16 }}>Pestisit Limit Kontrol</span>
                </div>

                <div style={{ fontSize: 13, color: "#666", marginBottom: "1.25rem" }}>
                    {isSignUp ? "Yeni hesap oluştur" : "Hesabına giriş yap"}
                </div>

                <input
                    type="email" placeholder="E-posta" value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", border: "0.5px solid #ddd", borderRadius: 8, fontSize: 14, marginBottom: 8, boxSizing: "border-box" }}
                />
                <input
                    type="password" placeholder="Şifre" value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    style={{ width: "100%", padding: "9px 12px", border: "0.5px solid #ddd", borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: "border-box" }}
                />

                {message && (
                    <div style={{ padding: "8px 12px", background: message.includes("Kayıt") ? "#E1F5EE" : "#FCEBEB", color: message.includes("Kayıt") ? "#0F6E56" : "#A32D2D", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                        {message}
                    </div>
                )}

                <button
                    onClick={handleSubmit} disabled={loading || !email || !password}
                    style={{ width: "100%", padding: "10px", background: loading ? "#ccc" : "#1D9E75", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer" }}
                >
                    {loading ? "..." : isSignUp ? "Kayıt Ol" : "Giriş Yap"}
                </button>

                {/* Şifremi Unuttum Linki - Sadece Giriş modunda göster */}
                {!isSignUp && (
                    <div style={{ textAlign: "center", marginTop: 12 }}>
                        <Link href="/forgot-password" style={{ color: "#1D9E75", fontSize: 13, textDecoration: "none", cursor: "pointer" }}>
                            🔐 Şifremi unuttum?
                        </Link>
                    </div>
                )}

                <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "#666" }}>
                    {isSignUp ? "Hesabın var mı? " : "Hesabın yok mu? "}
                    <span onClick={() => { setIsSignUp(!isSignUp); setMessage(""); }} style={{ color: "#1D9E75", cursor: "pointer", fontWeight: 500 }}>
                        {isSignUp ? "Giriş yap" : "Kayıt ol"}
                    </span>
                </div>
            </div>
        </div>
    );
}