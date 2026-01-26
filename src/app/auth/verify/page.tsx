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
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    username: z
        .string({ required_error: "Username harus diisi" })
        .min(1, { message: "Username harus diisi" }),
    code: z
        .string({ required_error: "Kode verifikasi harus diisi" })
        .min(6, { message: "Kode verifikasi harus 6 digit" })
        .max(6, { message: "Kode verifikasi harus 6 digit" }),
});

type Schema = z.infer<typeof formSchema>;

const VerifyPage = () => {
    const searchParams = useSearchParams();
    const username = searchParams.get("username") || "";

    const form = useForm<Schema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: username,
            code: "",
        },
    });
    const { toast } = useToast();
    const router = useRouter();

    const onSubmit = async (values: Schema) => {
        try {
            // Call Next.js API route
            await axios.post("/api/auth/verify", values);

            toast({
                variant: "default",
                title: "Berhasil",
                description: "Email berhasil diverifikasi. Silakan login.",
            });
            router.push("/auth/login");
        } catch (error) {
            if (isAxiosError(error)) {
                const responseData = error.response?.data;

                // Handle case when response data exists
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
                        toast({
                            variant: "destructive",
                            title: "Ooops!",
                            description: message || "Terjadi kesalahan",
                        });
                    }
                } else {
                    // Handle case when no response data
                    toast({
                        variant: "destructive",
                        title: "Ooops!",
                        description: "Terjadi kesalahan. Silakan coba lagi.",
                    });
                }
            } else {
                toast({
                    variant: "destructive",
                    title: "Ooops!",
                    description: "Terjadi kesalahan yang tidak diketahui.",
                });
            }
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Verifikasi Email</CardTitle>
                    <CardDescription>
                        Masukkan kode verifikasi yang telah dikirim ke email Anda
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
                                                {...field}
                                                readOnly
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kode Verifikasi</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Masukan kode 6 digit"
                                                maxLength={6}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Verifikasi</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <CardDescription className="text-center">
                Sudah verifikasi?{" "}
                <Link href={"/auth/login"} className="text-white font-medium">
                    Login Sekarang
                </Link>
            </CardDescription>
        </>
    );
};

export default VerifyPage;
