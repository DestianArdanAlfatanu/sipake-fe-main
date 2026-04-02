'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, AlertCircle, Activity, GitBranch, Users, LogOut, Menu, X } from 'lucide-react';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            if (!token) {
                console.log('No token found, redirecting to login');
                router.push('/auth/login');
                return;
            }

            // Decode JWT to get role
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('Token payload:', payload);

                // Check if user is admin or expert
                if (payload.role !== 'EXPERT' && payload.role !== 'SUPER_ADMIN') {
                    console.log('User is not admin/expert, redirecting');
                    router.push('/app/dashboard');
                    return;
                }

                // Set basic user info from token
                setUser({
                    username: payload.username,
                    name: payload.name || payload.username,
                    role: payload.role,
                });

                setLoading(false);
                console.log('Auth check complete, user set');
            } catch (decodeError) {
                console.error('Token decode error:', decodeError);
                router.push('/auth/login');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setLoading(false); // Stop loading even on error
            router.push('/auth/login');
        }
    };

    const handleLogout = () => {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        router.push('/auth/login');
    };

    const handleNavClick = (href: string) => {
        if (isMobile) setSidebarOpen(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600">Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 relative">
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    ${isMobile
                        ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                        : `${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300`
                    }
                    bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col
                `}
            >
                {/* Logo */}
                <div className="p-4 border-b border-blue-700">
                    <div className="flex items-center justify-between">
                        {(sidebarOpen || isMobile) && (
                            <h1 className="text-xl font-bold">Si Pak-E Admin</h1>
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {/* Dashboard */}
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        href="/admin"
                        collapsed={!sidebarOpen && !isMobile}
                        onNavigate={handleNavClick}
                    />

                    {/* Engine Management */}
                    <div className="pt-4">
                        {(sidebarOpen || isMobile) && (
                            <p className="text-xs text-blue-300 uppercase tracking-wider mb-2">
                                Engine Management
                            </p>
                        )}
                        <NavItem
                            icon={<AlertCircle size={20} />}
                            label="Problems"
                            href="/admin/engine/problems"
                            collapsed={!sidebarOpen && !isMobile}
                            onNavigate={handleNavClick}
                        />
                        <NavItem
                            icon={<Activity size={20} />}
                            label="Symptoms"
                            href="/admin/engine/symptoms"
                            collapsed={!sidebarOpen && !isMobile}
                            onNavigate={handleNavClick}
                        />
                        <NavItem
                            icon={<GitBranch size={20} />}
                            label="Rules (CF)"
                            href="/admin/engine/rules"
                            collapsed={!sidebarOpen && !isMobile}
                            onNavigate={handleNavClick}
                        />
                    </div>

                    {/* Suspension Management */}
                    <div className="pt-4">
                        {(sidebarOpen || isMobile) && (
                            <p className="text-xs text-blue-300 uppercase tracking-wider mb-2">
                                Undercarriage Management
                            </p>
                        )}
                        <NavItem
                            icon={<AlertCircle size={20} />}
                            label="Problems"
                            href="/admin/suspension/problems"
                            collapsed={!sidebarOpen && !isMobile}
                            onNavigate={handleNavClick}
                        />
                        <NavItem
                            icon={<Activity size={20} />}
                            label="Symptoms"
                            href="/admin/suspension/symptoms"
                            collapsed={!sidebarOpen && !isMobile}
                            onNavigate={handleNavClick}
                        />
                        <NavItem
                            icon={<GitBranch size={20} />}
                            label="Rules (CF)"
                            href="/admin/suspension/rules"
                            collapsed={!sidebarOpen && !isMobile}
                            onNavigate={handleNavClick}
                        />
                    </div>

                    {/* User Management (SUPER_ADMIN only) */}
                    {user?.role === 'SUPER_ADMIN' && (
                        <div className="pt-4">
                            {(sidebarOpen || isMobile) && (
                                <p className="text-xs text-blue-300 uppercase tracking-wider mb-2">
                                    System
                                </p>
                            )}
                            <NavItem
                                icon={<Users size={20} />}
                                label="User Management"
                                href="/admin/users"
                                collapsed={!sidebarOpen && !isMobile}
                                onNavigate={handleNavClick}
                            />
                        </div>
                    )}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-blue-700">
                    {(sidebarOpen || isMobile) ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold">{user?.name}</p>
                                    <p className="text-xs text-blue-300">{user?.username}</p>
                                </div>
                                <Badge variant={user?.role === 'SUPER_ADMIN' ? 'destructive' : 'default'}>
                                    {user?.role}
                                </Badge>
                            </div>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                size="sm"
                                className="w-full bg-white text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                            >
                                <LogOut size={16} className="mr-2" />
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="w-full p-2 hover:bg-blue-700 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} className="mx-auto" />
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto min-w-0">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 p-4 md:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            {/* Mobile hamburger button */}
                            {isMobile && (
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Menu size={22} className="text-gray-700" />
                                </button>
                            )}
                            <div>
                                <h2 className="text-lg md:text-2xl font-bold text-gray-800">Admin Dashboard</h2>
                                <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">
                                    Manage knowledge base and system settings
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4 shrink-0">
                            <Badge variant="outline" className="text-xs md:text-sm bg-blue-600 text-white">
                                {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Expert'}
                            </Badge>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-3 md:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

// Navigation Item Component
function NavItem({
    icon,
    label,
    href,
    collapsed,
    onNavigate,
}: {
    icon: React.ReactNode;
    label: string;
    href: string;
    collapsed: boolean;
    onNavigate?: (href: string) => void;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));

    return (
        <button
            onClick={() => { router.push(href); onNavigate?.(href); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                ? 'bg-blue-700 text-white shadow-lg'
                : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                }`}
            title={collapsed ? label : undefined}
        >
            <div className={collapsed ? 'mx-auto' : ''}>{icon}</div>
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
        </button>
    );
}
