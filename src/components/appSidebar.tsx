"use client";

import { House, LogOut, Stethoscope } from "lucide-react";
import { usePathname } from "next/navigation";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const items = [
    {
        title: "Dashboard",
        url: "/app/dashboard",
        icon: House,
    },
    {
        title: "Konsultasi",
        url: "/app/consultation",
        matchPaths: ["/app/consultation", "/app/engine/consultation", "/app/suspension/consultation"],
        icon: Stethoscope,
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    const isActive = (item: (typeof items)[number]) => {
        // Check exact match first
        if (pathname === item.url) return true;
        // Check sub-paths
        if (pathname.startsWith(item.url + "/")) return true;
        // Check additional matchPaths (for Konsultasi covering engine/suspension)
        if ("matchPaths" in item && item.matchPaths) {
            return item.matchPaths.some(
                (p) => pathname === p || pathname.startsWith(p + "/")
            );
        }
        return false;
    };

    return (
        <Sidebar>
            <SidebarContent className="bg-gradient-to-b from-blue-700 via-blue-600 to-blue-800 text-white">
                {/* Brand */}
                <div className="px-5 pt-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-lg font-extrabold text-white">S</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-white">Si Pak-E</h1>
                            <p className="text-[10px] text-blue-200 leading-none">BMW E36 Expert System</p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="px-5 pb-2">
                    <div className="h-px bg-white/15" />
                </div>

                {/* Menu */}
                <SidebarGroup className="px-3">
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {items.map((item) => {
                                const active = isActive(item);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            className={`rounded-lg transition-all duration-200 py-2.5 ${active
                                                    ? "bg-white/20 text-white font-semibold shadow-sm"
                                                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                                                }`}
                                        >
                                            <a href={item.url}>
                                                <item.icon className="h-5 w-5" />
                                                <span className="font-medium">{item.title}</span>
                                                {active && (
                                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                                                )}
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="bg-blue-900/80 text-white border-t border-white/10">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="bg-white text-blue-700 hover:bg-red-700 hover:text-white rounded-lg transition-all duration-200"
                        >
                            <Link href="/auth/logout">
                                <LogOut className="h-5 w-5" />
                                <span className="font-medium">Logout</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
