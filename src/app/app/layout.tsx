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
            <main className="w-full bg-slate-50">
                <header className="flex justify-between items-center w-full p-4 bg-blue-600 text-white sticky top-0 shadow-md z-10">
                    <SidebarTrigger className="text-white hover:bg-blue-700 rounded-md p-2" />
                    <div className="flex items-center">
                        <HeaderAvatar token={token!} />
                    </div>
                </header>
                <div className="p-8">{children}</div>
            </main>
        </SidebarProvider>
    );
}
