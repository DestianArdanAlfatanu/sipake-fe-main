'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, AlertCircle, Info, Pencil } from 'lucide-react';
import axios from '@/lib/axios';

interface Rule {
    id: number;
    problem: { id: string; name: string };
    symptom: { id: string; name: string };
    cfPakar: number;
}

interface Problem {
    id: string;
    name: string;
}

interface Symptom {
    id: string;
    name: string;
}

// Ambil token dari cookie
function getToken(): string {
    return document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1] ?? '';
}

// Gabungkan dua array, deduplikasi berdasarkan id, lalu sort
function mergeById<T extends { id: string }>(a: T[], b: T[]): T[] {
    const map = new Map<string, T>();
    for (const item of [...a, ...b]) {
        if (item?.id && !map.has(item.id)) map.set(item.id, item);
    }
    return Array.from(map.values()).sort((x, y) => x.id.localeCompare(y.id));
}

// Mapping nilai CF ke istilah kualitatif pakar
const CF_OPTIONS = [
    { value: 1.0, label: 'Sangat Pasti / Selalu' },
    { value: 0.9, label: 'Hampir Pasti' },
    { value: 0.8, label: 'Sangat Yakin' },
    { value: 0.7, label: 'Yakin' },
    { value: 0.6, label: 'Kemungkinan Besar' },
    { value: 0.5, label: 'Bisa Jadi 50:50' },
    { value: 0.4, label: 'Kayaknya' },
    { value: 0.3, label: 'Kurang Yakin' },
    { value: 0.2, label: 'Kemungkinan Kecil' },
    { value: 0.1, label: 'Hampir Tidak Mungkin' },
    { value: 0.0, label: 'Pasti Tidak Mungkin' },
];

function getCfLabel(cf: number): string {
    const match = CF_OPTIONS.find((opt) => Math.abs(opt.value - cf) < 0.001);
    return match ? match.label : `Custom`;
}

function getColorClass(cf: number) {
    if (cf >= 0.9) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (cf >= 0.8) return 'bg-green-100 text-green-800 border-green-300';
    if (cf >= 0.7) return 'bg-teal-100 text-teal-800 border-teal-300';
    if (cf >= 0.6) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (cf >= 0.5) return 'bg-sky-100 text-sky-800 border-sky-300';
    if (cf >= 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (cf >= 0.3) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (cf >= 0.2) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (cf >= 0.1) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
}

export default function EngineRulesPage() {
    const [rules, setRules] = useState<Rule[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [symptoms, setSymptoms] = useState<Symptom[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProblem, setSelectedProblem] = useState<string>('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRule, setEditingRule] = useState<Rule | null>(null);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async (filterTo?: string) => {
        const token = getToken();

        try {
            // Fetch rules, problems, dan symptoms secara paralel
            const [rulesRes, problemsRes, symptomsRes] = await Promise.all([
                axios.get('/admin/engine/rules', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('/admin/engine/problems', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('/admin/engine/symptoms', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            // ---- Parse rules ----
            const rawRules = rulesRes.data?.data;
            let rulesArray: Rule[] = [];
            if (Array.isArray(rawRules)) {
                rulesArray = rawRules;
            } else if (rawRules && Array.isArray(rawRules.data)) {
                rulesArray = rawRules.data;
            }
            setRules(rulesArray);

            // ---- Parse problems ----
            const problemsFromApi: Problem[] = (() => {
                const d = problemsRes.data?.data;
                if (!d) return [];
                if (Array.isArray(d)) return d;
                if (Array.isArray(d.data)) return d.data;
                return [];
            })();

            // ---- Parse symptoms ----
            const symptomsFromApi: Symptom[] = (() => {
                const d = symptomsRes.data?.data;
                if (!d) return [];
                if (Array.isArray(d)) return d;
                if (Array.isArray(d.data)) return d.data;
                return [];
            })();

            // ---- Fallback: ekstrak dari rules (eager loaded) jika API return kosong ----
            const problemsFromRules: Problem[] = rulesArray
                .map((r) => r.problem)
                .filter((p): p is Problem => !!p?.id);
            const symptomsFromRules: Symptom[] = rulesArray
                .map((r) => r.symptom)
                .filter((s): s is Symptom => !!s?.id);

            // Merge: API + dari rules
            setProblems(mergeById(problemsFromApi, problemsFromRules));
            setSymptoms(mergeById(symptomsFromApi, symptomsFromRules));

            // Jika ada filterTo (setelah create), filter ke problem baru agar langsung terlihat
            if (filterTo !== undefined) {
                setSelectedProblem(filterTo);
            }

        } catch (error) {
            console.error('Failed to fetch data:', error);
            setRules([]);
            setProblems([]);
            setSymptoms([]);
        }

        setLoading(false);
    };

    const handleDeleteRule = async (ruleId: number) => {
        if (!confirm('Hapus rule ini?')) return;
        const token = getToken();

        try {
            await axios.delete(`/admin/engine/rules/${ruleId}`, {
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Filter rules (null-safe)
    const filteredRules = selectedProblem
        ? rules.filter((r) => r.problem?.id === selectedProblem)
        : rules.filter((r) => r.problem?.id && r.symptom?.id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900">Engine Rules (CF Editor)</h1>
                    <p className="text-sm text-gray-600 mt-1 md:mt-2">Manage Certainty Factor values for expert system</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                    size="sm"
                >
                    <Plus className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Add Rule</span>
                </Button>
            </div>

            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                        <div className="text-sm text-blue-900 w-full">
                            <p className="font-semibold mb-2">Tabel Interpretasi Nilai Certainty Factor (CF):</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-blue-200">
                                            <th className="text-left py-1 pr-4 font-semibold">Istilah Kualitatif Pakar</th>
                                            <th className="text-center py-1 font-semibold">CF Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {CF_OPTIONS.map((opt) => (
                                            <tr key={opt.value} className="border-b border-blue-100">
                                                <td className="py-1 pr-4">{opt.label}</td>
                                                <td className="text-center py-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getColorClass(opt.value)}`}>
                                                        {opt.value.toFixed(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <label className="font-semibold text-gray-700 text-sm md:text-base">Filter by Problem:</label>
                        <select
                            value={selectedProblem}
                            onChange={(e) => setSelectedProblem(e.target.value)}
                            className="border rounded-md px-3 py-2 w-full md:min-w-[300px] bg-white text-gray-900 text-sm"
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
                                    <th className="text-left p-2 md:p-4 font-semibold text-xs md:text-sm">Problem</th>
                                    <th className="text-left p-2 md:p-4 font-semibold text-xs md:text-sm">Symptom</th>
                                    <th className="text-center p-2 md:p-4 font-semibold text-xs md:text-sm">CF Value</th>
                                    <th className="text-right p-2 md:p-4 font-semibold text-xs md:text-sm">Actions</th>
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
                                    filteredRules.map((rule) => {
                                        const safeValue = (typeof rule.cfPakar === 'number' && !isNaN(rule.cfPakar)) ? rule.cfPakar : 0;
                                        return (
                                            <tr key={rule.id} className="border-b hover:bg-gray-50">
                                                <td className="p-2 md:p-4">
                                                    <div>
                                                        <span className="font-mono text-xs md:text-sm font-semibold text-blue-600">
                                                            {rule.problem?.id ?? '-'}
                                                        </span>
                                                        <p className="text-xs text-gray-600 hidden md:block">{rule.problem?.name ?? '-'}</p>
                                                    </div>
                                                </td>
                                                <td className="p-2 md:p-4">
                                                    <div>
                                                        <span className="font-mono text-xs md:text-sm font-semibold text-blue-600">
                                                            {rule.symptom?.id ?? '-'}
                                                        </span>
                                                        <p className="text-xs text-gray-600 hidden md:block">{rule.symptom?.name ?? '-'}</p>
                                                    </div>
                                                </td>
                                                <td className="p-2 md:p-4">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`px-3 py-1.5 rounded-md border-2 font-semibold text-sm ${getColorClass(safeValue)}`}>
                                                            {safeValue.toFixed(1)}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 font-medium">
                                                            {getCfLabel(safeValue)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-2 md:p-4">
                                                    <div className="flex items-center justify-end gap-1 md:gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                                            onClick={() => setEditingRule(rule)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
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
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {showAddModal && (
                <RuleModal
                    mode="add"
                    problems={problems}
                    symptoms={symptoms}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(newProblemId: string) => {
                        setShowAddModal(false);
                        fetchData(newProblemId);
                    }}
                />
            )}

            {editingRule && (
                <RuleModal
                    mode="edit"
                    problems={problems}
                    symptoms={symptoms}
                    existingRule={editingRule}
                    onClose={() => setEditingRule(null)}
                    onSuccess={() => {
                        setEditingRule(null);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}

function RuleModal({
    mode,
    problems,
    symptoms,
    existingRule,
    onClose,
    onSuccess,
}: {
    mode: 'add' | 'edit';
    problems: Problem[];
    symptoms: Symptom[];
    existingRule?: Rule;
    onClose: () => void;
    onSuccess: (problemId: string) => void;
}) {
    const problemRef = useRef<HTMLSelectElement>(null);
    const symptomRef = useRef<HTMLSelectElement>(null);
    const cfRef = useRef<HTMLSelectElement>(null);
    const [loading, setLoading] = useState(false);

    const [selectedProblemLabel, setSelectedProblemLabel] = useState('');
    const [selectedSymptomLabel, setSelectedSymptomLabel] = useState('');

    const isEdit = mode === 'edit' && existingRule;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const pId = problemRef.current?.value ?? '';
        const sId = symptomRef.current?.value ?? '';
        const cfRaw = cfRef.current?.value ?? '';
        const cf = cfRaw === '' ? 0.7 : parseFloat(cfRaw);
        const cfFinal = isNaN(cf) || cf < 0 || cf > 1 ? 0.7 : cf;

        if (!pId) {
            alert('Pilih Problem terlebih dahulu!');
            return;
        }
        if (!sId) {
            alert('Pilih Symptom terlebih dahulu!');
            return;
        }

        setLoading(true);
        try {
            const token = getToken();

            if (isEdit) {
                // UPDATE: hanya update CF value
                await axios.put(
                    `/admin/engine/rules/${existingRule.id}`,
                    { cf_pakar: cfFinal },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert('Rule updated successfully!');
            } else {
                // CREATE: buat rule baru
                const payload = { problem_id: pId, symptom_id: sId, cf_pakar: cfFinal };
                await axios.post('/admin/engine/rules', payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Rule created successfully!');
            }

            onSuccess(pId);
        } catch (error: any) {
            console.error('Failed to save rule:', error);
            alert(error.response?.data?.message || 'Failed to save rule!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{isEdit ? 'Edit Rule' : 'Add New Rule'}</CardTitle>
                    <CardDescription>
                        {isEdit
                            ? 'Update the CF value for this rule'
                            : 'Create a new Problem-Symptom rule with CF value'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Problem</label>
                            <select
                                ref={problemRef}
                                defaultValue={isEdit ? existingRule.problem?.id : ''}
                                onChange={(e) => {
                                    const opt = e.target.options[e.target.selectedIndex];
                                    setSelectedProblemLabel(opt.text);
                                }}
                                className="w-full border rounded-md px-3 py-2 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                                required
                                disabled={!!isEdit}
                            >
                                <option value="">-- Pilih Problem --</option>
                                {problems.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.id} - {p.name}
                                    </option>
                                ))}
                            </select>
                            {!isEdit && selectedProblemLabel && (
                                <p className="text-xs text-blue-700 mt-1">✓ Dipilih: {selectedProblemLabel}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Symptom</label>
                            <select
                                ref={symptomRef}
                                defaultValue={isEdit ? existingRule.symptom?.id : ''}
                                onChange={(e) => {
                                    const opt = e.target.options[e.target.selectedIndex];
                                    setSelectedSymptomLabel(opt.text);
                                }}
                                className="w-full border rounded-md px-3 py-2 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                                required
                                disabled={!!isEdit}
                            >
                                <option value="">-- Pilih Symptom --</option>
                                {symptoms.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.id} - {s.name}
                                    </option>
                                ))}
                            </select>
                            {!isEdit && selectedSymptomLabel && (
                                <p className="text-xs text-blue-700 mt-1">✓ Dipilih: {selectedSymptomLabel}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Nilai Certainty Factor (CF)</label>
                            <select
                                ref={cfRef}
                                defaultValue={isEdit ? existingRule.cfPakar.toString() : '0.7'}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                {CF_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value.toString()}>
                                        {opt.value.toFixed(1)} — {opt.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1.5">Pilih tingkat keyakinan pakar terhadap gejala ini</p>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button
                                className="bg-red-600 text-white border-red-700 hover:text-red-600"
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-blue-600 text-white hover:bg-blue-900"
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? (isEdit ? 'Updating...' : 'Creating...')
                                    : (isEdit ? 'Update Rule' : 'Create Rule')
                                }
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
