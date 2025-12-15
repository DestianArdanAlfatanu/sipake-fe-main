import { AppSidebar } from "@/components/appSidebar";
import HeaderAvatar from "@/components/headerAvatar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default function Layout({ children }: { children: React.ReactNode }) {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <header className="flex justify-between items-center w-full p-4 bg-zinc-900 sticky top-0">
                    <SidebarTrigger />
                    <div className="flex items-center">
                        <HeaderAvatar token={token!} />
                    </div>
                </header>
                <div className="p-8">{children}</div>
            </main>
        </SidebarProvider>
    );
}
