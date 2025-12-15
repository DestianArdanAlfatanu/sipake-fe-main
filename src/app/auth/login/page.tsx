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
    const form = useForm<Schema>({
        resolver: zodResolver(formSchema),
    });
    const { toast } = useToast();
    const router = useRouter();

    const onSubmit = async (values: Schema) => {
        try {
            await axios.post("http://localhost:3000/api/auth/login", values);
            toast({
                variant: "default",
                title: "Berhasil",
                description: "Anda berhasil masuk",
            });
            router.push("/app/dashboard");
        } catch (error) {
            if (isAxiosError(error)) {
                const { errors, message } = error.response?.data as {
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
                } else {
                    if(message == "Email belum diverifikasi")  {
                        router.push(`/auth/verify?username=${values.username}`);
                    }
                    toast({
                        variant: "destructive",
                        title: "Ooops!",
                        description: message,
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
                            <Button type="submit">Masuk</Button>
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
