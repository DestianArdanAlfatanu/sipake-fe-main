import { Activity, Car, History, House, LogOut, Settings, UserRound, Wrench } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/app/dashboard",
        icon: House,
    },
    {
        title: "Konsultasi Masalah Engine",
        url: "/app/engine/consultation",
        icon: Car,
    },
    {
        title: "Riwayat Masalah Engine", 
        url: "/app/engine/consultation/history", 
        icon: History,
    },
    {
        title: "Konsultasi Masalah Suspension", 
        url: "/app/suspension/consultation", 
        icon: Wrench, 
    },
    {
        title: "Riwayat Masalah Suspension", 
        url: "/app/suspension/consultation/history", 
        icon: Activity, 
    },
    {
        title: "Akun Saya",
        url: "/app/my-account",
        icon: UserRound,
    }, 
];

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Si Pak-E</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/auth/logout">
                                <LogOut />
                                Logout
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
