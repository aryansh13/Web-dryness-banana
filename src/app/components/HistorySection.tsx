// src/components/HistorySection.tsx

"use client";

import React from "react";
import Image from "next/image";
import { FiClock, FiTag, FiImage, FiZap, FiTrash2 } from "react-icons/fi";

// Data dummy untuk riwayat prediksi
const dummyHistory = [
  {
    id: 1,
    image: "/assets/images/pisang_dummy_1.jpg", // Ganti dengan path gambar Anda
    result: "Sedang",
    accuracy: 92.5,
    timestamp: "5 Juli 2025, 10:30",
    tags: ["Pisang Ambon", "Grade B"],
  },
  {
    id: 2,
    image: "/assets/images/pisang_dummy_2.jpg", // Ganti dengan path gambar Anda
    result: "Kering",
    accuracy: 98.1,
    timestamp: "4 Juli 2025, 15:45",
    tags: ["Pisang Raja", "Grade A"],
  },
  {
    id: 3,
    image: "/assets/images/pisang_dummy_3.jpg", // Ganti dengan path gambar Anda
    result: "Basah",
    accuracy: 85.3,
    timestamp: "4 Juli 2025, 09:12",
    tags: ["Pisang Kepok", "Grade C"],
  },
];

// Fungsi untuk menentukan warna badge berdasarkan hasil
const getBadgeColor = (result: string) => {
  switch (result) {
    case "Kering":
      return { background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }; // Merah
    case "Sedang":
      return { background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }; // Kuning/Oranye
    case "Basah":
      return { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }; // Hijau
    default:
      return { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" };
  }
};

export default function HistorySection() {
  return (
    <section id="history" style={{ padding: "5rem 2.5rem", background: "#ffffff" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        {/* Judul Section */}
        <h2 style={{
            fontSize: "2.8rem",
            fontWeight: 800,
            color: "#1a202c",
            marginBottom: "1rem",
            letterSpacing: "-1.5px"
          }}
        >
          Riwayat Analisis
        </h2>
        <p style={{ fontSize: "1.1rem", color: "#64748b", maxWidth: "600px", margin: "0 auto 3.5rem auto" }}>
          Lihat kembali semua hasil deteksi yang pernah Anda lakukan. Setiap catatan tersimpan rapi untuk referensi Anda.
        </p>

        {/* Kontainer untuk daftar riwayat */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {dummyHistory.length > 0 ? (
            dummyHistory.map((item, index) => (
              <div
                key={item.id}
                style={{
                  background: `rgba(255, 255, 255, 0.8)`,
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "1.5rem 2rem",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                  textAlign: "left",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`,
                  opacity: 0,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.08)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.05)";
                }}
              >
                {/* Thumbnail Gambar */}
                <div style={{ flexShrink: 0 }}>
                  <Image
                    src={item.image}
                    alt={`Gambar pisang ${item.id}`}
                    width={80}
                    height={80}
                    style={{ borderRadius: "12px", objectFit: "cover" }}
                  />
                </div>

                {/* Info Utama */}
                <div style={{ flex: "1 1 300px" }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{
                        ...getBadgeColor(item.result),
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      {item.result}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiZap size={14} /> {item.accuracy}% Akurasi
                    </span>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#64748b", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiClock size={14} /> {item.timestamp}
                  </div>
                </div>
                
                {/* Tombol Aksi */}
                <div style={{ marginLeft: "auto" }}>
                   <button style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Hapus riwayat"
                   >
                     <FiTrash2 size={18} />
                   </button>
                </div>

              </div>
            ))
          ) : (
            // Pesan jika riwayat kosong
            <div style={{ background: "#fff", padding: "2rem", borderRadius: 12, border: "1px dashed #e2e8f0" }}>
              <p style={{ color: "#64748b" }}>Belum ada riwayat prediksi.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}