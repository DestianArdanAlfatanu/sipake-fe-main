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
            <main className="w-full bg-slate-50 min-h-screen">
                <header className="flex justify-between items-center w-full px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg p-2 transition-colors" />
                        <div className="hidden sm:block">
                            <h2 className="text-sm font-semibold text-gray-800">Si Pak-E</h2>
                            <p className="text-[11px] text-gray-400 leading-none">Sistem Pakar BMW E36</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <HeaderAvatar token={token!} />
                    </div>
                </header>
                <div className="p-6 md:p-8">{children}</div>
            </main>
        </SidebarProvider>
    );
}
