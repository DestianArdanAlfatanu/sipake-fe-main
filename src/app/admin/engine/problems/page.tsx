'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react';
import axios from '@/lib/axios';

interface Problem {
    id: string;
    name: string;
    description: string;
    pict: string;
    solution?: {
        id: number;
        solution: string;
    };
}

export default function EngineProblemsPage() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

    useEffect(() => {
        fetchProblems();
    }, [page, search]);

    const fetchProblems = async () => {
        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            const response = await axios.get('/admin/engine/problems', {
                headers: { Authorization: `Bearer ${token}` },
                params: { search, page, limit: 10 },
            });

            setProblems(response.data.data);
            setTotalPages(response.data.meta.totalPages);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch problems:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus problem ini?')) return;

        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            await axios.delete(`/admin/engine/problems/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchProblems();
            alert('Problem berhasil dihapus!');
        } catch (error) {
            console.error('Failed to delete problem:', error);
            alert('Gagal menghapus problem!');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Engine Problems</h1>
                    <p className="text-gray-600 mt-2">Manage engine problem database</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingProblem(null);
                        setShowModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Problem
                </Button>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search by ID or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-md"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Problems Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Problems List</CardTitle>
                    <CardDescription>Total: {problems.length} problems</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 font-semibold">ID</th>
                                    <th className="text-left p-4 font-semibold">Name</th>
                                    <th className="text-left p-4 font-semibold">Description</th>
                                    <th className="text-left p-4 font-semibold">Solution</th>
                                    <th className="text-right p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {problems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500">
                                            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                            No problems found
                                        </td>
                                    </tr>
                                ) : (
                                    problems.map((problem) => (
                                        <tr key={problem.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <span className="font-mono text-sm font-semibold text-blue-600">
                                                    {problem.id}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium">{problem.name}</td>
                                            <td className="p-4 text-sm text-gray-600 max-w-md truncate">
                                                {problem.description}
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {problem.solution ? (
                                                    <span className="text-green-600">✓ Has solution</span>
                                                ) : (
                                                    <span className="text-gray-400">No solution</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingProblem(problem);
                                                            setShowModal(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(problem.id)}
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Modal - Will be implemented next */}
            {showModal && (
                <ProblemModal
                    problem={editingProblem}
                    onClose={() => {
                        setShowModal(false);
                        setEditingProblem(null);
                    }}
                    onSuccess={() => {
                        setShowModal(false);
                        setEditingProblem(null);
                        fetchProblems();
                    }}
                />
            )}
        </div>
    );
}

// Problem Modal Component
function ProblemModal({
    problem,
    onClose,
    onSuccess,
}: {
    problem: Problem | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        id: problem?.id || '',
        name: problem?.name || '',
        description: problem?.description || '',
        pict: problem?.pict || '',
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

            if (problem) {
                // Update
                await axios.put(`/admin/engine/problems/${problem.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Problem updated successfully!');
            } else {
                // Create
                await axios.post('/admin/engine/problems', formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Problem created successfully!');
            }

            onSuccess();
        } catch (error: any) {
            console.error('Failed to save problem:', error);
            alert(error.response?.data?.message || 'Failed to save problem!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <CardTitle>{problem ? 'Edit Problem' : 'Add New Problem'}</CardTitle>
                    <CardDescription>
                        {problem ? 'Update problem information' : 'Create a new engine problem'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Problem ID</label>
                            <Input
                                value={formData.id}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                placeholder="e.g., P01"
                                disabled={!!problem}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Problem Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Mesin Overheat"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                className="w-full border rounded-md p-2 min-h-[100px]"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the problem..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Image Filename</label>
                            <Input
                                value={formData.pict}
                                onChange={(e) => setFormData({ ...formData, pict: e.target.value })}
                                placeholder="e.g., overheat.jpg"
                                required
                            />
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : problem ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
