import DateUI from "@/components/dateUI";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import axios from "@/lib/axios";
import { Response } from "@/types/api.dt";
import { cookies } from "next/headers";

interface ConsultationHistory {
    id: number;
    consultation_date: string;
    status:
        | "Masalah Teridentifikasi"
        | "Masalah Tidak Teridentifikasi"
        | "Tidak Ada Masalah";
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
    const response = await axios.get<Response<ConsultationHistory[]>>(
        "/consultations/histories",
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    const histories = response.data.data;
    console.log({ histories });
    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-4xl text-white font-semibold">
                Riwayat Konsultasi
            </h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Nama Masalah</TableHead>
                        <TableHead>Solusi</TableHead>
                        <TableHead>Tanggal Konsultasi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {histories.map(
                        ({ id, consultation_date, problem, status }) => (
                            <TableRow key={id}>
                                <TableCell>{status}</TableCell>
                                <TableCell>
                                    {status == "Masalah Teridentifikasi"
                                        ? problem.name
                                        : "-"}
                                </TableCell>
                                <TableCell
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            status == "Masalah Teridentifikasi"
                                                ? problem.solution.name
                                                : "-",
                                    }}
                                ></TableCell>
                                <TableCell>
                                    <DateUI date={consultation_date} />
                                </TableCell>
                            </TableRow>
                        )
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default ConsultationHistoriesPage;
