"use client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

const page = () => {
    const router = useRouter();
    const startConsultation = () => {
        router.push("/app/engine/consultation/process");
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="mb-4">
                    Selamat Datang di Halaman Konsultasi BMW E36
                </CardTitle>
                <CardDescription>
                    Konsultasikan masalah POWER LOSS pada BMW E36 Anda di Si
                    Pak-E.
                </CardDescription>
                <CardDescription>
                    Lakukan pergantian SPARE PART BMW Anda di bengkel spesialis
                    BMW atau dengan mekanik PROFESSIONAL.
                </CardDescription>
                <CardDescription>
                    Jika Anda ingin mengganti SPARE PART sendiri. Maka SEGALA
                    KERUSAKAN atau KESALAHAN Pada BMW Anda, Merupakan TANGGUNG
                    JAWAB ANDA.
                </CardDescription>
                <CardDescription>
                    Sistem Ini Dirancang Dengan Bantuan Seorang Pakar : Bang
                    Rizal (Mekanik Bengkel Spesialis BMW. New Jaya Motor,
                    Bintaro Trade Center)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => startConsultation()} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Mulai Konsultasi
                </Button>
            </CardContent>
        </Card>
    );
};

export default page;
