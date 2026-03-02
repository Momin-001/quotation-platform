"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    MessageSquare,
    FileText,
    Users,
    Package,
    Cpu,
    Wrench,
    FolderOpen,
    Handshake,
    HelpCircle,
    TicketCheck,
    Activity,
    CheckCircle2,
    XCircle,
    BarChart3,
    PieChart,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPie,
    Pie,
    Cell,
    Legend,
    LabelList,
} from "recharts";

const CARD_CLASS =
    "bg-white rounded-xl border border-border shadow-sm p-5 hover:shadow-md transition-shadow";
const STAT_NUMBER_CLASS = "text-2xl font-bold font-archivo text-foreground";
const LABEL_CLASS = "text-sm text-muted-foreground font-medium";

// Blue/teal palette for donut charts (no orange)
const DONUT_COLORS = [
    "oklch(0.4 0.14 260)",      // dark blue
    "oklch(0.55 0.18 261.6)",   // primary blue
    "oklch(0.6 0.12 186)",      // teal
    "oklch(0.65 0.1 220)",      // medium blue
    "oklch(0.72 0.08 220)",     // light blue / cyan
];

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/admin/dashboard/stats");
                const data = await res.json();
                if (!data.success) {
                    throw new Error(data.message || "Failed to load stats");
                }
                setStats(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Spinner className="h-10 w-10 text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-destructive">
                <p className="font-medium">Could not load dashboard</p>
                <p className="text-sm mt-1">{error}</p>
            </div>
        );
    }

    const isConnected = stats?.apiStatus === "connected";
    const enquiryChartData = stats?.enquiriesByStatus
        ? Object.entries(stats.enquiriesByStatus).map(([name, value]) => ({
              name: name.replace(/_/g, " "),
              value,
          }))
        : [];
    const quotationChartData = stats?.quotationsByStatus
        ? Object.entries(stats.quotationsByStatus).map(([name, value]) => ({
              name: name.replace(/_/g, " "),
              value,
          }))
        : [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold font-archivo text-foreground">
                    Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                    Overview of your quotation platform
                </p>
            </div>

            {/* API / Database Status */}
            <div
                className={`${CARD_CLASS} flex items-center gap-4 ${
                    isConnected
                        ? "border-green-200 bg-green-50/50"
                        : "border-red-200 bg-red-50/50"
                }`}
            >
                {isConnected ? (
                    <CheckCircle2 className="h-10 w-10 text-green-600 shrink-0" />
                ) : (
                    <XCircle className="h-10 w-10 text-red-600 shrink-0" />
                )}
                <div>
                    <p className={LABEL_CLASS}>API / Database Status</p>
                    <p
                        className={`text-lg font-semibold ${
                            isConnected ? "text-green-700" : "text-red-700"
                        }`}
                    >
                        {isConnected ? "Connected" : "Disconnected"}
                    </p>
                </div>
            </div>

            {/* Primary stats: Enquiries, Quotations, Users */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/enquiries" className={CARD_CLASS}>
                    <MessageSquare className="h-8 w-8 text-primary mb-2" />
                    <p className={LABEL_CLASS}>Total Enquiries</p>
                    <p className={STAT_NUMBER_CLASS}>
                        {stats?.totalEnquiries ?? 0}
                    </p>
                    {stats?.enquiriesLast30Days != null && (
                        <p className="text-xs text-muted-foreground mt-1">
                            +{stats.enquiriesLast30Days} in last 30 days
                        </p>
                    )}
                </Link>
                <Link href="/admin/quotations" className={CARD_CLASS}>
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <p className={LABEL_CLASS}>Total Quotations</p>
                    <p className={STAT_NUMBER_CLASS}>
                        {stats?.totalQuotations ?? 0}
                    </p>
                    {stats?.quotationsLast30Days != null && (
                        <p className="text-xs text-muted-foreground mt-1">
                            +{stats.quotationsLast30Days} in last 30 days
                        </p>
                    )}
                </Link>
                <Link href="/admin/users" className={CARD_CLASS}>
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <p className={LABEL_CLASS}>Total Users</p>
                    <p className={STAT_NUMBER_CLASS}>{stats?.totalUsers ?? 0}</p>
                    {stats?.activeUsers != null && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.activeUsers} active
                        </p>
                    )}
                </Link>
                <div className={CARD_CLASS}>
                    <Activity className="h-8 w-8 text-primary mb-2" />
                    <p className={LABEL_CLASS}>Catalog & Content</p>
                    <p className="text-lg font-semibold text-foreground">
                        Products · Controllers · Accessories
                    </p>
                </div>
            </div>

            {/* Products, Controllers, Accessories */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/admin/products" className={CARD_CLASS}>
                    <Package className="h-7 w-7 text-primary mb-2" />
                    <p className={LABEL_CLASS}>Products</p>
                    <p className={STAT_NUMBER_CLASS}>
                        {stats?.totalProducts ?? 0}
                    </p>
                    {stats?.activeProducts != null && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.activeProducts} active
                        </p>
                    )}
                </Link>
                <Link href="/admin/products" className={CARD_CLASS}>
                    <Cpu className="h-7 w-7 text-primary mb-2" />
                    <p className={LABEL_CLASS}>Controllers</p>
                    <p className={STAT_NUMBER_CLASS}>
                        {stats?.totalControllers ?? 0}
                    </p>
                </Link>
                <Link href="/admin/products" className={CARD_CLASS}>
                    <Wrench className="h-7 w-7 text-primary mb-2" />
                    <p className={LABEL_CLASS}>Accessories</p>
                    <p className={STAT_NUMBER_CLASS}>
                        {stats?.totalAccessories ?? 0}
                    </p>
                </Link>
            </div>

            {/* Categories, Partners, FAQs, Certificates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/categories" className={CARD_CLASS}>
                    <FolderOpen className="h-6 w-6 text-primary mb-2" />
                    <p className={LABEL_CLASS}>Categories</p>
                    <p className="text-xl font-bold text-foreground">
                        {stats?.totalCategories ?? 0}
                    </p>
                </Link>
                <Link href="/admin/partners" className={CARD_CLASS}>
                    <Handshake className="h-6 w-6 text-primary mb-2" />
                    <p className={LABEL_CLASS}>Partners</p>
                    <p className="text-xl font-bold text-foreground">
                        {stats?.totalPartners ?? 0}
                    </p>
                </Link>
                <Link href="/admin/faqs" className={CARD_CLASS}>
                    <HelpCircle className="h-6 w-6 text-primary mb-2" />
                    <p className={LABEL_CLASS}>FAQs</p>
                    <p className="text-xl font-bold text-foreground">
                        {stats?.totalFaqs ?? 0}
                    </p>
                </Link>
                <Link href="/admin/certificates" className={CARD_CLASS}>
                    <TicketCheck className="h-6 w-6 text-primary mb-2" />
                    <p className={LABEL_CLASS}>Certificates</p>
                    <p className="text-xl font-bold text-foreground">
                        {stats?.totalCertificates ?? 0}
                    </p>
                </Link>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`${CARD_CLASS}`}>
                    <h3 className="font-semibold font-archivo text-foreground mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Enquiries by Status
                    </h3>
                    {enquiryChartData.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={enquiryChartData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-border"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        className="text-muted-foreground"
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        className="text-muted-foreground"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "1px solid var(--border)",
                                            backgroundColor: "var(--card)",
                                        }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        radius={[4, 4, 0, 0]}
                                        name="Count"
                                    >
                                        {enquiryChartData.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={
                                                    DONUT_COLORS[
                                                        i % DONUT_COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm py-8 text-center">
                            No enquiry data yet
                        </p>
                    )}
                </div>
                <div className={CARD_CLASS}>
                    <h3 className="font-semibold font-archivo text-foreground mb-4 flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-primary" />
                        Quotations by Status
                    </h3>
                    {quotationChartData.length > 0 ? (
                        <div className="h-72 flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPie>
                                    <Pie
                                        data={quotationChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="58%"
                                        outerRadius="78%"
                                        paddingAngle={2}
                                        stroke="none"
                                    >
                                        {quotationChartData.map((entry, i) => (
                                            <Cell
                                                key={i}
                                                fill={
                                                    DONUT_COLORS[
                                                        i % DONUT_COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                        <LabelList
                                            dataKey="value"
                                            position="outside"
                                            formatter={(value, _n, props) => {
                                                const total = quotationChartData.reduce((s, d) => s + d.value, 0) || 1;
                                                const pct = Math.round((value / total) * 100);
                                                const segmentName = props?.payload?.name ?? "";
                                                return `${pct}% ${segmentName}`;
                                            }}
                                            className="fill-foreground text-sm"
                                        />
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "1px solid var(--border)",
                                            backgroundColor: "var(--card)",
                                        }}
                                        formatter={(value, name) => {
                                            const total = quotationChartData.reduce((s, d) => s + d.value, 0) || 1;
                                            const pct = Math.round((value / total) * 100);
                                            return [`${value} (${pct}%)`, name];
                                        }}
                                    />
                                </RechartsPie>
                            </ResponsiveContainer>
                            {/* Center label */}
                            <div
                                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                                aria-hidden
                            >
                                <span className="text-3xl font-bold text-foreground tabular-nums">
                                    {quotationChartData.reduce((s, d) => s + d.value, 0)}
                                </span>
                                <span className="text-sm text-muted-foreground mt-0.5">
                                    Total
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm py-8 text-center">
                            No quotation data yet
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
