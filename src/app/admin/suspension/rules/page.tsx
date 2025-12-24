'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, AlertCircle, Info } from 'lucide-react';
import axios from '@/lib/axios';

interface Rule {
    id: number;
    problem: { id: string; name: string };
    symptom: { id: string; name: string };
    expertCf: number;
}

interface Problem {
    id: string;
    name: string;
}

interface Symptom {
    id: string;
    name: string;
}

export default function SuspensionRulesPage() {
    const [rules, setRules] = useState<Rule[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [symptoms, setSymptoms] = useState<Symptom[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProblem, setSelectedProblem] = useState<string>('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            const [rulesRes, problemsRes, symptomsRes] = await Promise.all([
                axios.get('/admin/suspension/rules', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('/admin/suspension/problems', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { limit: 100 },
                }),
                axios.get('/admin/suspension/symptoms', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { limit: 100 },
                }),
            ]);

            // ResponseInterceptor wraps response: { data: { data: [...], meta: {...} } }
            setRules(rulesRes.data.data.data || []);
            setProblems(problemsRes.data.data.data || []);
            setSymptoms(symptomsRes.data.data.data || []);

            if ((problemsRes.data.data.data || []).length > 0) {
                setSelectedProblem(problemsRes.data.data.data[0].id);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setRules([]);
            setProblems([]);
            setSymptoms([]);
            setLoading(false);
        }
    };

    const getRuleId = (problemId: string, symptomId: string): number | null => {
        const rule = rules.find(
            (r) => r.problem.id === problemId && r.symptom.id === symptomId
        );
        return rule ? rule.id : null;
    };

    const handleUpdateCF = async (problemId: string, symptomId: string, cfValue: number) => {
        const ruleId = getRuleId(problemId, symptomId);

        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            if (ruleId) {
                await axios.put(
                    `/admin/suspension/rules/${ruleId}`,
                    { expertCf: cfValue },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    '/admin/suspension/rules',
                    {
                        problemId,
                        symptomId,
                        expertCf: cfValue,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            fetchData();
        } catch (error: any) {
            console.error('Failed to save CF:', error);
            alert(error.response?.data?.message || 'Failed to save CF value!');
        }
    };

    const handleDeleteRule = async (ruleId: number) => {
        if (!confirm('Hapus rule ini?')) return;

        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            await axios.delete(`/admin/suspension/rules/${ruleId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchData();
            alert('Rule deleted!');
        } catch (error) {
            console.error('Failed to delete rule:', error);
            alert('Failed to delete rule!');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    const filteredRules = selectedProblem
        ? rules.filter((r) => r.problem.id === selectedProblem)
        : rules;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Suspension Rules (CF Editor)</h1>
                    <p className="text-gray-600 mt-2">Manage Certainty Factor values for expert system</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 hover:bg-green-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                </Button>
            </div>

            <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="text-sm text-green-900">
                            <p className="font-semibold mb-1">Certainty Factor (CF) Guidelines:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>CF range: 0.0 - 1.0</li>
                                <li>0.0 = No certainty, 1.0 = Absolutely certain</li>
                                <li>Recommended: 0.6 - 0.9 for most cases</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <label className="font-semibold text-gray-700">Filter by Problem:</label>
                        <select
                            value={selectedProblem}
                            onChange={(e) => setSelectedProblem(e.target.value)}
                            className="border rounded-md px-3 py-2 min-w-[300px]"
                        >
                            <option value="">All Problems</option>
                            {problems.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.id} - {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Rules Matrix</CardTitle>
                    <CardDescription>
                        Total: {filteredRules.length} rules
                        {selectedProblem && ` for ${selectedProblem}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 font-semibold">Problem</th>
                                    <th className="text-left p-4 font-semibold">Symptom</th>
                                    <th className="text-center p-4 font-semibold">CF Value</th>
                                    <th className="text-right p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRules.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-500">
                                            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                            No rules found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRules.map((rule) => (
                                        <tr key={rule.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <div>
                                                    <span className="font-mono text-sm font-semibold text-green-600">
                                                        {rule.problem.id}
                                                    </span>
                                                    <p className="text-sm text-gray-600">{rule.problem.name}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <span className="font-mono text-sm font-semibold text-green-600">
                                                        {rule.symptom.id}
                                                    </span>
                                                    <p className="text-sm text-gray-600">{rule.symptom.name}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <CFInput
                                                    value={rule.expertCf}
                                                    onChange={(value) =>
                                                        handleUpdateCF(rule.problem.id, rule.symptom.id, value)
                                                    }
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteRule(rule.id)}
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

            {showAddModal && (
                <AddRuleModal
                    problems={problems}
                    symptoms={symptoms}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}

function CFInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
    const [editing, setEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value.toString());

    const handleSave = () => {
        const numValue = parseFloat(tempValue);
        if (isNaN(numValue) || numValue < 0 || numValue > 1) {
            alert('CF must be between 0.0 and 1.0');
            setTempValue(value.toString());
            return;
        }
        onChange(numValue);
        setEditing(false);
    };

    if (editing) {
        return (
            <div className="flex items-center gap-2 justify-center">
                <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="w-24 text-center"
                    autoFocus
                    onBlur={handleSave}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') {
                            setTempValue(value.toString());
                            setEditing(false);
                        }
                    }}
                />
            </div>
        );
    }

    const getColorClass = (cf: number) => {
        if (cf >= 0.8) return 'bg-green-100 text-green-800 border-green-300';
        if (cf >= 0.6) return 'bg-blue-100 text-blue-800 border-blue-300';
        if (cf >= 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        return 'bg-red-100 text-red-800 border-red-300';
    };

    return (
        <div className="flex justify-center">
            <button
                onClick={() => setEditing(true)}
                className={`px-4 py-2 rounded-md border-2 font-semibold ${getColorClass(value)} hover:opacity-80 transition-opacity`}
            >
                {value.toFixed(2)}
            </button>
        </div>
    );
}

function AddRuleModal({
    problems,
    symptoms,
    onClose,
    onSuccess,
}: {
    problems: Problem[];
    symptoms: Symptom[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        problemId: '',
        symptomId: '',
        expertCf: 0.7,
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

            await axios.post('/admin/suspension/rules', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('Rule created successfully!');
            onSuccess();
        } catch (error: any) {
            console.error('Failed to create rule:', error);
            alert(error.response?.data?.message || 'Failed to create rule!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Add New Rule</CardTitle>
                    <CardDescription>Create a new Problem-Symptom rule with CF value</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Problem</label>
                            <select
                                value={formData.problemId}
                                onChange={(e) => setFormData({ ...formData, problemId: e.target.value })}
                                className="w-full border rounded-md px-3 py-2"
                                required
                            >
                                <option value="">Select Problem</option>
                                {problems.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.id} - {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Symptom</label>
                            <select
                                value={formData.symptomId}
                                onChange={(e) => setFormData({ ...formData, symptomId: e.target.value })}
                                className="w-full border rounded-md px-3 py-2"
                                required
                            >
                                <option value="">Select Symptom</option>
                                {symptoms.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.id} - {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">CF Value (0.0 - 1.0)</label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={formData.expertCf}
                                onChange={(e) =>
                                    setFormData({ ...formData, expertCf: parseFloat(e.target.value) })
                                }
                                required
                            />
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                                {loading ? 'Creating...' : 'Create Rule'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
