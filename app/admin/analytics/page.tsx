"use client";

import { useEffect, useState } from "react";
import { useShop } from "../../context/ShopContext";
import styles from "./Analytics.module.css";
import {
  FiTrendingUp,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiPackage,
  FiBarChart2,
  FiCalendar,
  FiChevronDown,
} from "react-icons/fi";

type DateRange = "7" | "30" | "90" | "all";

type OverviewData = {
  stats: {
    totalRevenue: number;
    orderCount: number;
    customerCount: number;
    averageOrderValue: number;
    productCount: number;
    activePromos: number;
    publishedBlogs: number;
  };
  statusBreakdown: Array<{ label: string; value: number }>;
  topCategories: Array<{ label: string; value: number }>;
  salesSeries: Array<{ label: string; revenue: number; orders: number }>;
};

const money = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v || 0);

const DATE_OPTS: { value: DateRange; label: string }[] = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 3 Months" },
  { value: "all", label: "All Time" },
];

export default function AnalyticsPage() {
  const { user } = useShop();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("30");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    setLoading(true);
    fetch(`/api/admin/overview?userId=${user.id}&days=${dateRange}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [user, dateRange]);

  if (loading) return <div className={styles.loading}>Loading analytics...</div>;
  if (!data) return <div className={styles.error}>Failed to load analytics.</div>;

  const { stats, salesSeries, statusBreakdown, topCategories } = data;
  const maxRevenue = Math.max(...salesSeries.map((s) => s.revenue), 1);
  const maxOrders = Math.max(...salesSeries.map((s) => s.orders), 1);
  const totalStatusCount = statusBreakdown.reduce((acc, s) => acc + s.value, 0);

  return (
    <div className={styles.page}>
      
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>Analytics</p>
          <h1>Performance Overview</h1>
        </div>
        <div className={styles.dateWrapper}>
          <button className={styles.dateBtn} onClick={() => setShowPicker((v) => !v)}>
            <FiCalendar />
            {DATE_OPTS.find((o) => o.value === dateRange)?.label}
            <FiChevronDown className={showPicker ? styles.flip : ""} />
          </button>
          {showPicker && (
            <div className={styles.dateDrop}>
              {DATE_OPTS.map((o) => (
                <button
                  key={o.value}
                  className={`${styles.dateOpt} ${dateRange === o.value ? styles.dateOptActive : ""}`}
                  onClick={() => { setDateRange(o.value); setShowPicker(false); }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      
      <div className={styles.kpiGrid}>
        {[
          { icon: <FiDollarSign />, label: "Total Revenue", value: money(stats.totalRevenue), color: "var(--neon-green)" },
          { icon: <FiShoppingBag />, label: "Total Orders", value: stats.orderCount.toString(), color: "var(--purple-accent)" },
          { icon: <FiUsers />, label: "Customers", value: stats.customerCount.toString(), color: "var(--light-vi)" },
          { icon: <FiTrendingUp />, label: "Avg. Order Value", value: money(stats.averageOrderValue), color: "var(--neon-green)" },
          { icon: <FiPackage />, label: "Products Listed", value: stats.productCount.toString(), color: "var(--purple-accent)" },
          { icon: <FiBarChart2 />, label: "Active Promos", value: stats.activePromos.toString(), color: "var(--light-vi)" },
        ].map((kpi) => (
          <div key={kpi.label} className={styles.kpiCard}>
            <div className={styles.kpiIconWrapper} data-color={kpi.color}>
              {kpi.icon}
            </div>
            <div>
              <p className={styles.kpiLabel}>{kpi.label}</p>
              <strong className={styles.kpiValue}>{kpi.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartsRow}>
        
        <div className={styles.chartCard}>
          <div className={styles.chartCardHeader}>
            <h2>Revenue Over Time</h2>
            <span className={styles.chartPeriod}>{DATE_OPTS.find(o => o.value === dateRange)?.label}</span>
          </div>
          <div className={styles.barChart}>
            {salesSeries.map((point, i) => (
              <div key={i} className={styles.barGroup}>
                <div className={styles.barWrap}>
                  <div
                    className={styles.bar}
                    style={{ height: `${Math.max(4, (point.revenue / maxRevenue) * 100)}%` }}
                    title={`${point.label}: ${money(point.revenue)}`}
                  />
                </div>
                <span className={styles.barLabel}>{point.label}</span>
              </div>
            ))}
          </div>
        </div>

        
        <div className={styles.chartCard}>
          <div className={styles.chartCardHeader}>
            <h2>Order Volume</h2>
            <span className={styles.chartPeriod}>{DATE_OPTS.find(o => o.value === dateRange)?.label}</span>
          </div>
          <div className={styles.barChart}>
            {salesSeries.map((point, i) => (
              <div key={i} className={styles.barGroup}>
                <div className={styles.barWrap}>
                  <div
                    className={`${styles.bar} ${styles.barPurple}`}
                    style={{ height: `${Math.max(4, (point.orders / maxOrders) * 100)}%` }}
                    title={`${point.label}: ${point.orders} orders`}
                  />
                </div>
                <span className={styles.barLabel}>{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottomRow}>
        
        <div className={styles.tableCard}>
          <h2>Top Categories</h2>
          <div className={styles.categoryList}>
            {topCategories.length === 0 && <p className={styles.empty}>No category data yet.</p>}
            {topCategories.map((cat, i) => {
              const maxCat = topCategories[0]?.value || 1;
              return (
                <div key={cat.label} className={styles.categoryRow}>
                  <span className={styles.catRank}>#{i + 1}</span>
                  <div className={styles.catInfo}>
                    <span className={styles.catName}>{cat.label}</span>
                    <div className={styles.catBar}>
                      <div
                        className={styles.catFill}
                        style={{ width: `${(cat.value / maxCat) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className={styles.catCount}>{cat.value} products</span>
                </div>
              );
            })}
          </div>
        </div>

        
        <div className={styles.tableCard}>
          <h2>Order Status Breakdown</h2>
          <div className={styles.statusList}>
            {statusBreakdown.length === 0 && <p className={styles.empty}>No order data yet.</p>}
            {statusBreakdown.map((s) => {
              const pct = totalStatusCount > 0 ? Math.round((s.value / totalStatusCount) * 100) : 0;
              const isWon = ["completed", "delivered", "received", "order_received"].includes(s.label.toLowerCase());
              return (
                <div key={s.label} className={styles.statusRow}>
                  <div className={styles.statusDot} style={{ background: isWon ? "#baf91a" : "#876DFF" }} />
                  <div className={styles.statusInfo}>
                    <span className={styles.statusName}>{s.label}</span>
                    <div className={styles.statusBar}>
                      <div
                        className={styles.statusFill}
                        style={{ width: `${pct}%`, background: isWon ? "#baf91a" : "#876DFF" }}
                      />
                    </div>
                  </div>
                  <span className={styles.statusCount}>{s.value} <small>({pct}%)</small></span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
