"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "@/lib/axios";
import { Response } from "@/types/api.dt";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getAssetUrl } from "@/lib/utils";
import {
    CheckCircle2,
    XCircle,
    RotateCcw,
    History,
    Sparkles,
    AlertTriangle,
    ShieldCheck,
    Loader2,
} from "lucide-react";

interface Symptom {
    id: string;
    name: string;
    picture: string;
}

interface ProblemRanking {
    problem: {
        id: string;
        name: string;
        description: string;
        picture: string;
        solution?: { id: number; solution: string } | null;
    };
    certainty: number;
    percentage: string;
    likelihood: string;
}

interface ConsultResult {
    status: "Continue" | "Result" | "ProblemNotFound" | "NeverHadAProblem";
    data: {
        symptom?: Symptom;
        id?: string;
        rankings?: ProblemRanking[];
        problem?: {
            id: string;
            name: string;
            description: string;
            picture: string;
            solution?: { id: number; solution: string } | null;
        };
    };
}

interface Props {
    token: string;
    apiBaseUrl: string;
    historyRoute: string;
}

const ConsultationProcessComp: React.FC<Props> = ({ token, apiBaseUrl, historyRoute }) => {
    const [status, setStatus] = useState<ConsultResult["status"]>();
    const [symptom, setSymptom] = useState<Symptom>();
    const [rankings, setRankings] = useState<ProblemRanking[]>();
    const [questionNumber, setQuestionNumber] = useState(1);
    const [imgVisible, setImgVisible] = useState(true);
    const router = useRouter();

    // Reset image visibility setiap kali symptom berubah
    useEffect(() => {
        setImgVisible(true);
    }, [symptom?.id]);

    useEffect(() => { startConsultation(); }, []);

    const startConsultation = async () => {
        setStatus(undefined);
        setRankings(undefined);
        setSymptom(undefined);
        setQuestionNumber(1);
        setImgVisible(true);
        const response = await axios.get<Response<Symptom>>(
            `${apiBaseUrl}/start`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setSymptom(response.data.data);
    };

    const consult = async (yes: boolean) => {
        const response = await axios.post<Response<ConsultResult>>(
            `${apiBaseUrl}/process`,
            { symptom_id: symptom!.id, yes },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = response.data.data;
        setStatus(data.status);
        if (data.status === "Continue") {
            setSymptom(response.data.data.data.symptom);
            setQuestionNumber((n) => n + 1);
        } else if (data.status === "Result") {
            if (data.data.rankings) setRankings(data.data.rankings);
        }
    };

    const getLikeColor = (l: string) => {
        switch (l) {
            case 'Sangat Mungkin': return 'bg-red-50 text-red-700 border-red-200';
            case 'Kemungkinan Besar': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'Kemungkinan Sedang': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Kemungkinan Kecil': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    /* ─── Loading ─── */
    if (!symptom && !status) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-400">Memuat pertanyaan...</p>
            </div>
        );
    }

    /* ─── No Problem ─── */
    if (status === "NeverHadAProblem") {
        return (
            <div className="max-w-xl mx-auto py-8">
                <Card className="border border-gray-200 shadow-sm overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-400" />
                    <CardContent className="pt-8 pb-8 text-center space-y-5">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-gray-900">Kendaraan Anda Baik-Baik Saja! 🎉</h2>
                            <p className="text-sm text-gray-500">Berdasarkan gejala yang Anda jawab, BMW E36 Anda tidak mengalami masalah yang terdeteksi oleh sistem.</p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <Button onClick={startConsultation} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                <RotateCcw className="h-4 w-4" /> Konsultasi Baru
                            </Button>
                            <Button variant="outline" onClick={() => router.push(historyRoute)} className="gap-2">
                                <History className="h-4 w-4" /> Lihat Riwayat
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    /* ─── Problem Not Found ─── */
    if (status === "ProblemNotFound") {
        return (
            <div className="max-w-xl mx-auto py-8">
                <Card className="border border-gray-200 shadow-sm overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-amber-500 to-amber-400" />
                    <CardContent className="pt-8 pb-8 text-center space-y-5">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-gray-900">Masalah Tidak Teridentifikasi</h2>
                            <p className="text-sm text-gray-500">Maaf, sistem tidak dapat mengidentifikasi masalah berdasarkan gejala yang Anda jawab. Silakan coba lagi atau konsultasikan langsung ke bengkel.</p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <Button onClick={startConsultation} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                <RotateCcw className="h-4 w-4" /> Konsultasi Baru
                            </Button>
                            <Button variant="outline" onClick={() => router.push(historyRoute)} className="gap-2">
                                <History className="h-4 w-4" /> Lihat Riwayat
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    /* ─── Result / Rankings ─── */
    if (status === "Result" && rankings && rankings.length > 0) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 py-4">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto shadow-lg shadow-blue-600/20">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Hasil Diagnosa</h1>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Berdasarkan gejala yang Anda alami, berikut kemungkinan masalah yang terdeteksi:
                    </p>
                </div>

                {/* Ranking Cards */}
                <div className="space-y-4">
                    {rankings.map((ranking, index) => {
                        const isTop = index === 0;
                        return (
                            <Card
                                key={ranking.problem.id}
                                className={`border shadow-sm overflow-hidden ${isTop ? 'border-blue-300 shadow-md' : 'border-gray-200'}`}
                            >
                                {isTop && <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400" />}
                                <CardContent className="pt-5 pb-5 space-y-4">
                                    {/* Header row */}
                                    <div className="flex items-start gap-3">
                                        <span className={`text-2xl font-bold ${isTop ? 'text-blue-600' : 'text-gray-300'}`}>#{index + 1}</span>
                                        <div className="flex-1">
                                            <h3 className="text-base font-bold text-gray-900">
                                                {ranking.problem.name}
                                                {isTop && <span className="ml-2 text-xs font-medium text-blue-600">(Diagnosis Utama)</span>}
                                            </h3>
                                            <div className="flex gap-2 mt-1.5">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getLikeColor(ranking.likelihood)}`}>
                                                    {ranking.likelihood}
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                                                    {ranking.percentage}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image */}
                                    {ranking.problem.picture && (
                                        <img
                                            src={getAssetUrl(`public/images/problems/${ranking.problem.picture}`)}
                                            alt={ranking.problem.name}
                                            className="max-w-sm h-40 object-contain rounded-lg border border-gray-100 mx-auto"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    )}

                                    {/* Description */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">Penjelasan Masalah</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: ranking.problem.description }} />
                                    </div>

                                    {/* Solution */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">Solusi yang Disarankan</h4>
                                        {ranking.problem.solution?.solution ? (
                                            <p className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: ranking.problem.solution.solution }} />
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">Solusi belum tersedia.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-3 pt-2">
                    <Button onClick={startConsultation} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <RotateCcw className="h-4 w-4" /> Konsultasi Baru
                    </Button>
                    <Button variant="outline" onClick={() => router.push(historyRoute)} className="gap-2">
                        <History className="h-4 w-4" /> Lihat Riwayat
                    </Button>
                </div>
            </div>
        );
    }

    /* ─── Symptom Question (default / Continue) ─── */
    return (
        <div className="max-w-xl mx-auto py-4">
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-blue-600 to-blue-400" />
                <CardContent className="pt-6 pb-6 space-y-6">
                    {/* Progress indicator */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Proses Konsultasi</span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            Pertanyaan #{questionNumber}
                        </span>
                    </div>

                    {/* Question */}
                    <div className="text-center space-y-2">
                        <p className="text-sm font-medium text-gray-700">Apakah Anda mengalami gejala berikut?</p>
                    </div>

                    {/* Symptom Image + Question + Buttons */}
                    {symptom && (
                        <>
                            {/* Symptom Image — hanya tampil jika ada picture DAN belum error */}
                            {symptom.picture && imgVisible && (
                                <div className="flex justify-center">
                                    <div className="rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
                                        <img
                                            key={symptom.id}
                                            src={getAssetUrl(`public/images/symptoms/${symptom.picture}`)}
                                            alt={symptom.name}
                                            className="w-full max-w-sm h-44 object-contain rounded-lg"
                                            onError={() => setImgVisible(false)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Symptom name */}
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-800 leading-relaxed max-w-md mx-auto">
                                    {symptom.name}
                                </p>
                            </div>

                            {/* Yes / No Buttons */}
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    onClick={() => consult(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all gap-2"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Ya
                                </Button>
                                <Button
                                    onClick={() => consult(false)}
                                    variant="outline"
                                    className="border-gray-300 text-white hover:bg-gray-100 px-8 py-2.5 rounded-lg transition-all gap-2"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Tidak
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ConsultationProcessComp;
