'use client';

import { useEffect, useState } from 'react';
import DateUI from "@/components/dateUI";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, History, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { getAssetUrl } from "@/lib/utils";

interface ConsultationHistory {
    id: number;
    consultation_date: string;
    status: string;
    problem: {
        id: string;
        name: string;
        description: string;
        picture: string;
        solution?: { id: number; solution: string } | null;
    } | null;
}

const ConsultationHistoriesPage = () => {
    const router = useRouter();
    const [histories, setHistories] = useState<ConsultationHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => { fetchHistories(); }, []);

    const fetchHistories = async () => {
        try {
            const token = document.cookie.split('; ').find((r) => r.startsWith('token='))?.split('=')[1];
            const response = await axios.get("/engine/consultations/histories", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHistories(response.data.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const pct = (s: string) => { const m = s.match(/(\d+\.?\d*)/); return m ? `${m[1]}%` : "N/A"; };
    const pctVal = (s: string) => { const m = s.match(/(\d+\.?\d*)/); return m ? parseFloat(m[1]) : 0; };

    const badge = (s: string): "default" | "secondary" | "destructive" | "outline" => {
        const v = pctVal(s);
        if (v >= 80) return "default";
        if (v >= 60) return "secondary";
        if (v >= 40) return "outline";
        return "destructive";
    };

    const likeLabel = (s: string) => {
        const v = pctVal(s);
        if (v >= 80) return 'Sangat Mungkin';
        if (v >= 60) return 'Kemungkinan Besar';
        if (v >= 40) return 'Kemungkinan Sedang';
        if (v >= 20) return 'Kemungkinan Kecil';
        return 'Sangat Kecil';
    };

    const likeColor = (l: string) => {
        switch (l) {
            case 'Sangat Mungkin': return 'bg-red-50 text-red-700 border-red-200';
            case 'Kemungkinan Besar': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'Kemungkinan Sedang': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Kemungkinan Kecil': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-200 border-t-blue-600" />
                <p className="text-sm text-gray-400">Memuat riwayat...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                onClick={() => router.push('/app/dashboard')}
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Dashboard
            </button>

            <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg font-semibold">Riwayat Konsultasi Mesin</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                        Daftar riwayat diagnosa masalah mesin BMW E36 Anda
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="text-sm text-red-600 p-4 border border-red-200 rounded-lg bg-red-50">
                            <p className="font-semibold">Error memuat riwayat</p>
                            <p className="text-xs mt-1">{error}</p>
                        </div>
                    ) : histories.length === 0 ? (
                        <div className="text-center py-12">
                            <History className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-500">Belum ada riwayat konsultasi</p>
                            <p className="text-xs text-gray-400 mt-1">Mulai konsultasi untuk melihat riwayat di sini</p>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-gray-100 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/80">
                                        <TableHead className="w-[50px] text-xs font-semibold">No</TableHead>
                                        <TableHead className="text-xs font-semibold">Tanggal</TableHead>
                                        <TableHead className="text-xs font-semibold">Masalah</TableHead>
                                        <TableHead className="text-xs font-semibold">Keyakinan</TableHead>
                                        <TableHead className="text-xs font-semibold">Solusi</TableHead>
                                        <TableHead className="w-[90px] text-xs font-semibold text-center">Detail</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {histories.map((h, i) => (
                                        <>
                                            <TableRow
                                                key={h.id}
                                                className="cursor-pointer hover:bg-blue-50/30 transition-colors"
                                                onClick={() => setExpandedId(expandedId === h.id ? null : h.id)}
                                            >
                                                <TableCell className="text-xs font-medium text-gray-500">{i + 1}</TableCell>
                                                <TableCell className="text-xs"><DateUI date={h.consultation_date} /></TableCell>
                                                <TableCell className="text-xs font-semibold text-gray-800">{h.problem?.name || "-"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={badge(h.status)} className="text-[10px]">{pct(h.status)}</Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-gray-600 max-w-[180px] truncate">
                                                    {h.problem?.solution?.solution
                                                        ? h.problem.solution.solution.length > 40
                                                            ? h.problem.solution.solution.substring(0, 40) + '...'
                                                            : h.problem.solution.solution
                                                        : "-"}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="ghost" size="sm"
                                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-xs h-7 px-2"
                                                        onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === h.id ? null : h.id); }}
                                                    >
                                                        {expandedId === h.id
                                                            ? <><ChevronUp className="h-3.5 w-3.5 mr-1" /> Tutup</>
                                                            : <><ChevronDown className="h-3.5 w-3.5 mr-1" /> Detail</>
                                                        }
                                                    </Button>
                                                </TableCell>
                                            </TableRow>

                                            {expandedId === h.id && h.problem && (
                                                <TableRow key={`d-${h.id}`}>
                                                    <TableCell colSpan={6} className="bg-gray-50/50 p-0">
                                                        <div className="p-5 space-y-4">
                                                            <div className="flex items-start gap-3">
                                                                <span className="text-2xl font-bold text-gray-300">#1</span>
                                                                <div>
                                                                    <h3 className="text-base font-bold text-gray-900">{h.problem.name}</h3>
                                                                    <div className="flex gap-2 mt-1">
                                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${likeColor(likeLabel(h.status))}`}>
                                                                            {likeLabel(h.status)}
                                                                        </span>
                                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                                                                            {pct(h.status)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {h.problem.picture && (
                                                                <img
                                                                    src={getAssetUrl(`public/images/problems/${h.problem.picture}`)}
                                                                    alt={h.problem.name}
                                                                    className="max-w-sm h-40 object-contain rounded-lg border border-gray-100"
                                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                                />
                                                            )}

                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">Penjelasan Masalah</h4>
                                                                <p className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: h.problem.description || 'Tidak ada deskripsi.' }} />
                                                            </div>

                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">Solusi yang Disarankan</h4>
                                                                {h.problem.solution?.solution ? (
                                                                    <p className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: h.problem.solution.solution }} />
                                                                ) : (
                                                                    <p className="text-sm text-gray-400 italic">Solusi belum tersedia.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ConsultationHistoriesPage;
