"use client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import axios from "@/lib/axios";
import { Response } from "@/types/api.dt";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getAssetUrl } from "@/lib/utils";
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
        solution: {
            id: string;
            name: string;
        };
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
        // Legacy support (will be removed)
        problem?: {
            id: string;
            name: string;
            description: string;
            picture: string;
            solution: {
                id: string;
                name: string;
            };
        };
    };
}
interface Props {
    token: string;
    apiBaseUrl: string;
    historyRoute: string; // e.g., "/app/engine/consultation/history"
}
const ConsultationProcessComp: React.FC<Props> = ({ token, apiBaseUrl, historyRoute }) => {
    const [status, setStatus] = useState<ConsultResult["status"]>();
    const [symptom, setSymptom] = useState<Symptom>();
    const [rankings, setRankings] = useState<ProblemRanking[]>();
    const router = useRouter();
    useEffect(() => {
        startConsultation();
    }, []);

    const startConsultation = async () => {
        setStatus(undefined);
        setRankings(undefined);
        setSymptom(undefined);
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
        } else if (data.status === "Result") {
            // New: Handle rankings array
            if (data.data.rankings) {
                setRankings(data.data.rankings);
            }
        }
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="mb-4">
                    {status == "Result"
                        ? "Hasil Konsultasi"
                        : status == "Continue"
                            ? "Proses Konsultasi"
                            : status == "NeverHadAProblem"
                                ? "Hasil Konsultasi"
                                : status == "ProblemNotFound"
                                    ? "Hasil Konsultasi"
                                    : "Proses Konsultasi"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {status == "NeverHadAProblem" ? (
                    <>
                        <CardTitle>
                            Selamat! BMW E36 Anda tidak mengalami masalah.
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => startConsultation()}
                                className="mt-4"
                            >
                                Mulai Konsultasi Baru
                            </Button>
                            <Button
                                variant={"secondary"}
                                onClick={() =>
                                    router.push(historyRoute)
                                }
                                className="mt-4"
                            >
                                Lihat Riwayat Konsultasi
                            </Button>
                        </div>
                    </>
                ) : status == "ProblemNotFound" ? (
                    <>
                        <CardTitle className="text-red-500">
                            Maaf! Sistem kami tidak dapat mengidentifikasi
                            masalah yang terjadi pada BMW E36 Anda.
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => startConsultation()}
                                className="mt-4"
                            >
                                Mulai Konsultasi Baru
                            </Button>
                            <Button
                                variant={"secondary"}
                                onClick={() =>
                                    router.push(historyRoute)
                                }
                                className="mt-4"
                            >
                                Lihat Riwayat Konsultasi
                            </Button>
                        </div>
                    </>
                ) : status == "Result" ? (
                    <>
                        {rankings && rankings.length > 0 && (
                            <div className="space-y-6">
                                <CardTitle className="text-2xl">
                                    Hasil Diagnosa - Ranking Kemungkinan Masalah
                                </CardTitle>
                                <p className="text-muted-foreground">
                                    Berdasarkan gejala yang Anda alami, berikut adalah kemungkinan masalah yang terdeteksi (diurutkan dari yang paling mungkin):
                                </p>

                                {/* Ranking Table */}
                                <div className="space-y-4">
                                    {rankings.map((ranking, index) => {
                                        const isTopResult = index === 0;
                                        const getLikelihoodColor = (likelihood: string) => {
                                            switch (likelihood) {
                                                case 'Sangat Mungkin': return 'bg-red-100 text-red-800 border-red-300';
                                                case 'Kemungkinan Besar': return 'bg-orange-100 text-orange-800 border-orange-300';
                                                case 'Kemungkinan Sedang': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
                                                case 'Kemungkinan Kecil': return 'bg-blue-100 text-blue-800 border-blue-300';
                                                default: return 'bg-gray-100 text-gray-800 border-gray-300';
                                            }
                                        };

                                        return (
                                            <Card
                                                key={ranking.problem.id}
                                                className={`${isTopResult ? 'border-2 border-primary shadow-lg' : 'border'}`}
                                            >
                                                <CardHeader>
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="text-3xl font-bold text-muted-foreground">
                                                                    #{index + 1}
                                                                </span>
                                                                <div>
                                                                    <CardTitle className="text-xl">
                                                                        {ranking.problem.name}
                                                                        {isTopResult && (
                                                                            <span className="ml-2 text-sm font-normal text-primary">
                                                                                (Diagnosis Utama)
                                                                            </span>
                                                                        )}
                                                                    </CardTitle>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 mt-2">
                                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getLikelihoodColor(ranking.likelihood)}`}>
                                                                    {ranking.likelihood}
                                                                </span>
                                                                <span className="px-3 py-1 rounded-full text-sm font-bold bg-primary text-primary-foreground">
                                                                    {ranking.percentage}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {/* Image */}
                                                        <img
                                                            src={getAssetUrl(`public/images/problems/${ranking.problem.picture}`)}
                                                            alt={ranking.problem.name}
                                                            className="w-full max-w-md h-48 object-contain rounded-lg mx-auto"
                                                        />

                                                        {/* Description */}
                                                        <div>
                                                            <h4 className="font-semibold text-lg mb-2">
                                                                Penjelasan Masalah
                                                            </h4>
                                                            <p
                                                                className="text-muted-foreground"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: ranking.problem.description,
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Solution */}
                                                        <div>
                                                            <h4 className="font-semibold text-lg mb-2">
                                                                Solusi Yang Disarankan
                                                            </h4>
                                                            <p
                                                                className="text-muted-foreground"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: ranking.problem.solution.name,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-4">
                                    <Button
                                        onClick={() => startConsultation()}
                                        className="mt-4"
                                    >
                                        Mulai Konsultasi Baru
                                    </Button>
                                    <Button
                                        variant={"secondary"}
                                        onClick={() =>
                                            router.push(historyRoute)
                                        }
                                        className="mt-4"
                                    >
                                        Lihat Riwayat Konsultasi
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {symptom ? (
                            <div className="flex flex-col gap-4 items-center">
                                <img
                                    src={getAssetUrl(`public/images/symptoms/${symptom.picture}`)}
                                    alt={symptom.name}
                                    className="w-full h-48 object-contain rounded-lg"
                                />
                                <CardDescription className="max-w-lg text-center">
                                    {symptom.name}
                                </CardDescription>
                                <div className="flex gap-4">
                                    <Button onClick={() => consult(true)}>
                                        Ya
                                    </Button>
                                    <Button
                                        onClick={() => consult(false)}
                                        variant={"destructive"}
                                    >
                                        Tidak
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default ConsultationProcessComp;
