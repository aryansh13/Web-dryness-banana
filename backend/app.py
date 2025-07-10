"use client";

import React, { useState, useRef } from "react";
import { FiUploadCloud, FiArrowRight, FiLoader, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import Image from "next/image";

// Animasi CSS
const animationStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spinner { animation: spin 1s linear infinite; }
`;

const cardStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  borderRadius: "20px",
  padding: "2.5rem",
  width: "100%",
  boxShadow: "0 8px 32px 0 rgba(0,0,0,0.08)",
  textAlign: "center",
  flex: "1 1 350px", 
};

type AnalysisResult = {
  classification: string;
  accuracy: number;
  drynessLevel: number;
};

export default function HomeSection() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const processImageFile = async (file: File) => {
    if (file) {
      // Validasi ukuran file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 10MB.");
        return;
      }

      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        setError("File yang dipilih bukan gambar.");
        return;
      }

      handleReset();
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setIsLoading(true);

      // Kirim gambar ke backend Flask
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const response = await fetch('http://localhost:5000/predict', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setResult({
          classification: data.classification,
          accuracy: Math.round(data.accuracy * 10) / 10, // Round to 1 decimal place
          drynessLevel: data.drynessLevel,
        });
        
      } catch (error) {
        console.error('Prediction error:', error);
        setError(error instanceof Error ? error.message : 'Gagal menganalisis gambar');
        setResult(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGalleryImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processImageFile(file);
  };

  const triggerGalleryInput = () => galleryInputRef.current?.click();

  const getBadgeColor = (classification: string) => {
    switch (classification) {
      case "Kering": return { background: "#fef2f2", color: "#b91c1c" };
      case "Sedang": return { background: "#fffbeb", color: "#b45309" };
      case "Basah": return { background: "#f0fdf4", color: "#15803d" };
      default: return { background: "#f1f5f9", color: "#475569" };
    }
  };

  const getConfidenceColor = (accuracy: number) => {
    if (accuracy >= 80) return "#15803d"; // Green
    if (accuracy >= 60) return "#b45309"; // Orange
    return "#b91c1c"; // Red
  };

  return (
    <>
      <style>{animationStyles}</style>

      <input type="file" ref={galleryInputRef} onChange={handleGalleryImageChange} style={{ display: "none" }} accept="image/*" />

      <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem 2.5rem", background: "linear-gradient(135deg, #f0fdfa 0%, #dcfce7 100%)", overflow: "hidden" }}>
        <div style={{ maxWidth: "1200px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "5rem" }}>

          {/* Judul & Deskripsi */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", alignItems: "center", gap: "3rem", width: "100%" }}>
            <div className="fade-in-up" style={{ opacity: 0, animationDelay: "0.2s" }}>
              <h1 style={{ fontSize: "3.8rem", fontWeight: 800, color: "#1a202c", lineHeight: 1.15, letterSpacing: "-2.5px" }}>
                Analisis Kekeringan Pisang dengan AI
              </h1>
              <p style={{ fontSize: "1.2rem", color: "#4a5568", margin: "1.5rem 0 2.5rem 0" }}>
                Dapatkan data akurat tentang tingkat kekeringan pisang Anda secara instan menggunakan teknologi AI terdepan.
              </p>
              <button onClick={() => document.getElementById('upload-card')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: "#fbbf24", color: "#422006", fontWeight: 600, border: "none", borderRadius: "12px", padding: "1rem 2rem", fontSize: "1.1rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.75rem", transition: "all 0.3s ease", boxShadow: "0 4px 20px rgba(251, 191, 36, 0.3)" }}>
                Mulai Deteksi Sekarang <FiArrowRight />
              </button>
            </div>

            <div className="fade-in-up" style={{ opacity: 0, animationDelay: "0.4s", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
              <div style={{ position: "absolute", width: "100%", height: "100%", maxWidth: "400px", maxHeight: "400px", background: "linear-gradient(135deg, #fbbf24 0%, #ffe066 100%)", borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%", opacity: 0.8, filter: "blur(10px)", animation: "blobMorph 8s ease-in-out infinite alternate" }}></div>
              <style>{`@keyframes blobMorph { 0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; } 100% { border-radius: 58% 42% 43% 57% / 43% 52% 48% 57%; transform: rotate(15deg); } }`}</style>
              <Image src="/assets/images/pisang_home.png" alt="Pisang yang dianalisis" width={400} height={400} priority={true} style={{ position: "relative", zIndex: 2, width: "100%", height: "auto", maxWidth: "380px", filter: "drop-shadow(0 20px 25px rgba(0,0,0,0.2))", transform: "rotate(-10deg)" }} />
            </div>
          </div>

          {/* Kartu Upload dan Hasil */}
          <div id="upload-card" className="fade-in-up" style={{ opacity: 0, animationDelay: "0.6s", display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap", width: "100%" }}>
            <div style={{ ...cardStyle, minWidth: '350px' }}>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#2d3748", marginBottom: "1.5rem" }}>
                Unggah Gambar
              </h3>
              <p style={{ color: "#666", marginBottom: "2rem", minHeight: "40px" }}>
                Pilih gambar pisang dari galeri Anda (maksimal 10MB).
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button 
                  onClick={triggerGalleryInput} 
                  disabled={isLoading}
                  style={{ 
                    flex: 1, 
                    background: isLoading ? "#f3f4f6" : "#e9edf1", 
                    border: "1px solid #d1d9e2", 
                    color: isLoading ? "#9ca3af" : "#374151", 
                    padding: "0.85rem", 
                    borderRadius: "12px", 
                    fontWeight: 600, 
                    cursor: isLoading ? "not-allowed" : "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "0.75rem", 
                    transition: "all 0.2s ease" 
                  }}
                >
                  <FiUploadCloud size={20} /> {isLoading ? "Menganalisis..." : "Galeri"}
                </button>
              </div>
              {error && (
                <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiAlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>

            <div style={{ ...cardStyle, minWidth: '350px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#2d3748", margin: 0 }}>
                  Hasil Analisis
                </h3>
                {(imagePreview || isLoading) && (
                  <button onClick={handleReset} title="Ulangi Analisis" style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', transition: 'color 0.2s' }}>
                    <FiRefreshCw size={20} />
                  </button>
                )}
              </div>
              <div style={{ background: "#e9edf1", borderRadius: "12px", padding: "1rem", minHeight: "182px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #d1d9e2" }}>
                {isLoading ? (
                  <div style={{ textAlign: 'center', color: '#4a5568' }}>
                    <FiLoader size={32} className="spinner" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ fontWeight: 500 }}>Menganalisis Gambar...</p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Proses membutuhkan 10-30 detik</p>
                    <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)', borderRadius: '2px', animation: 'loading 2s ease-in-out infinite' }}></div>
                    </div>
                    <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
                  </div>
                ) : imagePreview && result ? (
                  <div style={{ width: '100%', textAlign: 'left' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <Image src={imagePreview} alt="Preview" width={100} height={100} style={{ borderRadius: '8px', objectFit: 'cover', width: 100, height: 'auto' }} />
                      <div style={{ width: '100%' }}>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Klasifikasi:</p>
                        <span style={{ ...getBadgeColor(result.classification), padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '1rem', fontWeight: 600 }}>
                          {result.classification}
                        </span>
                        <div style={{ borderTop: '1px solid #d1d9e2', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                          <p style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 500 }}>Tingkat Keyakinan</p>
                          <p style={{ fontSize: '0.9rem', color: getConfidenceColor(result.accuracy), fontWeight: 600 }}>
                            {result.accuracy}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "#718096", fontStyle: "italic" }}>
                    Hasil deteksi akan muncul di sini.
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}