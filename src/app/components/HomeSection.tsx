// src/components/HomeSection.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiCamera, FiUploadCloud, FiArrowRight, FiLoader, FiZap, FiRefreshCw, FiX } from "react-icons/fi";
import Image from "next/image";

// Definisikan keyframes untuk animasi
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

// Style object untuk kartu
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

// Tipe data untuk hasil analisis
type AnalysisResult = {
  classification: string;
  accuracy: number;
  drynessLevel: number;
};


// --- KOMPONEN BARU: MODAL KAMERA ---
interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      if (isOpen && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          alert("Tidak bisa mengakses kamera. Pastikan Anda memberikan izin pada browser.");
          onClose();
        }
      }
    };

    startCamera();

    // Cleanup function: matikan kamera saat modal ditutup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, onClose]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      // Flip a imagem horizontalmente se a câmera estiver espelhada (comum em webcams)
      context?.translate(video.videoWidth, 0);
      context?.scale(-1, 1);
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(capturedFile);
        }
      }, 'image/jpeg', 0.95);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', position: 'relative', width: '90%', maxWidth: '640px' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#f1f5f9', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={20} /></button>
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '8px', transform: 'scaleX(-1)' }}></video>
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        <button onClick={handleCapture} style={{ width: '100%', padding: '1rem', marginTop: '1rem', borderRadius: '12px', background: '#fbbf24', color: '#422006', border: 'none', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <FiCamera size={20} /> Ambil Gambar
        </button>
      </div>
    </div>
  );
};


export default function HomeSection() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleReset = () => {
    if(imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setResult(null);
    setIsLoading(false);
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const processImageFile = (file: File) => {
    if (file) {
      handleReset();
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setIsLoading(true);

      setTimeout(() => {
        const dummyClassifications = ["Kering", "Sedang", "Basah"];
        const randomClassification = dummyClassifications[Math.floor(Math.random() * dummyClassifications.length)];
        const randomAccuracy = (Math.random() * (99.8 - 85.0) + 85.0).toFixed(1);
        setResult({
          classification: randomClassification,
          accuracy: parseFloat(randomAccuracy),
          drynessLevel: Math.floor(Math.random() * 100),
        });
        setIsLoading(false);
      }, 2000);
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

  return (
    <>
      <style>{animationStyles}</style>
      
      <input type="file" ref={galleryInputRef} onChange={handleGalleryImageChange} style={{ display: "none" }} accept="image/*" />
      
      <CameraModal 
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => {
          processImageFile(file);
          setIsCameraOpen(false);
        }}
      />
      
      <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem 2.5rem", background: "linear-gradient(135deg, #f0fdfa 0%, #dcfce7 100%)", overflow: "hidden" }}>
        <div style={{ maxWidth: "1200px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "5rem" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", alignItems: "center", gap: "3rem", width: "100%" }}>
            <div className="fade-in-up" style={{ opacity: 0, animationDelay: "0.2s" }}>
              <h1 style={{ fontSize: "3.8rem", fontWeight: 800, color: "#1a202c", lineHeight: 1.15, letterSpacing: "-2.5px" }}>
                Analisis Kualitas Pisang dengan AI
              </h1>
              <p style={{ fontSize: "1.2rem", color: "#4a5568", margin: "1.5rem 0 2.5rem 0" }}>
                Dapatkan data akurat tentang tingkat kekeringan dan kematangan pisang Anda secara instan menggunakan teknologi AI terdepan.
              </p>
              <button onClick={() => document.getElementById('upload-card')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: "#fbbf24", color: "#422006", fontWeight: 600, border: "none", borderRadius: "12px", padding: "1rem 2rem", fontSize: "1.1rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.75rem", transition: "all 0.3s ease", boxShadow: "0 4px 20px rgba(251, 191, 36, 0.3)"}} onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }} onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }} >
                Mulai Deteksi Sekarang <FiArrowRight />
              </button>
            </div>
            <div className="fade-in-up" style={{ opacity: 0, animationDelay: "0.4s", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
              <div style={{ position: "absolute", width: "100%", height: "100%", maxWidth: "400px", maxHeight: "400px", background: "linear-gradient(135deg, #fbbf24 0%, #ffe066 100%)", borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%", opacity: 0.8, filter: "blur(10px)", animation: "blobMorph 8s ease-in-out infinite alternate", }} ></div>
              <style>{`@keyframes blobMorph { 0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; } 100% { border-radius: 58% 42% 43% 57% / 43% 52% 48% 57%; transform: rotate(15deg); } } `}</style>
              <Image src="/assets/images/pisang_home.png" alt="Pisang yang dianalisis" width={400} height={400} priority={true} style={{ position: "relative", zIndex: 2, width: "100%", height: "auto", maxWidth: "380px", filter: "drop-shadow(0 20px 25px rgba(0,0,0,0.2))", transform: "rotate(-10deg)", }} />
            </div>
          </div>

          <div id="upload-card" className="fade-in-up" style={{ opacity: 0, animationDelay: "0.6s", display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap", width: "100%" }}>
            <div style={{...cardStyle, minWidth: '350px'}}>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#2d3748", marginBottom: "1.5rem" }}>
                Unggah Gambar
              </h3>
              <p style={{ color: "#666", marginBottom: "2rem", minHeight: "40px" }}>
                Pilih gambar pisang dari galeri atau gunakan kamera Anda.
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button onClick={triggerGalleryInput} style={{ flex: 1, background: "#e9edf1", border: "1px solid #d1d9e2", color: "#374151", padding: "0.85rem", borderRadius: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", transition: "all 0.2s ease" }}>
                  <FiUploadCloud size={20} /> Galeri
                </button>
                <button onClick={() => setIsCameraOpen(true)} style={{ flex: 1, background: "#e9edf1", border: "1px solid #d1d9e2", color: "#374151", padding: "0.85rem", borderRadius: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", transition: "all 0.2s ease" }}>
                  <FiCamera size={20} /> Kamera
                </button>
              </div>
            </div>

            <div style={{...cardStyle, minWidth: '350px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "1.5rem"}}>
                <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#2d3748", margin: 0 }}>
                  Hasil Analisis
                </h3>
                {(imagePreview || isLoading) && ( <button onClick={handleReset} title="Ulangi Analisis" style={{background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%'}}><FiRefreshCw size={20} /></button> )}
              </div>
              <div style={{ background: "#e9edf1", borderRadius: "12px", padding: "1rem", minHeight: "182px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #d1d9e2" }}>
                {isLoading ? ( <div style={{ textAlign: 'center', color: '#4a5568' }}> <FiLoader size={32} className="spinner" style={{ margin: '0 auto 0.5rem auto' }}/> <p style={{fontWeight: 500}}>Menganalisis Gambar...</p> </div> ) : imagePreview && result ? ( <div style={{ width: '100%', textAlign: 'left' }}> <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}> <Image src={imagePreview} alt="Preview" width={100} height={100} style={{ borderRadius: '8px', objectFit: 'cover' }} /> <div style={{width: '100%'}}> <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem'}}>Klasifikasi:</p> <span style={{...getBadgeColor(result.classification), padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '1rem', fontWeight: 600}}> {result.classification} </span> <div style={{borderTop: '1px solid #d1d9e2', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between'}}> <p style={{fontSize: '0.9rem', color: '#4a5568', fontWeight: 500}}>Akurasi</p> <p style={{fontSize: '0.9rem', color: '#1e293b', fontWeight: 600}}>{result.accuracy}%</p> </div> </div> </div> </div> ) : ( <p style={{ color: "#718096", fontStyle: "italic" }}> Hasil deteksi akan muncul di sini. </p> )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}