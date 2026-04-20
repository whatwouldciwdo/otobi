"use client";

import { useEffect, useState } from "react";
import { useShop } from "../context/ShopContext";
import styles from "./Dashboard.module.css";
import {
  FiCalendar,
  FiFilter,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiPieChart,
  FiBarChart2,
  FiList,
  FiChevronDown,
} from "react-icons/fi";

type DateRange = "7" | "30" | "90" | "all";
type TopFilter = "week" | "month" | "all";

type OverviewPayload = {
  stats: {
    totalRevenue: number;
    totalSubtotal: number;
    totalShipping: number;
    orderCount: number;
    customerCount: number;
    averageOrderValue: number;
    productCount: number;
    activePromos: number;
    publishedBlogs: number;
    conversionTarget: number;
  };
  statusBreakdown: Array<{ label: string; value: number }>;
  topCategories: Array<{ label: string; value: number }>;
  salesSeries: Array<{ label: string; revenue: number; orders: number }>;
  recentOrders: Array<{
    id: string;
    recipientName: string;
    recipientAreaName: string;
    courierLabel: string;
    status: string;
    total: number;
    itemCount: number;
    createdAt: string;
  }>;
  recentActivities: Array<{ type: string; title: string; time: string }>;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 3 Months" },
  { value: "all", label: "All Time" },
];

const TOP_FILTER_OPTIONS: { value: TopFilter; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "month", label: "Month" },
  { value: "all", label: "All Time" },
];

function formatDateRangeLabel(range: DateRange) {
  const now = new Date();
  const end = `${now.getDate()} ${now.toLocaleString("en-US", { month: "short" })}`;
  if (range === "all") return "All Time";
  const from = new Date();
  from.setDate(from.getDate() - parseInt(range));
  const start = `${from.getDate()} ${from.toLocaleString("en-US", { month: "short" })}`;
  return `${start} – ${end}`;
}

export default function AdminDashboard() {
  const { user } = useShop();
  const [overview, setOverview] = useState<OverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("7");
  const [topFilter, setTopFilter] = useState<TopFilter>("month");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchOverview = async (range: DateRange, top: TopFilter) => {
    if (!user || user.role !== "ADMIN") return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/overview?userId=${user.id}&days=${range}&topFilter=${top}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch admin overview.");
      setOverview(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview(dateRange, topFilter);
  }, [user, dateRange, topFilter]);

  if (loading) return <div className={styles.loading}>Loading analytical board...</div>;
  if (error || !overview) return <div className={styles.error}>{error || "Dashboard unavailable."}</div>;

  const { stats, salesSeries, recentOrders, statusBreakdown } = overview;

  const conversionRate = stats.conversionTarget
    ? Math.min(100, Math.round((stats.orderCount / stats.conversionTarget) * 100))
    : 0;

  
  const completedOrders = statusBreakdown
    .filter((s) => ["completed", "delivered", "received", "order_received"].includes(s.label.toLowerCase()))
    .reduce((acc, s) => acc + s.value, 0);
  const pendingOrders = Math.max(0, stats.orderCount - completedOrders);

  
  const total3 = stats.orderCount + stats.customerCount + 1; 
  const ordersRatio = (stats.orderCount / total3) * 360;
  const customersRatio = (stats.customerCount / total3) * 360;
  const aovRatio = Math.max(360 - ordersRatio - customersRatio, 0);
  const donutGradient = `conic-gradient(#876DFF 0deg ${ordersRatio}deg, #E2FF99 ${ordersRatio}deg ${ordersRatio + customersRatio}deg, #BAF91A ${ordersRatio + customersRatio}deg 360deg)`;

  
  const maxOrders = Math.max(...salesSeries.map((s) => s.orders), 1);

  return (
    <div className={styles.dashboard}>
      <div className={styles.topSection}>
        <h1>Your Analytical Board</h1>
        <div className={styles.actionButtons}>
          <div className={styles.datePickerWrapper}>
            <button
              className={styles.ghostBtn}
              onClick={() => setShowDatePicker((v) => !v)}
            >
              <FiCalendar />
              {DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label}
              <FiChevronDown className={showDatePicker ? styles.chevronUp : ""} />
            </button>
            {showDatePicker && (
              <div className={styles.dateDropdown}>
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`${styles.dateOption} ${dateRange === opt.value ? styles.dateOptionActive : ""}`}
                    onClick={() => {
                      setDateRange(opt.value);
                      setShowDatePicker(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className={styles.ghostBtnIcon}>
            <FiFilter />
          </button>
        </div>
      </div>

      <section className={styles.smartDistributionCard}>
        <div className={styles.bgGlow}></div>
        <div className={styles.bgGlow2}></div>

        <div className={styles.cardHeader}>
          <h2>Smart Sales Distribution</h2>
          <p>Sales metrics for {formatDateRangeLabel(dateRange)} — from {stats.orderCount} orders and {stats.customerCount} customers.</p>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>
              <FiDollarSign className={styles.metricIcon} /> Total Income
            </div>
            <div className={styles.metricValue}>
              {money(stats.totalRevenue)} <span>IDR</span>
            </div>
          </div>

          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>
              <FiTrendingUp className={styles.metricIcon} /> Target Progress
            </div>
            <div className={styles.metricValue}>
              +{conversionRate} <span>%</span>
            </div>
          </div>

          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>
              <FiUsers className={styles.metricIcon} /> Total Lifetime Customers
            </div>
            <div className={styles.metricValue}>
              {new Intl.NumberFormat("en-US").format(stats.customerCount)}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.analysisRow}>
        <div className={styles.salesAnalysisCard}>
          <div className={styles.cardTop}>
            <div className={styles.cardTitle}>
              <FiPieChart /> Sales Analysis
            </div>
            <div className={styles.dateBadge}>{formatDateRangeLabel(dateRange)}</div>
          </div>

          <div className={styles.chartContainer}>
            <div
              className={styles.donutPlaceholder}
              style={{ background: donutGradient }}
            >
              <div className={styles.donutHole}>
                <span className={styles.donutValue}>IDR {money(stats.totalSubtotal)}</span>
                <span className={styles.donutLabel}>Total Revenue</span>
              </div>
            </div>

            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: "#876DFF" }}></span>
                <strong>{stats.orderCount}</strong> Orders
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: "#E2FF99" }}></span>
                <strong>{stats.customerCount}</strong> Customers
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: "#BAF91A" }}></span>
                <strong>{money(stats.averageOrderValue)}</strong> AOV
              </div>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <span>Calculated from aggregated activity for {formatDateRangeLabel(dateRange)}</span>
          </div>
        </div>

        <div className={styles.dealAnalysisCard}>
          <div className={styles.cardTop}>
            <div className={styles.cardTitle}>
              <FiBarChart2 /> Deal Analysis
            </div>
            <div className={styles.dateBadge}>{formatDateRangeLabel(dateRange)}</div>
          </div>

          <div className={styles.dealBlocks}>
            <div className={styles.dealBlockWon}>
              <div className={styles.dealBlockHeader}>
                <span>Won Deals</span>
                <strong>{completedOrders}</strong>
              </div>
              <div className={styles.dealChartBars}>
                {salesSeries.slice(-5).map((point, i) => (
                  <div
                    key={i}
                    className={styles.dealBar}
                    style={{ height: `${Math.max(10, Math.ceil((point.orders / maxOrders) * 100))}%` }}
                    title={`${point.label}: ${point.orders} orders`}
                  ></div>
                ))}
              </div>
            </div>
            <div className={styles.dealsRight}>
              <div className={styles.dealBlockImproved}>
                <span>Conversion</span>
                <strong>{conversionRate}%</strong>
              </div>
              <div className={styles.dealBlockLost}>
                <div className={styles.dealBlockHeader}>
                  <span>Pending or Lost</span>
                  <strong>{pendingOrders}</strong>
                </div>
                <div className={styles.lostDarkSquare}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.opportunitiesSection}>
        <div className={styles.oppHeader}>
          <div className={styles.oppTitle}>
            <FiList /> Top opportunities
          </div>
          <div className={styles.topFilterWrapper}>
            {TOP_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.filterPill} ${topFilter === opt.value ? styles.filterPillActive : ""}`}
                onClick={() => setTopFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Name</span>
            <span>Region</span>
            <span>Items</span>
            <span>Status</span>
            <span>Account Value</span>
            <span>Value</span>
          </div>

          <div className={styles.tableBody}>
            {recentOrders.length === 0 && (
              <div className={styles.emptyRow}>No recent orders recorded yet.</div>
            )}
            {recentOrders.map((order) => (
              <div key={order.id} className={styles.tableRow}>
                <div className={styles.avatarName}>
                  <div
                    className={styles.rowAvatar}
                    style={{
                      backgroundImage: `url(https://ui-avatars.com/api/?name=${encodeURIComponent(order.recipientName)}&background=0D8ABC&color=fff)`,
                    }}
                  ></div>
                  <strong>{order.recipientName}</strong>
                </div>
                <span>{order.recipientAreaName}</span>
                <span>{order.itemCount} items</span>
                <div className={styles.progressCell}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: ["completed", "delivered", "received"].includes(order.status.toLowerCase())
                          ? "100%"
                          : "55%",
                        background: ["completed", "delivered", "received"].includes(order.status.toLowerCase())
                          ? "#BAF91A"
                          : "#876DFF",
                      }}
                    ></div>
                  </div>
                  <span
                    style={{
                      color: ["completed", "delivered", "received"].includes(order.status.toLowerCase())
                        ? "#5a8000"
                        : "#5b46cc",
                    }}
                  >
                    {order.status}
                  </span>
                </div>
                <span className={styles.increaseValue}>+{money(order.total * 0.15)}</span>
                <span className={styles.totalValue}>IDR {money(order.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
