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

const SuspensionPage = () => {
    const router = useRouter();
    
    const startConsultation = () => {
        // Arahkan ke proses konsultasi suspensi (nanti kita buat folder 'process'-nya)
        router.push("/app/suspension/consultation/process");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="mb-4">
                    Konsultasi Masalah Suspensi & Kaki-Kaki
                </CardTitle>
                <CardDescription>
                    Deteksi dini masalah bunyi, limbung, atau getaran pada BMW E36 Anda.
                </CardDescription>
                <CardDescription>
                    Penting: Cek fisik visual (kebocoran shock, karet bushing pecah) 
                    sangat disarankan sebelum diagnosa sistem.
                </CardDescription>
                <CardDescription>
                    Sistem Ini Dirancang Dengan Bantuan Pakar BMW
                    : Om Rizal (Mekanik Bengkel Spesialis BMW. New Jaya Motor, Bintaro Trade Center)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => startConsultation()} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Mulai Diagnosa Suspensi
                </Button>
            </CardContent>
        </Card>
    );
};

export default SuspensionPage;