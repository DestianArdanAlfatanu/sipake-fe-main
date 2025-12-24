import { Card, CardContent } from "@/components/ui/card";
import axios from "@/lib/axios";
import { Response, User } from "@/types/api.dt";
import { cookies } from "next/headers";
import React from "react";

const DashboardPage = async () => {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const {
        data: { data: user },
    } = await axios.get<Response<User>>("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
    });

    // Fetch both Engine and Suspension consultation histories
    let engineHistories: any[] = [];
    let suspensionHistories: any[] = [];

    try {
        const engineResponse = await axios.get<Response<any[]>>("/engine/consultations/histories", {
            headers: { Authorization: `Bearer ${token}` },
        });
        engineHistories = engineResponse.data.data || [];
    } catch (error) {
        console.log("Engine consultation histories not available");
        engineHistories = [];
    }

    try {
        const suspensionResponse = await axios.get<Response<any[]>>("/suspension-consultations/histories", {
            headers: { Authorization: `Bearer ${token}` },
        });
        suspensionHistories = suspensionResponse.data.data || [];
    } catch (error) {
        console.log("Suspension consultation histories not available");
        suspensionHistories = [];
    }

    // Calculate total consultations from both modules
    const totalConsultations = engineHistories.length + suspensionHistories.length;

    return (
        <div className="grid grid-cols-4 gap-4">
            <Card className="pt-6 bg-white/[.05]">
                <CardContent className="flex flex-col gap-6">
                    <h1 className="text-xl font-bold">
                        {user.carSeries?.series_id || "-"}
                    </h1>
                    <p>Seri Mobil</p>
                </CardContent>
            </Card>
            <Card className="pt-6 bg-white/[.05]">
                <CardContent className="flex flex-col gap-6">
                    <h1 className="text-xl font-bold">
                        {user.engineCode?.code || "-"}
                    </h1>
                    <p>Kode Mesin</p>
                </CardContent>
            </Card>
            <Card className="pt-6 bg-white/[.05]">
                <CardContent className="flex flex-col gap-6">
                    <h1 className="text-xl font-bold">{user.plateNumber || "-"}</h1>
                    <p>Nomor Polisi Kendaraan</p>
                </CardContent>
            </Card>
            <Card className="pt-6 bg-white/[.05]">
                <CardContent className="flex flex-col gap-6">
                    <h1 className="text-xl font-bold">
                        {totalConsultations}
                    </h1>
                    <p>Total Konsultasi</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardPage;
