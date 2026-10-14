import { prisma } from "../config/prisma.js";

const TICKET_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const TICKET_PRIORITIES = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
];

export const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalTickets,
      statusCounts,
      priorityCounts,
      unassignedTickets,
      recentTickets,
    ] = await Promise.all([
      // Total tickets
      prisma.ticket.count(),

      // Tickets grouped by status
      prisma.ticket.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),

      // Tickets grouped by priority
      prisma.ticket.groupBy({
        by: ["priority"],
        _count: { _all: true },
      }),

      // Tickets not assigned to an admin
      prisma.ticket.count({
        where: {
          assignedToId: null,
        },
      }),

      // Latest 10 tickets
      prisma.ticket.findMany({
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          ticketNumber: true,
          subject: true,
          status: true,
          priority: true,
          category: true,
          createdAt: true,
          assignedToId: true,
        },
      }),
    ]);

    // Include statuses with zero tickets
    const byStatus = Object.fromEntries(
      TICKET_STATUSES.map((status) => [status, 0])
    );

    statusCounts.forEach((item) => {
      byStatus[item.status] = item._count._all;
    });

    // Include priorities with zero tickets
    const byPriority = Object.fromEntries(
      TICKET_PRIORITIES.map((priority) => [priority, 0])
    );

    priorityCounts.forEach((item) => {
      byPriority[item.priority] = item._count._all;
    });

    const highPriorityTickets =
      byPriority.HIGH + byPriority.CRITICAL;

    return res.status(200).json({
      success: true,
      message: "Admin dashboard fetched successfully",
      data: {
        stats: {
          totalTickets,
          byStatus,
          byPriority,
          highPriorityTickets,
          unassignedTickets,
        },
        recentTickets,
      },
    });
  } catch (error) {
    console.error("getAdminDashboardStats error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch admin dashboard",
    });
  }
};
