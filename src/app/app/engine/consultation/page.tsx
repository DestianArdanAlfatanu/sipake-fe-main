"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Wrench, ShieldCheck, UserCheck, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";

const EngineConsultationPage = () => {
    const router = useRouter();

    return (
        <div className="max-w-2xl mx-auto space-y-6 py-4">
            <button
                onClick={() => router.push('/app/consultation')}
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali
            </button>

            <Card className="border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-blue-600 to-blue-400" />
                <CardContent className="pt-8 pb-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white mx-auto shadow-lg shadow-blue-600/20">
                            <Wrench className="h-7 w-7" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Konsultasi Masalah Mesin
                        </h1>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            Diagnosa masalah <strong>power loss</strong> pada mesin BMW E36 Anda menggunakan metode Certainty Factor
                        </p>
                    </div>

                    {/* Info items */}
                    <div className="space-y-3 max-w-md mx-auto">
                        <InfoItem
                            icon={<ShieldCheck className="h-4 w-4 text-blue-600" />}
                            text="Lakukan pergantian spare part di bengkel spesialis BMW atau dengan mekanik profesional."
                        />
                        <InfoItem
                            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                            text="Jika Anda mengganti spare part sendiri, segala kerusakan menjadi tanggung jawab Anda."
                        />
                        <InfoItem
                            icon={<UserCheck className="h-4 w-4 text-emerald-600" />}
                            text="Sistem dirancang dengan bantuan pakar: Bang Rizal (Mekanik Bengkel Spesialis BMW, New Jaya Motor, Bintaro Trade Center)."
                        />
                    </div>

                    {/* CTA */}
                    <div className="text-center pt-2">
                        <Button
                            onClick={() => router.push("/app/engine/consultation/process")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all"
                        >
                            Mulai Konsultasi
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

function InfoItem({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className="mt-0.5 shrink-0">{icon}</div>
            <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
        </div>
    );
}

export default EngineConsultationPage;
