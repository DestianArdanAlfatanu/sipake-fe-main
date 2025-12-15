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
import axios from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    code: z
        .string({ required_error: "Password harus diisi" })
        .min(1, { message: "Password harus diisi" }),
});

type Schema = z.infer<typeof formSchema>;

const VerifyPage = () => {
    const form = useForm<Schema>({
        resolver: zodResolver(formSchema),
    });
    const { toast } = useToast();
    const router = useRouter();
    const params = useSearchParams();
    const username = params.get("username")!;

    const onSubmit = async (values: Schema) => {
        try {
            await axios.post("/users/verify", { username, code: values.code });
            toast({
                variant: "default",
                title: "Berhasil",
                description: "Email berhasil diverifikasi",
            });
            router.push("/auth/login");
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
                    <CardTitle>Verifikasi Email</CardTitle>
                    <CardDescription>
                        Silahkan masukan kode verifikasi yang telah dikirimkan
                        ke email anda
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
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kode Verifikasi</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Masukan kode verifikasi anda"
                                                type="text"
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
        </>
    );
};

export default VerifyPage;
