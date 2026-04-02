"use client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Response } from "@/types/api.dt";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { countryCodes } from "@/lib/country-codes";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const formSchema = z.object({
    name: z
        .string({ required_error: "Nama harus diisi" })
        .min(1, { message: "Nama harus diisi" }),
    username: z
        .string({ required_error: "Username harus diisi" })
        .min(1, { message: "Username harus diisi" }),
    email: z
        .string({ required_error: "Email harus diisi" })
        .min(1, { message: "Email harus diisi" }),
    password: z
        .string({ required_error: "Password harus diisi" })
        .min(1, { message: "Password harus diisi" }),
    password_confirmation: z
        .string({ required_error: "Konfirmasi Password harus diisi" })
        .min(1, { message: "Konfirmasi Password harus diisi" }),
    phoneNumber: z
        .string({ required_error: "Nomor HP harus diisi" })
        .min(1, { message: "Nomor HP harus diisi" }),
    address: z
        .string({ required_error: "Alamat harus diisi" })
        .min(1, { message: "Alamat harus diisi" }),
    plateNumber: z
        .string({ required_error: "Plat nomor harus diisi" })
        .min(1, { message: "Plat nomor harus diisi" }),
    car_year: z.string({ required_error: "Harus Pilih salah satu" }),
    engine_code: z.string({ required_error: "Harus Pilih salah satu" }),
    profilePicture: z.custom<File>().optional(),
});

type Schema = z.infer<typeof formSchema>;

/* Required label helper */
function RequiredLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="text-blue-600">
            {children} <span className="text-blue-500">*</span>
        </span>
    );
}

/* Country Code Dropdown */
function CountryCodeSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selected = countryCodes.find((c) => c.dial === value);

    const filtered = useMemo(() => {
        if (!search) return countryCodes;
        const q = search.toLowerCase();
        return countryCodes.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.dial.includes(q) ||
                c.code.toLowerCase().includes(q)
        );
    }, [search]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => { setOpen(!open); setSearch(""); }}
                className="flex items-center gap-1.5 h-10 px-2.5 border border-blue-600 rounded-l-md bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors min-w-[100px] justify-center"
            >
                <span className="text-base">{selected?.flag || "🌍"}</span>
                <span>{value}</span>
                <svg className="h-3.5 w-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-blue-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-blue-100">
                        <input
                            type="text"
                            placeholder="Cari negara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-blue-200 rounded-md bg-blue-50/50 text-blue-700 placeholder:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                            autoFocus
                        />
                    </div>
                    {/* List */}
                    <div className="max-h-52 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <p className="text-center text-sm text-gray-400 py-4">Tidak ditemukan</p>
                        ) : (
                            filtered.map((c) => (
                                <button
                                    key={c.code + c.dial}
                                    type="button"
                                    onClick={() => { onChange(c.dial); setOpen(false); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${c.dial === value ? "bg-blue-50 font-semibold text-blue-700" : "text-gray-700"
                                        }`}
                                >
                                    <span className="text-base">{c.flag}</span>
                                    <span className="flex-1 text-left truncate">{c.name}</span>
                                    <span className="text-xs text-blue-500 font-mono">{c.dial}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const RegisterPage = () => {
    const [engineCodes, setEngineCodes] = useState<string[]>([]);
    const [carYears, setCarYears] = useState<string[]>([]);
    const [countryDial, setCountryDial] = useState("+62"); // Default Indonesia
    const form = useForm<Schema>({
        resolver: zodResolver(formSchema),
    });
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        getEngineCodes();
        getCarYears();
    }, []);

    const getEngineCodes = async () => {
        try {
            const response = await axios.get<Response<{ code: string }[]>>(
                `${BACKEND_URL}/engine/codes`
            );
            setEngineCodes(response.data.data.map((item) => item.code));
        } catch (error) {
            console.error(error);
        }
    };

    const getCarYears = async () => {
        try {
            const response = await axios.get<Response<{ year: number }[]>>(
                `${BACKEND_URL}/car-years`
            );
            setCarYears(response.data.data.map((item) => item.year.toString()));
        } catch (error) {
            console.error(error);
        }
    };

    const onSubmit = async (values: Schema) => {
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("username", values.username);
            formData.append("email", values.email);
            formData.append("password", values.password);
            formData.append("password_confirmation", values.password_confirmation);
            // Combine country dial code + cleaned phone number (strip spaces, dashes, etc.)
            const cleanPhone = values.phoneNumber.replace(/\D/g, "");
            formData.append("phoneNumber", `${countryDial}${cleanPhone}`);
            formData.append("address", values.address);
            formData.append("plateNumber", values.plateNumber);
            formData.append("car_year", values.car_year);
            formData.append("car_series_id", "E36"); // Hardcoded — only BMW E36
            formData.append("engine_code", values.engine_code);
            if (values.profilePicture) {
                formData.append("profilePicture", values.profilePicture);
            }

            await axios.post("/api/auth/register", formData);

            toast({
                variant: "default",
                title: "Berhasil",
                description: "Anda berhasil mendaftar",
            });
            router.push(`/auth/verify?username=${values.username}`);
        } catch (error) {
            if (isAxiosError(error)) {
                toast({
                    variant: "destructive",
                    title: "Ooops!",
                    description: error.response?.data.message,
                });
                const { errors, message } = error.response
                    ?.data as {
                        errors: { [key: string]: string };
                        message: string;
                        statusCode: number;
                    };

                if (message === "Validation Error") {
                    for (const key in errors) {
                        form.setError(key as keyof Schema, {
                            type: "manual",
                            message: errors[key],
                        });
                    }
                }
            }
        }
    };

    return (
        <>
            <Card className="w-full max-w-[700px] mx-auto bg-white border-none shadow-lg">
                <CardHeader>
                    <CardTitle className="text-blue-600">Registrasi</CardTitle>
                    <CardDescription className="text-blue-600/90">
                        Daftar Sekarang Lalu Selesaikan Masalah BMW E36 Anda
                        Bersama Pakar Kami
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-2"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <aside className="flex flex-col gap-2">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <RequiredLabel>Nama Lengkap</RequiredLabel>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="bg-white text-blue-600 placeholder:text-blue-600"
                                                        placeholder="Masukan nama anda"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <RequiredLabel>Username</RequiredLabel>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="bg-white text-blue-600 placeholder:text-blue-600"
                                                        placeholder="Masukan username anda"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <RequiredLabel>Email</RequiredLabel>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="bg-white text-blue-600 placeholder:text-blue-600"
                                                        placeholder="Masukan email anda"
                                                        type="email"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <RequiredLabel>Password</RequiredLabel>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="bg-white text-blue-600 placeholder:text-blue-600"
                                                        placeholder="Masukan password anda"
                                                        type="password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password_confirmation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <RequiredLabel>Konfirmasi Password</RequiredLabel>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="bg-white text-blue-600 placeholder:text-blue-600"
                                                        placeholder="Masukan password anda lagi"
                                                        type="password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <RequiredLabel>Nomor HP</RequiredLabel>
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="flex">
                                                        <CountryCodeSelect
                                                            value={countryDial}
                                                            onChange={setCountryDial}
                                                        />
                                                        <Input
                                                            className="bg-white text-blue-600 placeholder:text-blue-400 rounded-l-none border-l-0"
                                                            placeholder="8123456789"
                                                            type="text"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <RequiredLabel>Alamat</RequiredLabel>
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        className="bg-white text-blue-600 placeholder:text-blue-600"
                                                        placeholder="Masukan alamat anda"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </aside>
                                <aside className="flex flex-col gap-2">
                                    <FormField
                                        control={form.control}
                                        name="car_year"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <RequiredLabel>Pilih Tahun Produksi BMW</RequiredLabel>
                                                </FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => field.onChange(value)}
                                                        {...field}
                                                    >
                                                        <SelectTrigger className="bg-white text-blue-600 border-blue-600">
                                                            <SelectValue placeholder="Pilih Tahun Produksi BMW" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white text-blue-600 border-blue-600">
                                                            {carYears.map((item) => (
                                                                <SelectItem
                                                                    key={item}
                                                                    value={item}
                                                                    className="text-blue-600 focus:bg-blue-700"
                                                                >
                                                                    {item}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="engine_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <RequiredLabel>Pilih Kode Mesin BMW</RequiredLabel>
                                                </FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => field.onChange(value)}
                                                        {...field}
                                                    >
                                                        <SelectTrigger className="bg-white text-blue-600 border-blue-600">
                                                            <SelectValue placeholder="Pilih Kode Mesin BMW" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white text-blue-600 border-blue-600">
                                                            {engineCodes.map((item) => (
                                                                <SelectItem
                                                                    key={item}
                                                                    value={item}
                                                                    className="text-blue-600 focus:bg-blue-700"
                                                                >
                                                                    {item}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="plateNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <RequiredLabel>Plat Nomor</RequiredLabel>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="bg-white text-blue-600 placeholder:text-blue-600"
                                                        placeholder="Masukan plat nomor mobil anda"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="profilePicture"
                                        render={({
                                            field: { onChange, name, ref, disabled },
                                        }) => (
                                            <FormItem>
                                                <FormLabel className="text-blue-600">
                                                    Foto Akun Anda
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="bg-white text-blue-600 file:text-blue-600 file:font-semibold"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const files = e.target.files;
                                                            if (files) {
                                                                onChange(files[0]);
                                                            }
                                                        }}
                                                        name={name}
                                                        ref={ref}
                                                        disabled={disabled}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </aside>
                            </div>

                            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 border-none mt-2">Registrasi</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <p className="text-center mt-4">
                <span className="text-gray-500">Sudah memiliki akun? </span>
                <Link href={"/auth/login"} className="text-blue-600 font-semibold hover:text-blue-700">
                    Login Sekarang
                </Link>
            </p>
        </>
    );
};

export default RegisterPage;
