import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import axios from "@/lib/axios";
import { Response, User } from "@/types/api.dt";
import { cookies } from "next/headers";
import Link from "next/link";
import React from "react";
import {
    Wrench,
    CarFront,
    ClipboardList,
    UserCircle,
    BarChart3,
    AlertTriangle,
    ChevronRight,
    Settings2,
    Stethoscope,
    History,
} from "lucide-react";

const DashboardPage = async () => {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    const {
        data: { data: user },
    } = await axios.get<Response<User>>("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
    });

    let engineHistories: any[] = [];
    let suspensionHistories: any[] = [];

    try {
        const engineResponse = await axios.get<Response<any[]>>("/engine/consultations/histories", {
            headers: { Authorization: `Bearer ${token}` },
        });
        engineHistories = engineResponse.data.data || [];
    } catch {
        engineHistories = [];
    }

    try {
        const suspensionResponse = await axios.get<Response<any[]>>("/suspension-consultations/histories", {
            headers: { Authorization: `Bearer ${token}` },
        });
        suspensionHistories = suspensionResponse.data.data || [];
    } catch {
        suspensionHistories = [];
    }

    const totalConsultations = engineHistories.length + suspensionHistories.length;
    const engineCount = engineHistories.length;
    const suspensionCount = suspensionHistories.length;

    const calcTopProblems = (histories: any[]) => {
        const counts: Record<string, { name: string; count: number }> = {};
        histories.forEach((h: any) => {
            const name = h.problem?.name || h.problem_id;
            if (name) {
                if (!counts[name]) counts[name] = { name, count: 0 };
                counts[name].count++;
            }
        });
        return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
    };

    const topEngineProblems = calcTopProblems(engineHistories);
    const topSuspensionProblems = calcTopProblems(suspensionHistories);

    return (
        <div className="space-y-8">
            {/* Page Header + CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Selamat Datang, {user.name}! 👋
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Pantau informasi kendaraan dan riwayat konsultasi Anda
                    </p>
                </div>
                <Link
                    href="/app/consultation"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all"
                >
                    <Stethoscope className="h-4 w-4" />
                    Mulai Konsultasi
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard
                    label="Kode Mesin"
                    value={user.engineCode?.code || "-"}
                    sub="BMW E36 Engine"
                    icon={<Settings2 className="h-6 w-6" />}
                    color="blue"
                />
                <StatCard
                    label="Nomor Kendaraan"
                    value={user.plateNumber || "-"}
                    sub="Plat Nomor Polisi"
                    icon={<CarFront className="h-6 w-6" />}
                    color="emerald"
                />
                <StatCard
                    label="Total Konsultasi"
                    value={String(totalConsultations)}
                    sub={`${engineCount} mesin · ${suspensionCount} kaki-kaki`}
                    icon={<ClipboardList className="h-6 w-6" />}
                    color="violet"
                />
            </div>

            {/* Consultation by Module */}
            <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base font-semibold">Konsultasi per Modul</CardTitle>
                    </div>
                    <CardDescription className="text-xs">Distribusi konsultasi Mesin dan Kaki-Kaki</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ProgressRow
                        icon={<Wrench className="h-4 w-4" />}
                        label="Mesin (Engine)"
                        count={engineCount}
                        total={totalConsultations}
                        color="blue"
                    />
                    <ProgressRow
                        icon={<CarFront className="h-4 w-4" />}
                        label="Kaki-Kaki (Undercarriage)"
                        count={suspensionCount}
                        total={totalConsultations}
                        color="emerald"
                    />
                    {totalConsultations === 0 && (
                        <p className="text-xs text-gray-400 text-center pt-1">Belum ada data konsultasi</p>
                    )}
                </CardContent>
            </Card>

            {/* Top Problems – Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <TopProblemsCard
                    title="Masalah Mesin Teratas"
                    description="Masalah mesin yang paling sering terdiagnosis"
                    problems={topEngineProblems}
                    icon={<Wrench className="h-5 w-5 text-blue-600" />}
                    emptyIcon={<Wrench className="h-8 w-8" />}
                    color="blue"
                />
                <TopProblemsCard
                    title="Masalah Kaki-Kaki Teratas"
                    description="Masalah kaki-kaki yang paling sering terdiagnosis"
                    problems={topSuspensionProblems}
                    icon={<AlertTriangle className="h-5 w-5 text-emerald-600" />}
                    emptyIcon={<CarFront className="h-8 w-8" />}
                    color="emerald"
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Aksi Cepat</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <QuickAction
                        href="/app/engine/consultation/history"
                        icon={<History className="h-5 w-5" />}
                        title="Riwayat Mesin"
                        desc="Lihat riwayat konsultasi mesin"
                        color="blue"
                    />
                    <QuickAction
                        href="/app/suspension/consultation/history"
                        icon={<History className="h-5 w-5" />}
                        title="Riwayat Kaki-Kaki"
                        desc="Lihat riwayat konsultasi kaki-kaki"
                        color="emerald"
                    />
                    <QuickAction
                        href="/app/my-account"
                        icon={<UserCircle className="h-5 w-5" />}
                        title="Informasi Akun"
                        desc="Lihat profil dan data akun"
                        color="violet"
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

/* ───── Sub-components ───── */

const palette: Record<string, { bg: string; text: string; ring: string; bar: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100", bar: "bg-blue-500" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100", bar: "bg-emerald-500" },
    violet: { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100", bar: "bg-violet-500" },
};

function StatCard({ label, value, sub, icon, color }: {
    label: string; value: string; sub: string; icon: React.ReactNode; color: string;
}) {
    const c = palette[color] || palette.blue;
    return (
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                        <h3 className="text-xl font-bold text-gray-900">{value}</h3>
                        <p className="text-[11px] text-gray-400">{sub}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${c.bg} ${c.text}`}>{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}

function ProgressRow({ icon, label, count, total, color }: {
    icon: React.ReactNode; label: string; count: number; total: number; color: string;
}) {
    const c = palette[color] || palette.blue;
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <div className={`flex items-center gap-2 ${c.text}`}>
                    {icon}
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                <span className={`text-sm font-semibold ${c.text}`}>{count} konsultasi</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`${c.bar} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function TopProblemsCard({ title, description, problems, icon, emptyIcon, color }: {
    title: string; description: string;
    problems: { name: string; count: number }[];
    icon: React.ReactNode; emptyIcon: React.ReactNode; color: string;
}) {
    const c = palette[color] || palette.blue;
    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    {icon}
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                </div>
                <CardDescription className="text-xs">{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {problems.length > 0 ? (
                    <div className="space-y-2">
                        {problems.map((p, i) => (
                            <div key={p.name} className={`flex items-center justify-between p-2 rounded-lg hover:${c.bg} transition-colors`}>
                                <div className="flex items-center gap-2.5">
                                    <span className={`w-6 h-6 rounded-full ${c.bg} ${c.text} flex items-center justify-center text-xs font-bold`}>{i + 1}</span>
                                    <span className="text-sm text-gray-800">{p.name}</span>
                                </div>
                                <span className={`text-sm font-semibold ${c.text}`}>{p.count}×</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-300">
                        {emptyIcon}
                        <p className="text-xs text-gray-400 mt-2">Belum ada data</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function QuickAction({ href, icon, title, desc, color }: {
    href: string; icon: React.ReactNode; title: string; desc: string; color: string;
}) {
    const c = palette[color] || palette.blue;
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
        >
            <div className={`p-2.5 rounded-lg ${c.bg} ${c.text} group-hover:shadow-sm transition-shadow`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">{desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
        </Link>
    );
}
