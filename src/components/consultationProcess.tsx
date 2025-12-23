"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Tipe Data
interface Symptom {
  id: string;
  code: string;
  name: string;
  image?: string;
}

interface ConsultResult {
  best_match: {
    problemName: string;
    formattedCertainty: string;
    solution: string;
  } | null;
  total_problems_analyzed: number;
}

interface Props {
  apiBaseUrl?: string; // Default: "/consultations"
}

export default function ConsultationProcess({ apiBaseUrl = "/consultations" }: Props) {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ symptomId: string; userCf: number }[]>([]);
  const [result, setResult] = useState<ConsultResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Ambil Data Gejala
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const token = localStorage.getItem("token");
        // Tentukan URL berdasarkan modul (Engine atau Suspensi)
        let symptomUrl = "http://localhost:5000/engine/symptoms"; // Default Engine
        if (apiBaseUrl.includes("suspension")) {
           symptomUrl = "http://localhost:5000/suspension/symptoms";
        } else if (apiBaseUrl.includes("consultations")) {
           // Fallback untuk engine jika url standar
           symptomUrl = "http://localhost:5000/engine/symptoms"; 
        }

        const response = await axios.get(symptomUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSymptoms(response.data);
      } catch (err) {
        console.error("Gagal ambil gejala:", err);
        setError("Gagal memuat data gejala. Pastikan Backend menyala.");
      }
    };

    fetchSymptoms();
  }, [apiBaseUrl]);

  // 2. Logika Menjawab (Simpan Dulu, Jangan Langsung Kirim)
  const handleAnswer = async (yes: boolean) => {
    const currentSymptom = symptoms[currentIndex];
    
    // Simpan jawaban (1.0 kalau Ya, 0.0 kalau Tidak)
    const newAnswer = { 
      symptomId: currentSymptom.id, 
      userCf: yes ? 1.0 : 0.0 
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    // Cek apakah sudah pertanyaan terakhir?
    if (currentIndex < symptoms.length - 1) {
      setCurrentIndex(currentIndex + 1); // Lanjut next
    } else {
      await submitConsultation(updatedAnswers); // Kirim ke server
    }
  };

  // 3. Kirim Semua Jawaban ke Backend
  const submitConsultation = async (finalAnswers: any[]) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Format payload yang benar: { symptoms: [...] }
      const payload = { symptoms: finalAnswers };

      const response = await axios.post<ConsultResult>(
        `http://localhost:5000${apiBaseUrl}/process`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat memproses diagnosa.");
    } finally {
      setLoading(false);
    }
  };

  // --- TAMPILAN ---

  if (error) return <div className="text-red-500 p-5">{error}</div>;
  if (symptoms.length === 0 && !result) return <div className="p-5 text-white">Memuat gejala...</div>;

  // Tampilan Hasil
  if (result) {
    return (
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg text-white mt-10">
        <h2 className="text-2xl font-bold mb-4 text-green-400">Hasil Diagnosa</h2>
        
        {result.best_match ? (
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-xl font-bold">{result.best_match.problemName}</h3>
              <p className="text-blue-400 font-bold mt-1">Kemungkinan: {result.best_match.formattedCertainty}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400">Solusi:</p>
              <p className="mt-1">{result.best_match.solution}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-700 rounded">
            <p>Tidak ditemukan masalah yang cocok. Kondisi aman atau data kurang lengkap.</p>
          </div>
        )}

        <button 
          onClick={() => window.location.reload()}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold"
        >
          Konsultasi Ulang
        </button>
      </div>
    );
  }

  // Tampilan Pertanyaan
  const currentSymptom = symptoms[currentIndex];
  // Fix URL Gambar (tambah localhost:5000)
  const imageUrl = currentSymptom.image 
    ? `http://localhost:5000/${currentSymptom.image.replace(/\\/g, '/')}` 
    : null;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Proses Konsultasi</h2>
        <span className="text-sm bg-gray-700 px-3 py-1 rounded">
          {currentIndex + 1} / {symptoms.length}
        </span>
      </div>

      <div className="bg-black aspect-video rounded-lg mb-6 flex items-center justify-center overflow-hidden border border-gray-700">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={currentSymptom.name} 
            className="h-full w-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <p className="text-gray-500">Tidak ada gambar</p>
        )}
      </div>

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold">{currentSymptom.name}</h3>
        <p className="text-gray-400 mt-2">{currentSymptom.code}</p>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => handleAnswer(true)}
          disabled={loading}
          className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition w-32"
        >
          Ya
        </button>
        <button
          onClick={() => handleAnswer(false)}
          disabled={loading}
          className="px-8 py-3 bg-red-900/80 text-white font-bold rounded hover:bg-red-900 transition w-32 border border-red-700"
        >
          Tidak
        </button>
      </div>
    </div>
  );
}