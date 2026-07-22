import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Leaf, TrendingUp, CheckCircle2 } from 'lucide-react';
import nasabah from '@/routes/nasabah';
import type { Sampah, User } from '@/types';

interface Transaction {
    id: number;
    total_weight: number;
    total_income: number;
    created_at: string;
    sampah?: Sampah;
    admin?: User;
}

interface DashboardStats {
    total_income: number;
    total_weight: number;
}

interface DashboardProps {
    stats: DashboardStats;
    recent_transactions: Transaction[];
}

const getPemilahanStatus = (sampahName?: string, categoryName?: string) => {
    const nameLower = (sampahName || '').toLowerCase();
    const catLower = (categoryName || '').toLowerCase();

    if (
        nameLower.includes('campur') ||
        nameLower.includes('bodong') ||
        catLower.includes('campur')
    ) {
        return {
            label: 'Dicampur',
            className:
                'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-700',
        };
    }

    return {
        label: 'Dipilah',
        className:
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
    };
};

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

export default function Dashboard({
    stats,
    recent_transactions,
}: DashboardProps) {
    const { flash } = usePage<{ flash?: { success?: string; message?: string } }>().props;
    const [showFlash, setShowFlash] = useState(true);

    useEffect(() => {
        if (flash?.success || flash?.message) {
            const timer = setTimeout(() => {
                setShowFlash(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const statCards = [
        {
            label: 'Total Berat Setoran',
            value: `${stats.total_weight} kg`,
            icon: Leaf,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
        },
        {
            label: 'Total Kali Setor',
            value: `${recent_transactions.length} Setoran`,
            icon: TrendingUp,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
        },
    ];

    return (
        <>
            <Head title="Dashboard Nasabah" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Flash Message 5 Detik */}
                {showFlash && (flash?.success || flash?.message) && (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-500/15 p-4 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 transition-all duration-500">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="font-semibold text-sm">
                                {flash.success || flash.message}
                            </span>
                        </div>
                        <button
                            onClick={() => setShowFlash(false)}
                            className="text-xs font-bold hover:underline opacity-80 hover:opacity-100 ml-4"
                        >
                            Tutup
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="border-b border-sidebar-border/70 pb-4 dark:border-sidebar-border">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Dashboard Saya
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pantau statistik dan riwayat setoran sampah Anda.
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className={`rounded-xl border ${card.border} flex items-center gap-4 bg-card p-5 shadow-xs`}
                        >
                            <div
                                className={`rounded-lg ${card.bg} shrink-0 p-3`}
                            >
                                <card.icon className={`size-6 ${card.color}`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {card.label}
                                </p>
                                <p
                                    className={`mt-0.5 text-xl font-bold ${card.color} truncate`}
                                >
                                    {card.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Transactions */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-base font-semibold text-foreground">
                        5 Setoran Terakhir
                    </h2>
                    <div className="overflow-x-auto rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-sidebar text-xs uppercase dark:border-sidebar-border dark:bg-neutral-900">
                                <tr>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground">
                                        Tanggal
                                    </th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground">
                                        Jenis Sampah
                                    </th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground">
                                        Berat (KG)
                                    </th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground">
                                        Keterangan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/50 dark:divide-sidebar-border/30">
                                {recent_transactions.length > 0 ? (
                                    recent_transactions.map((tx) => (
                                        <tr
                                            key={tx.id}
                                            className="transition-colors hover:bg-accent/40"
                                        >
                                            <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                                                {formatDate(tx.created_at)}
                                            </td>
                                            <td className="px-5 py-3 font-medium text-foreground">
                                                {tx.sampah?.name ?? 'Sampah'}
                                            </td>
                                            <td className="px-5 py-3 font-semibold text-foreground">
                                                {tx.total_weight} kg
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {(() => {
                                                    const status =
                                                        getPemilahanStatus(
                                                            tx.sampah?.name,
                                                            tx.sampah?.category
                                                                ?.name,
                                                        );
                                                    return (
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
                                                        >
                                                            {status.label}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-5 py-10 text-center text-muted-foreground"
                                        >
                                            Belum ada setoran sampah. Yuk mulai
                                            menabung sampah!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: nasabah.dashboard().url,
        },
    ],
};
