export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { checkAdmin } from "../db";

type SalesPoint = {
  label: string;
  revenue: number;
  orders: number;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const days = searchParams.get("days"); 
  const topFilter = searchParams.get("topFilter"); 

  if (!(await checkAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  
  let dateFrom: Date | undefined;
  if (days && days !== "all") {
    dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));
  }

  
  let topFrom: Date | undefined;
  if (topFilter === "week") {
    topFrom = new Date();
    topFrom.setDate(topFrom.getDate() - 7);
  } else if (topFilter === "month") {
    topFrom = new Date();
    topFrom.setMonth(topFrom.getMonth() - 1);
  }

  const orderWhere = dateFrom ? { createdAt: { gte: dateFrom } } : {};
  const topOrderWhere = topFrom ? { createdAt: { gte: topFrom } } : {};

  try {
    const [products, promos, blogs, users, orders, topOrders] = await Promise.all([
      prisma.product.findMany({
        select: { id: true, category: true, createdAt: true, title: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.promo.findMany({
        select: { id: true, title: true, discountPct: true, isActive: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.blog.findMany({
        select: { id: true, title: true, isPublished: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        select: { id: true, role: true, createdAt: true, email: true, name: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        where: orderWhere,
        select: {
          id: true,
          total: true,
          subtotal: true,
          shippingCost: true,
          biteshipStatus: true,
          recipientName: true,
          recipientAreaName: true,
          courierCompany: true,
          courierServiceName: true,
          itemsJson: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        where: topOrderWhere,
        select: {
          id: true,
          total: true,
          subtotal: true,
          biteshipStatus: true,
          recipientName: true,
          recipientAreaName: true,
          courierCompany: true,
          courierServiceName: true,
          itemsJson: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalSubtotal = orders.reduce((sum, order) => sum + Number(order.subtotal), 0);
    const totalShipping = orders.reduce((sum, order) => sum + Number(order.shippingCost), 0);
    const orderCount = orders.length;
    const customerCount = users.filter((user) => user.role !== "ADMIN").length;
    const averageOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;
    const activePromos = promos.filter((promo) => promo.isActive).length;
    const publishedBlogs = blogs.filter((blog) => blog.isPublished).length;

    const statusMap = new Map<string, number>();
    for (const order of orders) {
      const key = order.biteshipStatus || "pending";
      statusMap.set(key, (statusMap.get(key) ?? 0) + 1);
    }

    const categoryMap = new Map<string, number>();
    for (const product of products) {
      const key = product.category || "Tanpa kategori";
      categoryMap.set(key, (categoryMap.get(key) ?? 0) + 1);
    }

    
    const seriesLength = days === "30" ? 30 : days === "90" ? 12 : 7;
    const isWeeks = days === "90";

    const salesSeries: SalesPoint[] = Array.from({ length: seriesLength }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);

      let nextDate: Date;
      let label: string;

      if (isWeeks) {
        date.setDate(date.getDate() - (seriesLength - 1 - index) * 7);
        nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 7);
        label = `W${index + 1}`;
      } else {
        date.setDate(date.getDate() - (seriesLength - 1 - index));
        nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        label = date.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
      }

      const ordersForPeriod = orders.filter(
        (order) => order.createdAt >= date && order.createdAt < nextDate,
      );

      return {
        label,
        revenue: ordersForPeriod.reduce((sum, order) => sum + Number(order.total), 0),
        orders: ordersForPeriod.length,
      };
    });

    const recentOrders = topOrders.slice(0, 8).map((order) => {
      let itemCount = 0;

      try {
        itemCount = JSON.parse(order.itemsJson ?? "[]").reduce(
          (sum: number, item: { quantity?: number }) => sum + Number(item.quantity ?? 1),
          0,
        );
      } catch {
        itemCount = 0;
      }

      return {
        id: order.id,
        recipientName: order.recipientName,
        recipientAreaName: order.recipientAreaName,
        courierLabel: `${order.courierCompany} ${order.courierServiceName}`.trim(),
        status: order.biteshipStatus || "pending",
        total: Number(order.total),
        itemCount,
        createdAt: order.createdAt.toISOString(),
      };
    });

    const recentActivities = [
      ...products.slice(0, 3).map((product) => ({
        type: "product",
        title: `Produk baru: ${product.title}`,
        time: product.createdAt.toISOString(),
      })),
      ...promos.slice(0, 2).map((promo) => ({
        type: "promo",
        title: `Campaign promo: ${promo.title} (${promo.discountPct}%)`,
        time: promo.createdAt.toISOString(),
      })),
      ...users.slice(0, 2).map((user) => ({
        type: "user",
        title: `Customer baru: ${user.name || user.email}`,
        time: user.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => +new Date(b.time) - +new Date(a.time))
      .slice(0, 6);

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalSubtotal,
        totalShipping,
        orderCount,
        customerCount,
        averageOrderValue,
        productCount: products.length,
        activePromos,
        publishedBlogs,
        conversionTarget: Math.max(products.length * 3, 10),
      },
      statusBreakdown: Array.from(statusMap.entries()).map(([label, value]) => ({ label, value })),
      topCategories: Array.from(categoryMap.entries())
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
      salesSeries,
      recentOrders,
      recentActivities,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
