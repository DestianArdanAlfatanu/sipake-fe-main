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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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
    car_series_id: z.string({ required_error: "Harus Pilih salah satu" }),
    engine_code: z.string({ required_error: "Harus Pilih salah satu" }),
    profilePicture: z.custom<File>((value) => value !== null, {
        message: "Foto akun harus diisi",
    }),
});

type Schema = z.infer<typeof formSchema>;

const RegisterPage = () => {
    const [engineCodes, setEngineCodes] = useState<string[]>([]);
    const [carYears, setCarYears] = useState<string[]>([]);
    const [carSeries, setCarSeries] = useState<string[]>([]);
    const form = useForm<Schema>({
        resolver: zodResolver(formSchema),
    });
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        getEngineCodes();
        getCarYears();
        getCarSeries();
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

    const getCarSeries = async () => {
        try {
            const response = await axios.get<Response<{ series_id: string }[]>>(
                `${BACKEND_URL}/car-series`
            );

            setCarSeries(response.data.data.map((item) => item.series_id));
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
            formData.append(
                "password_confirmation",
                values.password_confirmation
            );
            formData.append("phoneNumber", values.phoneNumber);
            formData.append("address", values.address);
            formData.append("plateNumber", values.plateNumber);
            formData.append("car_year", values.car_year);
            formData.append("car_series_id", values.car_series_id);
            formData.append("engine_code", values.engine_code);
            formData.append("profilePicture", values.profilePicture);

            // Call Next.js API route instead of direct backend
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
            <Card className="min-w-[700px]">
                <CardHeader>
                    <CardTitle>Registrasi</CardTitle>
                    <CardDescription>
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
                            <div className="grid grid-cols-2 gap-4">
                                <aside className="flex flex-col gap-2">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Nama Lengkap
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
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
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input
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
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
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
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
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
                                                    Konfirmasi Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
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
                                                <FormLabel>Nomor HP</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Masukan nomor hp anda"
                                                        type="text"
                                                        {...field}
                                                    />
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
                                                <FormLabel>Alamat</FormLabel>
                                                <FormControl>
                                                    <Textarea
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
                                        name="car_series_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Pilih Seri
                                                </FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            field.onChange(
                                                                value
                                                            )
                                                        }
                                                        {...field}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih Seri BMW" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {carSeries.map(
                                                                (item) => (
                                                                    <SelectItem
                                                                        key={item}
                                                                        value={
                                                                            item
                                                                        }
                                                                    >
                                                                        {item}
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="car_year"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Pilih Tahun Produksi BMW
                                                </FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            field.onChange(
                                                                value
                                                            )
                                                        }
                                                        {...field}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih Tahun Produksi BMW" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {carYears.map(
                                                                (item) => (
                                                                    <SelectItem
                                                                        key={item}
                                                                        value={
                                                                            item
                                                                        }
                                                                    >
                                                                        {item}
                                                                    </SelectItem>
                                                                )
                                                            )}
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
                                                    Pilih Kode Mesin BMW
                                                </FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            field.onChange(
                                                                value
                                                            )
                                                        }
                                                        {...field}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih Kode Mesin BMW" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {engineCodes.map(
                                                                (item) => (
                                                                    <SelectItem
                                                                        key={item}
                                                                        value={
                                                                            item
                                                                        }
                                                                    >
                                                                        {item}
                                                                    </SelectItem>
                                                                )
                                                            )}
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
                                                    Plat Nomor
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
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
                                            field: {
                                                onChange,
                                                name,
                                                ref,
                                                disabled,
                                            },
                                        }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Foto Akun Anda
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const files =
                                                                e.target.files;
                                                            if (files) {
                                                                onChange(
                                                                    files[0]
                                                                );
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

                            <Button type="submit">Registrasi</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <CardDescription className="text-center">
                Sudah memiliki akun?{" "}
                <Link href={"/auth/login"} className="text-white font-medium">
                    {" "}
                    Login Sekarang
                </Link>
            </CardDescription>
        </>
    );
};

export default RegisterPage;
