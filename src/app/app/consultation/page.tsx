'use client';

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Wrench, CarFront, ArrowLeft, Stethoscope, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PilihKonsultasiPage() {
    const router = useRouter();

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-4">
            {/* Back */}
            <button
                onClick={() => router.push('/app/dashboard')}
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Dashboard
            </button>

            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white mx-auto shadow-lg shadow-blue-600/25">
                    <Stethoscope className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Pilih Modul Konsultasi</h1>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Sistem akan menganalisis gejala dan mendiagnosa kemungkinan masalah pada kendaraan BMW E36 Anda
                </p>
            </div>

            {/* Module Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Engine */}
                <Link href="/app/engine/consultation" className="group">
                    <Card className="h-full border border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                        {/* Accent bar */}
                        <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400 group-hover:h-1.5 transition-all duration-300" />
                        <CardContent className="pt-6 pb-6 flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/20 transition-all duration-300">
                                <Wrench className="h-8 w-8" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    Konsultasi Mesin
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed px-2">
                                    Diagnosa masalah <strong>power loss</strong> pada mesin BMW E36 Anda
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                                <Sparkles className="h-3.5 w-3.5" />
                                Mulai Konsultasi
                            </span>
                        </CardContent>
                    </Card>
                </Link>

                {/* Suspension */}
                <Link href="/app/suspension/consultation" className="group">
                    <Card className="h-full border border-gray-200 hover:border-emerald-400 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 group-hover:h-1.5 transition-all duration-300" />
                        <CardContent className="pt-6 pb-6 flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-600/20 transition-all duration-300">
                                <CarFront className="h-8 w-8" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                    Konsultasi Kaki-Kaki
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed px-2">
                                    Diagnosa masalah <strong>kaki-kaki</strong> pada mobil BMW E36 Anda
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                                <Sparkles className="h-3.5 w-3.5" />
                                Mulai Konsultasi
                            </span>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="mt-0.5 text-blue-500">
                    <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">
                    Sistem akan menanyakan sejumlah gejala dan menghitung kemungkinan masalah menggunakan <strong>metode Certainty Factor</strong>. Proses ini membutuhkan waktu ±2 menit.
                </p>
            </div>
        </div>
    );
}
