'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react';
import axios from '@/lib/axios';

interface Symptom {
    id: string;
    name: string;
    question: string;
}

export default function SuspensionSymptomsPage() {
    const [symptoms, setSymptoms] = useState<Symptom[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);

    useEffect(() => {
        fetchSymptoms();
    }, [page, search]);

    const fetchSymptoms = async () => {
        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            const response = await axios.get('/admin/suspension/symptoms', {
                headers: { Authorization: `Bearer ${token}` },
                params: { search, page, limit: 10 },
            });

            // ResponseInterceptor wraps response: { data: { data: [...], meta: {...} } }
            setSymptoms(response.data.data.data || []);
            setTotalPages(response.data.data.meta?.totalPages || 1);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch symptoms:', error);
            setSymptoms([]);  // Set empty array on error
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus symptom ini?')) return;

        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            await axios.delete(`/admin/suspension/symptoms/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchSymptoms();
            alert('Symptom berhasil dihapus!');
        } catch (error) {
            console.error('Failed to delete symptom:', error);
            alert('Gagal menghapus symptom!');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Suspension Symptoms</h1>
                    <p className="text-gray-600 mt-2">Manage suspension symptom database</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingSymptom(null);
                        setShowModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Symptom
                </Button>
            </div>

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

            <Card>
                <CardHeader>
                    <CardTitle>Symptoms List</CardTitle>
                    <CardDescription>Total: {symptoms.length} symptoms</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 font-semibold">ID</th>
                                    <th className="text-left p-4 font-semibold">Name</th>
                                    <th className="text-left p-4 font-semibold">Question</th>
                                    <th className="text-right p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {symptoms.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-500">
                                            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                            No symptoms found
                                        </td>
                                    </tr>
                                ) : (
                                    symptoms.map((symptom) => (
                                        <tr key={symptom.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <span className="font-mono text-sm font-semibold text-green-600">
                                                    {symptom.id}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium">{symptom.name}</td>
                                            <td className="p-4 text-sm text-gray-600 max-w-md truncate">
                                                {symptom.question}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingSymptom(symptom);
                                                            setShowModal(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(symptom.id)}
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

            {showModal && (
                <SymptomModal
                    symptom={editingSymptom}
                    onClose={() => {
                        setShowModal(false);
                        setEditingSymptom(null);
                    }}
                    onSuccess={() => {
                        setShowModal(false);
                        setEditingSymptom(null);
                        fetchSymptoms();
                    }}
                />
            )}
        </div>
    );
}

function SymptomModal({
    symptom,
    onClose,
    onSuccess,
}: {
    symptom: Symptom | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        id: symptom?.id || '',
        name: symptom?.name || '',
        question: symptom?.question || '',
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

            if (symptom) {
                await axios.put(`/admin/suspension/symptoms/${symptom.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Symptom updated successfully!');
            } else {
                await axios.post('/admin/suspension/symptoms', formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Symptom created successfully!');
            }

            onSuccess();
        } catch (error: any) {
            console.error('Failed to save symptom:', error);
            alert(error.response?.data?.message || 'Failed to save symptom!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <CardTitle>{symptom ? 'Edit Symptom' : 'Add New Symptom'}</CardTitle>
                    <CardDescription>
                        {symptom ? 'Update symptom information' : 'Create a new suspension symptom'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Symptom ID</label>
                            <Input
                                value={formData.id}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                placeholder="e.g., GS01"
                                disabled={!!symptom}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Symptom Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Mobil Terasa Goyang"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Question</label>
                            <textarea
                                className="w-full border rounded-md p-2 min-h-[100px]"
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                placeholder="e.g., Apakah mobil terasa goyang saat dikendarai?"
                                required
                            />
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                                {loading ? 'Saving...' : symptom ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
