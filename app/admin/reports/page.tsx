"use client";

import { useEffect, useState } from "react";
import { useShop } from "../../context/ShopContext";
import styles from "./Reports.module.css";
import {
  FiDownload,
  FiFileText,
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiBox,
  FiTag,
  FiCalendar,
  FiChevronDown,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

type DateRange = "7" | "30" | "90" | "all";

type OverviewData = {
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
};

const money = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v || 0);

const DATE_OPTS: { value: DateRange; label: string }[] = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 3 Months" },
  { value: "all", label: "All Time" },
];

export default function ReportsPage() {
  const { user } = useShop();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("30");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    setLoading(true);
    fetch(`/api/admin/overview?userId=${user.id}&days=${dateRange}&topFilter=all`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [user, dateRange]);

  const handleExportSales = async () => {
    if (!data) return;
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales Report");

    sheet.columns = [
      { header: "Periode", key: "period", width: 20 },
      { header: "Total Orders", key: "orders", width: 15 },
      { header: "Total Pendapatan (IDR)", key: "revenue", width: 30 }
    ];

    data.salesSeries.forEach(s => {
      sheet.addRow({
        period: s.label,
        orders: s.orders,
        revenue: s.revenue
      });
    });

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF876DFF" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    
    sheet.eachRow((row, index) => {
      if (index > 1) {
        row.getCell("revenue").numFmt = '"Rp" #,##0';
        row.alignment = { vertical: "middle" };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `sales-report-${dateRange}days.xlsx`);
  };

  const handleExportOrders = async () => {
    if (!data) return;
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Orders Report");

    sheet.columns = [
      { header: "Order ID", key: "id", width: 25 },
      { header: "Customer", key: "customer", width: 25 },
      { header: "Region", key: "region", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Items", key: "items", width: 15 },
      { header: "Total (IDR)", key: "total", width: 25 },
      { header: "Date", key: "date", width: 20 }
    ];

    data.recentOrders.forEach(o => {
      sheet.addRow({
        id: o.id,
        customer: o.recipientName,
        region: o.recipientAreaName,
        status: o.status.toUpperCase(),
        items: o.itemCount,
        total: o.total,
        date: new Date(o.createdAt).toLocaleDateString("id-ID")
      });
    });

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF101312" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    sheet.eachRow((row, index) => {
      if (index > 1) {
        row.getCell("total").numFmt = '"Rp" #,##0';
        row.alignment = { vertical: "middle" };
        
        const statusCell = row.getCell("status");
        if (statusCell.value === "COMPLETED" || statusCell.value === "DELIVERED" || statusCell.value === "RECEIVED") {
          statusCell.font = { color: { argb: "FF3A6600" }, bold: true };
        } else {
          statusCell.font = { color: { argb: "FF876DFF" }, bold: true };
        }
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `orders-report-${dateRange}days.xlsx`);
  };

  if (loading) return <div className={styles.loading}>Generating reports...</div>;
  if (!data) return <div className={styles.error}>Failed to load reports.</div>;

  const { stats, salesSeries, recentOrders, statusBreakdown } = data;

  const completedOrders = statusBreakdown
    .filter((s) => ["completed", "delivered", "received", "order_received"].includes(s.label.toLowerCase()))
    .reduce((acc, s) => acc + s.value, 0);

  return (
    <div className={styles.page}>
      
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>Reports</p>
          <h1>Business Reports</h1>
        </div>
        <div className={styles.headerRight}>
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
      </div>

      
      <div className={styles.exportGrid}>
        <div className={styles.exportCard}>
          <div className={styles.exportIconWrapper} data-color="var(--neon-green)">
            <FiDollarSign />
          </div>
          <div className={styles.exportInfo}>
            <strong>Sales Report</strong>
            <p>Revenue and orders over the selected period, formatted in Excel.</p>
          </div>
          <button className={styles.exportBtn} onClick={handleExportSales}>
            <FiDownload /> Export XLSX
          </button>
        </div>

        <div className={styles.exportCard}>
          <div className={styles.exportIconWrapper} data-color="var(--purple-accent)">
            <FiShoppingBag />
          </div>
          <div className={styles.exportInfo}>
            <strong>Orders Report</strong>
            <p>Recent order records with customer details, formatted in Excel.</p>
          </div>
          <button className={styles.exportBtn} onClick={handleExportOrders}>
            <FiDownload /> Export XLSX
          </button>
        </div>
      </div>

      
      <div className={styles.summaryBand}>
        {[
          { icon: <FiDollarSign />, label: "Total Revenue", value: money(stats.totalRevenue) },
          { icon: <FiShoppingBag />, label: "Total Orders", value: stats.orderCount },
          { icon: <FiCheckCircle />, label: "Completed", value: completedOrders },
          { icon: <FiClock />, label: "Pending", value: Math.max(0, stats.orderCount - completedOrders) },
          { icon: <FiUsers />, label: "Customers", value: stats.customerCount },
          { icon: <FiBox />, label: "Products", value: stats.productCount },
          { icon: <FiTag />, label: "Active Promos", value: stats.activePromos },
          { icon: <FiFileText />, label: "Blogs Published", value: stats.publishedBlogs },
        ].map((m) => (
          <div key={m.label} className={styles.summaryItem}>
            <div className={styles.summaryIcon}>{m.icon}</div>
            <div>
              <p className={styles.summaryLabel}>{m.label}</p>
              <strong className={styles.summaryValue}>{m.value}</strong>
            </div>
          </div>
        ))}
      </div>

      
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h2>Recent Orders</h2>
          <button className={styles.exportBtnSm} onClick={handleExportOrders}>
            <FiDownload /> Export
          </button>
        </div>
        <div className={styles.reportTable}>
          <div className={styles.tableHead}>
            <span>Customer</span>
            <span>Region</span>
            <span>Items</span>
            <span>Status</span>
            <span>Date</span>
            <span>Total</span>
          </div>
          <div className={styles.tableBody}>
            {recentOrders.length === 0 && (
              <div className={styles.emptyRow}>No orders found for this period.</div>
            )}
            {recentOrders.map((order) => {
              const isWon = ["completed", "delivered", "received"].includes(order.status.toLowerCase());
              return (
                <div key={order.id} className={styles.tableRow}>
                  <div className={styles.customerCell}>
                    <div
                      className={styles.avatar}
                      style={{
                        backgroundImage: `url(https://ui-avatars.com/api/?name=${encodeURIComponent(order.recipientName)}&background=876DFF&color=fff)`,
                      }}
                    />
                    <span>{order.recipientName}</span>
                  </div>
                  <span>{order.recipientAreaName}</span>
                  <span>{order.itemCount} items</span>
                  <span
                    className={styles.statusPill}
                    style={{ background: isWon ? "#e2ff99" : "rgba(135,109,255,0.1)", color: isWon ? "#3a6600" : "#5b46cc" }}
                  >
                    {order.status}
                  </span>
                  <span>{new Date(order.createdAt).toLocaleDateString("id-ID")}</span>
                  <span className={styles.totalCell}>{money(order.total)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h2>Sales Series</h2>
          <button className={styles.exportBtnSm} onClick={handleExportSales}>
            <FiDownload /> Export
          </button>
        </div>
        <div className={styles.reportTable}>
          <div className={`${styles.tableHead} ${styles.tableHead3}`}>
            <span>Period</span>
            <span>Orders</span>
            <span>Revenue</span>
          </div>
          <div className={styles.tableBody}>
            {salesSeries.map((s, i) => (
              <div key={i} className={`${styles.tableRow} ${styles.tableRow3}`}>
                <span>{s.label}</span>
                <span>{s.orders}</span>
                <span className={styles.totalCell}>{money(s.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
