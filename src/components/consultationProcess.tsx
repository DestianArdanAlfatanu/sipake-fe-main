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
interface Symptom {
    id: string;
    name: string;
    picture: string;
}
interface ConsultResult {
    status: "Continue" | "Result" | "ProblemNotFound" | "NeverHadAProblem";
    data: {
        symptom: Symptom;
        id: string;
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
    };
}
interface Props {
    token: string;
}
const ConsultationProcessComp: React.FC<Props> = ({ token }) => {
    const [status, setStatus] = useState<ConsultResult["status"]>();
    const [symptom, setSymptom] = useState<Symptom>();
    const [result, setResult] = useState<ConsultResult["data"]["problem"]>();
    const router = useRouter();
    useEffect(() => {
        startConsultation();
    }, []);

    const startConsultation = async () => {
        setStatus(undefined);
        setResult(undefined);
        setSymptom(undefined);
        const response = await axios.post<Response<Symptom>>(
            "/consultations/start",
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setSymptom(response.data.data);
    };

    const consult = async (yes: boolean) => {
        const response = await axios.post<Response<ConsultResult>>(
            "/consultations/process",
            { symptom_id: symptom!.id, yes },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data.data;
        setStatus(data.status);
        if (data.status === "Continue") {
            setSymptom(response.data.data.data.symptom);
        } else if (data.status === "Result") {
            setResult(data.data.problem);
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
                            Selamat! Mesin BMW E36 Anda tidak mengalami masalah
                            power loss.
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
                                    router.push("/app/consultation/history")
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
                                    router.push("/app/consultation/history")
                                }
                                className="mt-4"
                            >
                                Lihat Riwayat Konsultasi
                            </Button>
                        </div>
                    </>
                ) : status == "Result" ? (
                    <>
                        {" "}
                        {result && (
                            <>
                                <CardTitle className="my-2">
                                    BMW E36 Anda mengalami power loss yang
                                    disebabkan karena masalah pada :
                                </CardTitle>
                                <CardTitle className="my-2">
                                    {result.name}
                                </CardTitle>
                                <img
                                    src={`http://localhost:5000/public/images/problems/${result.picture}`}
                                    alt={result.name}
                                    className="w-64 h-64 object-contain rounded-lg"
                                />
                                <CardTitle className="my-2">
                                    Penjelasan Masalah
                                </CardTitle>
                                <p
                                    dangerouslySetInnerHTML={{
                                        __html: result.description,
                                    }}
                                />{" "}
                                <CardTitle className="my-2">
                                    Solusi Dari Permasalahan Yang Dialami
                                </CardTitle>
                                <p
                                    dangerouslySetInnerHTML={{
                                        __html: result.solution.name,
                                    }}
                                />{" "}
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
                                            router.push(
                                                "/app/consultation/history"
                                            )
                                        }
                                        className="mt-4"
                                    >
                                        Lihat Riwayat Konsultasi
                                    </Button>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {symptom ? (
                            <div className="flex flex-col gap-4 items-center">
                                <img
                                    src={`http://localhost:5000/public/images/symptoms/${symptom.picture}`}
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
