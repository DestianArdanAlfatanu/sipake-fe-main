'use client';

import { useEffect, useState } from 'react';
import DateUI from "@/components/dateUI";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import axios from "@/lib/axios";
import { getAssetUrl } from "@/lib/utils";

interface ConsultationHistory {
    id: number;
    consultation_date: string;
    status: string; // "Certainty: 92.50%"
    problem: {
        id: string;
        name: string;
        description: string;
        media: string;
        solution?: {
            id: number;
            solution: string;
        } | null;
    } | null;
}

const SuspensionConsultationHistoriesPage = () => {
    const [histories, setHistories] = useState<ConsultationHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        fetchHistories();
    }, []);

    const fetchHistories = async () => {
        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            const response = await axios.get(
                "/suspension-consultations/histories",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setHistories(response.data.data || []);
        } catch (err: any) {
            setError(err.message);
            console.error("Error fetching suspension histories:", err);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to extract percentage from status
    const getCertaintyPercentage = (status: string): string => {
        const match = status.match(/(\d+\.?\d*)/);
        return match ? `${match[1]}%` : "N/A";
    };

    const getCertaintyValue = (status: string): number => {
        const match = status.match(/(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : 0;
    };

    // Helper function to get badge color based on percentage
    const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const percentage = getCertaintyValue(status);
        if (percentage >= 80) return "default";
        if (percentage >= 60) return "secondary";
        if (percentage >= 40) return "outline";
        return "destructive";
    };

    const getLikelihoodLabel = (status: string): string => {
        const percentage = getCertaintyValue(status);
        if (percentage >= 80) return 'Sangat Mungkin';
        if (percentage >= 60) return 'Kemungkinan Besar';
        if (percentage >= 40) return 'Kemungkinan Sedang';
        if (percentage >= 20) return 'Kemungkinan Kecil';
        return 'Sangat Kecil';
    };

    const getLikelihoodColor = (label: string) => {
        switch (label) {
            case 'Sangat Mungkin': return 'bg-red-100 text-red-800 border-red-300';
            case 'Kemungkinan Besar': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'Kemungkinan Sedang': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Kemungkinan Kecil': return 'bg-blue-100 text-blue-800 border-blue-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">
                        Riwayat Konsultasi Suspensi
                    </CardTitle>
                    <CardDescription>
                        Daftar riwayat konsultasi diagnosa masalah suspensi BMW E36 Anda
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="text-red-500 p-4 border border-red-300 rounded-lg bg-red-50">
                            <p className="font-semibold">Error memuat riwayat:</p>
                            <p>{error}</p>
                        </div>
                    ) : histories.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="text-lg">Belum ada riwayat konsultasi</p>
                            <p className="text-sm mt-2">Mulai konsultasi untuk melihat riwayat di sini</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[60px]">No</TableHead>
                                        <TableHead>Tanggal Konsultasi</TableHead>
                                        <TableHead>Masalah Terdeteksi</TableHead>
                                        <TableHead>Tingkat Keyakinan</TableHead>
                                        <TableHead>Solusi</TableHead>
                                        <TableHead className="w-[100px] text-center">Detail</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {histories.map((history, index) => (
                                        <>
                                            <TableRow key={history.id} className="cursor-pointer hover:bg-blue-50/50" onClick={() => setExpandedId(expandedId === history.id ? null : history.id)}>
                                                <TableCell className="font-medium">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <DateUI date={history.consultation_date} />
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {history.problem?.name || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getBadgeVariant(history.status)}>
                                                        {getCertaintyPercentage(history.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-md text-sm">
                                                    {history.problem?.solution?.solution
                                                        ? history.problem.solution.solution.length > 50
                                                            ? history.problem.solution.solution.substring(0, 50) + '...'
                                                            : history.problem.solution.solution
                                                        : "-"
                                                    }
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setExpandedId(expandedId === history.id ? null : history.id);
                                                        }}
                                                    >
                                                        {expandedId === history.id ? (
                                                            <><ChevronUp className="h-4 w-4 mr-1" /> Tutup</>
                                                        ) : (
                                                            <><ChevronDown className="h-4 w-4 mr-1" /> Detail</>
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>

                                            {/* Expanded Detail Row */}
                                            {expandedId === history.id && history.problem && (
                                                <TableRow key={`detail-${history.id}`}>
                                                    <TableCell colSpan={6} className="bg-slate-50 p-0">
                                                        <div className="p-6 space-y-6">
                                                            {/* Detail Header */}
                                                            <div className="flex items-start gap-4">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-3">
                                                                        <span className="text-3xl font-bold text-muted-foreground">#1</span>
                                                                        <div>
                                                                            <h3 className="text-xl font-bold">{history.problem.name}</h3>
                                                                            <span className="text-sm text-primary">(Diagnosis Utama)</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getLikelihoodColor(getLikelihoodLabel(history.status))}`}>
                                                                            {getLikelihoodLabel(history.status)}
                                                                        </span>
                                                                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-primary text-primary-foreground">
                                                                            {getCertaintyPercentage(history.status)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Problem Image */}
                                                            {history.problem.media && (
                                                                <div className="flex justify-center">
                                                                    <img
                                                                        src={getAssetUrl(`public/images/problems/${history.problem.media}`)}
                                                                        alt={history.problem.name}
                                                                        className="max-w-md h-48 object-contain rounded-lg"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Description */}
                                                            <div>
                                                                <h4 className="font-semibold text-lg mb-2">Penjelasan Masalah</h4>
                                                                <p
                                                                    className="text-muted-foreground"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: history.problem.description || 'Tidak ada deskripsi.',
                                                                    }}
                                                                />
                                                            </div>

                                                            {/* Solution */}
                                                            <div>
                                                                <h4 className="font-semibold text-lg mb-2">Solusi Yang Disarankan</h4>
                                                                {history.problem.solution?.solution ? (
                                                                    <p
                                                                        className="text-muted-foreground"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: history.problem.solution.solution,
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <p className="text-muted-foreground italic">Solusi belum tersedia untuk masalah ini.</p>
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

export default SuspensionConsultationHistoriesPage;
