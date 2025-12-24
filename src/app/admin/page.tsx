'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Activity, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import axios from '@/lib/axios';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            if (!token) {
                router.push('/auth/login');
                return;
            }

            const response = await axios.get('/admin/stats/dashboard', {
                headers: { Authorization: `Bearer ${token}` },
            });

            setStats(response.data.data);
        } catch (error: any) {
            console.error('Failed to fetch stats:', error);
            setError(error.response?.data?.message || 'Failed to load dashboard data');

            // Set default stats if API fails
            setStats({
                users: { total: 0 },
                consultations: {
                    total: 0,
                    today: 0,
                    thisWeek: 0,
                    byModule: { engine: 0, suspension: 0 }
                },
                topProblems: []
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600 mt-2">
                    System statistics and insights at a glance
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-yellow-900">Warning</p>
                                <p className="text-sm text-yellow-800 mt-1">{error}</p>
                                <p className="text-xs text-yellow-700 mt-2">Showing default values. Please check backend connection.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Users"
                    value={stats?.users?.total || 0}
                    icon={<Users className="h-8 w-8" />}
                    color="blue"
                    description="Registered users"
                />
                <StatsCard
                    title="Total Consultations"
                    value={stats?.consultations?.total || 0}
                    icon={<Activity className="h-8 w-8" />}
                    color="green"
                    description="All time consultations"
                />
                <StatsCard
                    title="Today's Consultations"
                    value={stats?.consultations?.today || 0}
                    icon={<Calendar className="h-8 w-8" />}
                    color="purple"
                    description="Consultations today"
                />
                <StatsCard
                    title="This Week"
                    value={stats?.consultations?.thisWeek || 0}
                    icon={<TrendingUp className="h-8 w-8" />}
                    color="orange"
                    description="Last 7 days"
                />
            </div>

            {/* Module Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Consultations by Module</CardTitle>
                        <CardDescription>Distribution between Engine and Suspension</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Engine</span>
                                    <span className="text-sm text-gray-600">
                                        {stats?.consultations?.byModule?.engine || 0} consultations
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        style={{
                                            width: `${((stats?.consultations?.byModule?.engine || 0) /
                                                (stats?.consultations?.total || 1)) *
                                                100
                                                }%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Suspension</span>
                                    <span className="text-sm text-gray-600">
                                        {stats?.consultations?.byModule?.suspension || 0} consultations
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-green-600 h-2.5 rounded-full"
                                        style={{
                                            width: `${((stats?.consultations?.byModule?.suspension || 0) /
                                                (stats?.consultations?.total || 1)) *
                                                100
                                                }%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Problems</CardTitle>
                        <CardDescription>Most frequently diagnosed issues</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats?.topProblems && stats.topProblems.length > 0 ? (
                            <div className="space-y-3">
                                {stats.topProblems.map((problem: any, index: number) => (
                                    <div key={problem.problemId || index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                                                {index + 1}
                                            </div>
                                            <span className="font-mono text-sm font-medium">{problem.problemId}</span>
                                        </div>
                                        <span className="text-sm text-gray-600">{problem.count} times</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No data available</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <QuickActionButton
                            title="Manage Engine Problems"
                            description="Add, edit, or delete engine problems"
                            href="/admin/engine/problems"
                        />
                        <QuickActionButton
                            title="Manage Suspension Problems"
                            description="Add, edit, or delete suspension problems"
                            href="/admin/suspension/problems"
                        />
                        <QuickActionButton
                            title="View All Users"
                            description="Manage user accounts and permissions"
                            href="/admin/users"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Stats Card Component
function StatsCard({
    title,
    value,
    icon,
    color,
    description,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    description: string;
}) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</h3>
                        <p className="text-xs text-gray-500 mt-1">{description}</p>
                    </div>
                    <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Quick Action Button Component
function QuickActionButton({
    title,
    description,
    href,
}: {
    title: string;
    description: string;
    href: string;
}) {
    return (
        <a
            href={href}
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
        >
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {title}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
        </a>
    );
}
