'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, AlertCircle, Shield, User, UserCog } from 'lucide-react';
import axios from '@/lib/axios';

interface UserData {
    username: string;
    email: string;
    name: string;
    role: 'USER' | 'EXPERT' | 'SUPER_ADMIN';
    verified: boolean;
    phoneNumber?: string;
    address?: string;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            const response = await axios.get('/admin/users', {
                headers: { Authorization: `Bearer ${token}` },
            });

            // ResponseInterceptor wraps response: { data: { data: [...], meta: {...} } }
            setUsers(response.data.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]);  // Set empty array on error
            setLoading(false);
        }
    };

    const handleDeleteUser = async (username: string) => {
        if (!confirm(`Hapus user ${username}? Tindakan ini tidak dapat dibatalkan!`)) return;

        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            await axios.delete(`/admin/users/${username}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchUsers();
            alert('User deleted successfully!');
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user!');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.name.toLowerCase().includes(search.toLowerCase());

        const matchesRole = roleFilter ? user.role === roleFilter : true;

        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-2">Manage system users and roles</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingUser(null);
                        setShowModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 flex-1">
                            <Search className="h-5 w-5 text-blue-600" />
                            <Input
                                placeholder="Search by name, username, or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-md focus:ring-blue-600 focus:border-blue-600 bg-white"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="border rounded-md px-3 py-2"
                        >
                            <option value="">All Roles</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                            <option value="EXPERT">Expert</option>
                            <option value="USER">User</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users List</CardTitle>
                    <CardDescription>Total: {filteredUsers.length} users</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 font-semibold">User</th>
                                    <th className="text-left p-4 font-semibold">Email</th>
                                    <th className="text-left p-4 font-semibold">Role</th>
                                    <th className="text-center p-4 font-semibold">Status</th>
                                    <th className="text-right p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500">
                                            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.username} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                        {getRoleIcon(user.role)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{user.name}</p>
                                                        <p className="text-sm text-gray-600">@{user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">{user.email}</td>
                                            <td className="p-4">
                                                <RoleBadge role={user.role} />
                                            </td>
                                            <td className="p-4 text-center">
                                                {user.verified ? (
                                                    <Badge variant="default" className="bg-green-600">
                                                        Verified
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Not Verified</Badge>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        className="bg-blue-600 text-black"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingUser(user);
                                                            setShowModal(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(user.username)}
                                                        disabled={user.role === 'SUPER_ADMIN'}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {showModal && (
                <UserModal
                    user={editingUser}
                    onClose={() => {
                        setShowModal(false);
                        setEditingUser(null);
                    }}
                    onSuccess={() => {
                        setShowModal(false);
                        setEditingUser(null);
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
}

function getRoleIcon(role: string) {
    switch (role) {
        case 'SUPER_ADMIN':
            return <Shield className="h-5 w-5 text-purple-600" />;
        case 'EXPERT':
            return <UserCog className="h-5 w-5 text-blue-600" />;
        default:
            return <User className="h-5 w-5 text-gray-600" />;
    }
}

function RoleBadge({ role }: { role: string }) {
    const variants: Record<string, { color: string; label: string }> = {
        SUPER_ADMIN: { color: 'bg-purple-600', label: 'Super Admin' },
        EXPERT: { color: 'bg-blue-600', label: 'Expert' },
        USER: { color: 'bg-gray-600', label: 'User' },
    };

    const variant = variants[role] || variants.USER;

    return (
        <Badge className={`${variant.color} text-white`}>
            {variant.label}
        </Badge>
    );
}

function UserModal({
    user,
    onClose,
    onSuccess,
}: {
    user: UserData | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        name: user?.name || '',
        password: '',
        role: user?.role || 'USER',
        phoneNumber: user?.phoneNumber || '',
        address: user?.address || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            if (user) {
                // Update user
                await axios.put(`/admin/users/${user.username}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('User updated successfully!');
            } else {
                // Create user
                await axios.post('/admin/users', formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('User created successfully!');
            }

            onSuccess();
        } catch (error: any) {
            console.error('Failed to save user:', error);
            alert(error.response?.data?.message || 'Failed to save user!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <CardTitle>{user ? 'Edit User' : 'Add New User'}</CardTitle>
                    <CardDescription>
                        {user ? 'Update user information and role' : 'Create a new system user'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Username</label>
                                <Input
                                    className="border border-blue-300 bg-white"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="username"
                                    disabled={!!user}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <Input
                                    className="border border-blue-300 bg-white"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <Input
                                className="border border-blue-300 bg-white"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        {!user && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Password</label>
                                <Input
                                    className="border border-blue-300 bg-white"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Min. 8 characters"
                                    required={!user}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                className="w-full border border-blue-300 bg-white rounded-md px-3 py-2"
                                required
                            >
                                <option value="USER">User</option>
                                <option value="EXPERT">Expert</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Phone Number</label>
                                <Input
                                    className="border border-blue-300 bg-white"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    placeholder="081234567890"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Address</label>
                                <Input
                                    className="border border-blue-300 bg-white"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button className="bg-red-600 text-white border-red-700 hover:text-red-600" type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-blue-600 text-white hover:bg-blue-900">
                                {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
