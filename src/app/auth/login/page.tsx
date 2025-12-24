"use client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
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
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";

const formSchema = z.object({
    username: z
        .string({ required_error: "Username harus diisi" })
        .min(1, { message: "Username harus diisi" }),
    password: z
        .string({ required_error: "Password harus diisi" })
        .min(1, { message: "Password harus diisi" }),
});

type Schema = z.infer<typeof formSchema>;

const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<Schema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });
    const { toast } = useToast();
    const router = useRouter();

    const onSubmit = async (values: Schema) => {
        try {
            setIsLoading(true);
            console.log("Submitting login...");

            // Call Next.js API route (relative URL)
            const response = await axios.post("/api/auth/login", values);

            console.log("Login response:", response.data);

            // Store token in COOKIES (not localStorage!)
            if (response.data?.data?.token) {
                const token = response.data.data.token;
                // Set cookie with 7 days expiry
                document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
                console.log("Token saved to cookies:", token.substring(0, 20) + "...");
            }

            // Get user role from response
            const userRole = response.data?.data?.user?.role;
            console.log("User role:", userRole);

            toast({
                variant: "default",
                title: "Berhasil",
                description: "Anda berhasil masuk. Mengalihkan ke dashboard...",
            });

            // Role-based redirect
            setTimeout(() => {
                console.log("Executing redirect now...");

                // Redirect based on role
                if (userRole === 'SUPER_ADMIN' || userRole === 'EXPERT') {
                    console.log("Redirecting to admin dashboard...");
                    window.location.href = "/admin";
                } else {
                    console.log("Redirecting to user dashboard...");
                    window.location.href = "/app/dashboard";
                }
            }, 1000);

        } catch (error) {
            console.error("Login error:", error);
            setIsLoading(false);

            if (isAxiosError(error)) {
                const responseData = error.response?.data;

                if (responseData) {
                    const { errors, message } = responseData as {
                        errors?: { [key: string]: string };
                        message: string;
                        statusCode: number;
                    };

                    if (message === "Validation Error" && errors) {
                        for (const key in errors) {
                            form.setError(key as keyof Schema, {
                                type: "manual",
                                message: errors[key],
                            });
                        }
                    } else {
                        // Handle email verification redirect
                        if (message === "Email belum diverifikasi") {
                            toast({
                                variant: "destructive",
                                title: "Email Belum Diverifikasi",
                                description: "Silakan cek email Anda untuk kode verifikasi",
                            });
                            setTimeout(() => {
                                router.push(`/auth/verify?username=${values.username}`);
                            }, 1000);
                        } else {
                            toast({
                                variant: "destructive",
                                title: "Ooops!",
                                description: message,
                            });
                        }
                    }
                } else {
                    toast({
                        variant: "destructive",
                        title: "Ooops!",
                        description: "Terjadi kesalahan. Silakan coba lagi.",
                    });
                }
            }
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Masuk</CardTitle>
                    <CardDescription>
                        Masuk Untuk Selesaikan Masalah BMW E36 Anda
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-2"
                        >
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Masukan username anda"
                                                autoComplete="username"
                                                disabled={isLoading}
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
                                                autoComplete="current-password"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Memproses..." : "Masuk"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <CardDescription className="text-center">
                Belum memiliki akun?{" "}
                <Link href={"/auth/signup"} className="text-white font-medium">
                    {" "}
                    Buat Sekarang
                </Link>
            </CardDescription>
        </>
    );
};

export default LoginPage;
