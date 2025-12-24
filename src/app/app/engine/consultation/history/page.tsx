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
import axios from "@/lib/axios";
import { Response } from "@/types/api.dt";
import { cookies } from "next/headers";

interface ConsultationHistory {
    id: number;
    consultation_date: string;
    status: string; // "Certainty: 92.50%"
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
}

const ConsultationHistoriesPage = async () => {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    let histories: ConsultationHistory[] = [];
    let error = null;

    try {
        const response = await axios.get<Response<ConsultationHistory[]>>(
            "/engine/consultations/histories",
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        histories = response.data.data;
    } catch (err: any) {
        error = err.message;
        console.error("Error fetching histories:", err);
    }

    // Helper function to extract percentage from status
    const getCertaintyPercentage = (status: string): string => {
        const match = status.match(/(\d+\.?\d*)/);
        return match ? `${match[1]}%` : "N/A";
    };

    // Helper function to get badge color based on percentage
    const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const match = status.match(/(\d+\.?\d*)/);
        if (!match) return "secondary";

        const percentage = parseFloat(match[1]);
        if (percentage >= 80) return "default"; // High certainty
        if (percentage >= 60) return "secondary"; // Medium-high
        if (percentage >= 40) return "outline"; // Medium
        return "destructive"; // Low certainty
    };

    return (
        <div className="flex flex-col gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">
                        Riwayat Konsultasi Mesin
                    </CardTitle>
                    <CardDescription>
                        Daftar riwayat konsultasi diagnosa masalah mesin BMW E36 Anda
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">No</TableHead>
                                    <TableHead>Tanggal Konsultasi</TableHead>
                                    <TableHead>Masalah Terdeteksi</TableHead>
                                    <TableHead>Tingkat Keyakinan</TableHead>
                                    <TableHead>Solusi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {histories.map((history, index) => (
                                    <TableRow key={history.id}>
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
                                        <TableCell
                                            className="max-w-md"
                                            dangerouslySetInnerHTML={{
                                                __html: history.problem?.solution?.name || "-",
                                            }}
                                        />
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ConsultationHistoriesPage;
