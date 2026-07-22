import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import nasabah from '@/routes/nasabah';
import type { Sampah, User, PaginatedData } from '@/types';

interface Transaction {
    id: number;
    total_weight: number;
    total_income: number;
    point_received: number;
    created_at: string;
    sampah?: Sampah;
    admin?: User;
}

interface TransactionsProps {
    transactions: PaginatedData<Transaction>;
    filters: { search?: string };
}

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

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

export default function Transactions({
    transactions,
    filters,
}: TransactionsProps) {
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    nasabah.transactions.index().url,
                    { search },
                    { preserveState: true, replace: true },
                );
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search, filters.search]);

    return (
        <>
            <Head title="Riwayat Setoran" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="border-b border-sidebar-border/70 pb-4 dark:border-sidebar-border">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Riwayat Setoran Sampah
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Daftar semua setoran sampah Anda beserta berat (kg) dan status pemilahan sampah.
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari berdasarkan jenis sampah..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-sidebar-border/70 bg-sidebar text-xs uppercase dark:border-sidebar-border dark:bg-neutral-900">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">
                                    Tanggal
                                </th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">
                                    Jenis Sampah
                                </th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">
                                    Berat (KG)
                                </th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">
                                    Keterangan
                                </th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">
                                    Dicatat Oleh
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/50 dark:divide-sidebar-border/30">
                            {transactions.data.length > 0 ? (
                                transactions.data.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        className="transition-colors hover:bg-accent/40"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            {formatDate(tx.created_at)}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {tx.sampah?.name ?? 'Sampah'}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-foreground">
                                            {tx.total_weight} kg
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {(() => {
                                                const status = getPemilahanStatus(
                                                    tx.sampah?.name,
                                                    tx.sampah?.category?.name,
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
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {tx.admin?.name ?? 'Petugas'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center text-muted-foreground"
                                    >
                                        Belum ada riwayat setoran yang
                                        ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {transactions.total > transactions.per_page && (
                    <div className="flex flex-col gap-4 border-t border-sidebar-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-sidebar-border">
                        <div className="text-center text-xs text-muted-foreground sm:text-left">
                            Menampilkan {transactions.from} hingga{' '}
                            {transactions.to} dari {transactions.total} setoran
                        </div>
                        <div className="flex flex-wrap justify-center gap-1">
                            {transactions.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (link.url) {
                                            router.get(
                                                link.url,
                                                { search },
                                                {
                                                    preserveState: true,
                                                    replace: true,
                                                },
                                            );
                                        }
                                    }}
                                    disabled={!link.url}
                                    className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                                        link.active
                                            ? 'border-transparent bg-primary font-medium text-primary-foreground'
                                            : 'border-sidebar-border/70 text-foreground hover:bg-accent dark:border-sidebar-border'
                                    } ${!link.url ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Transactions.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: nasabah.dashboard().url },
        { title: 'Riwayat Setoran', href: nasabah.transactions.index().url },
    ],
};
