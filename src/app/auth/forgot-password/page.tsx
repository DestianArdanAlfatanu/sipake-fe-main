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
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";

// Step 1: Email form schema
const emailFormSchema = z.object({
    email: z
        .string({ required_error: "Email harus diisi" })
        .min(1, { message: "Email harus diisi" })
        .email({ message: "Format email tidak valid" }),
});

// Step 2: OTP + New Password form schema
const resetFormSchema = z.object({
    code: z
        .string({ required_error: "Kode OTP harus diisi" })
        .min(6, { message: "Kode OTP harus 6 digit" })
        .max(6, { message: "Kode OTP harus 6 digit" }),
    newPassword: z
        .string({ required_error: "Password baru harus diisi" })
        .min(6, { message: "Password minimal 6 karakter" }),
    confirmPassword: z
        .string({ required_error: "Konfirmasi password harus diisi" })
        .min(1, { message: "Konfirmasi password harus diisi" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
});

type EmailSchema = z.infer<typeof emailFormSchema>;
type ResetSchema = z.infer<typeof resetFormSchema>;

const ForgotPasswordPage = () => {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    // Step 1 form
    const emailForm = useForm<EmailSchema>({
        resolver: zodResolver(emailFormSchema),
        defaultValues: {
            email: "",
        },
    });

    // Step 2 form
    const resetForm = useForm<ResetSchema>({
        resolver: zodResolver(resetFormSchema),
        defaultValues: {
            code: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Step 1: Send OTP
    const onSendOtp = async (values: EmailSchema) => {
        try {
            setIsLoading(true);
            await axios.post("/api/auth/forgot-password", {
                email: values.email,
            });

            setEmail(values.email);
            setStep(2);

            toast({
                variant: "default",
                title: "Berhasil",
                description: "Kode OTP telah dikirim ke email Anda. Silakan cek inbox atau folder spam.",
            });
        } catch (error) {
            if (isAxiosError(error)) {
                const responseData = error.response?.data;
                if (responseData) {
                    const { message } = responseData as {
                        message: string;
                        statusCode: number;
                    };
                    toast({
                        variant: "destructive",
                        title: "Gagal!",
                        description: message || "Terjadi kesalahan",
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Gagal!",
                        description: "Terjadi kesalahan. Silakan coba lagi.",
                    });
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Reset Password
    const onResetPassword = async (values: ResetSchema) => {
        try {
            setIsLoading(true);
            await axios.post("/api/auth/reset-password", {
                email: email,
                code: values.code,
                newPassword: values.newPassword,
            });

            toast({
                variant: "default",
                title: "Berhasil!",
                description: "Password berhasil direset. Silakan login dengan password baru.",
            });

            setTimeout(() => {
                router.push("/auth/login");
            }, 1500);
        } catch (error) {
            if (isAxiosError(error)) {
                const responseData = error.response?.data;
                if (responseData) {
                    const { message } = responseData as {
                        message: string;
                        statusCode: number;
                    };
                    toast({
                        variant: "destructive",
                        title: "Gagal!",
                        description: message || "Terjadi kesalahan",
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Gagal!",
                        description: "Terjadi kesalahan. Silakan coba lagi.",
                    });
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP
    const onResendOtp = async () => {
        try {
            setIsLoading(true);
            await axios.post("/api/auth/forgot-password", {
                email: email,
            });

            toast({
                variant: "default",
                title: "Berhasil",
                description: "Kode OTP baru telah dikirim ke email Anda.",
            });
        } catch (error) {
            if (isAxiosError(error)) {
                toast({
                    variant: "destructive",
                    title: "Gagal!",
                    description: "Gagal mengirim ulang kode OTP. Silakan coba lagi.",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Card className="bg-white border-none shadow-lg">
                <CardHeader>
                    <CardTitle className="text-blue-600">
                        {step === 1 ? "Lupa Kata Sandi" : "Reset Kata Sandi"}
                    </CardTitle>
                    <CardDescription className="text-blue-600/90">
                        {step === 1
                            ? "Masukkan email yang terdaftar untuk menerima kode OTP"
                            : `Kode OTP telah dikirim ke ${email}`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 ? (
                        // Step 1: Email Input
                        <Form key="email-step" {...emailForm}>
                            <form
                                onSubmit={emailForm.handleSubmit(onSendOtp)}
                                className="flex flex-col gap-2"
                                autoComplete="off"
                            >
                                <FormField
                                    control={emailForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-blue-600">Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="bg-white text-blue-600 placeholder:text-blue-600/50"
                                                    placeholder="Masukkan email anda"
                                                    type="email"
                                                    autoComplete="email"
                                                    disabled={isLoading}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-blue-600 text-white hover:bg-blue-700 border-none mt-2"
                                >
                                    {isLoading ? "Mengirim..." : "Kirim Kode OTP"}
                                </Button>
                            </form>
                        </Form>
                    ) : (
                        // Step 2: OTP + New Password
                        <Form key="reset-step" {...resetForm}>
                            <form
                                onSubmit={resetForm.handleSubmit(onResetPassword)}
                                className="flex flex-col gap-2"
                                autoComplete="off"
                            >
                                <FormField
                                    control={resetForm.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-blue-600">Kode OTP</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="bg-white text-blue-600 placeholder:text-blue-600/50"
                                                    placeholder="Masukkan kode 6 digit"
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    autoComplete="one-time-code"
                                                    id="otp-code-input"
                                                    name="otp-code"
                                                    disabled={isLoading}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={resetForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-blue-600">Password Baru</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="bg-white text-blue-600 placeholder:text-blue-600/50"
                                                    placeholder="Masukkan password baru"
                                                    type="password"
                                                    autoComplete="new-password"
                                                    disabled={isLoading}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={resetForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-blue-600">Konfirmasi Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="bg-white text-blue-600 placeholder:text-blue-600/50"
                                                    placeholder="Masukkan ulang password baru"
                                                    type="password"
                                                    autoComplete="new-password"
                                                    disabled={isLoading}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-blue-600 text-white hover:bg-blue-700 border-none mt-2"
                                >
                                    {isLoading ? "Memproses..." : "Reset Password"}
                                </Button>
                                <div className="flex items-center justify-between mt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep(1);
                                            resetForm.reset();
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                    >
                                        ← Ganti Email
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onResendOtp}
                                        disabled={isLoading}
                                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                                    >
                                        Kirim Ulang OTP
                                    </button>
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
            <p className="text-center mt-4">
                <span className="text-gray-500">Sudah ingat password? </span>
                <Link href={"/auth/login"} className="text-blue-600 font-semibold hover:text-blue-700">
                    Masuk Sekarang
                </Link>
            </p>
        </>
    );
};

export default ForgotPasswordPage;
