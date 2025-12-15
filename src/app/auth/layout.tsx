
export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <main className="w-full min-h-screen bg-zinc-950 flex flex-col gap-4 items-center justify-center">
            {children}
        </main>
    );
}
