import { prisma } from "../config/prisma.js";

export const getAuthorDashboardStats = async (req, res) => {
  try {
    // Confirm that your auth middleware provides the correct author ID.
    const author = await prisma.author.findUnique({
  where: {
    userId: req.user.id,
  },
  select: {
    id: true,
  },
});

if (!author) {
  return res.status(404).json({
    success: false,
    message: "Author profile not found",
  });
}

const authorId = author.id;

    const [
      totalBooks,
      booksByStatus,
      bookTotals,
      totalTickets,
      openTickets,
      recentTickets,
    ] = await Promise.all([
      // Total books belonging to this author
      prisma.book.count({
        where: { authorId },
      }),

      // Books grouped by publication status
      prisma.book.groupBy({
        by: ["status"],
        where: { authorId },
        _count: { _all: true },
      }),

      // Sales and royalty totals
      prisma.book.aggregate({
        where: { authorId },
        _sum: {
          totalCopiesSold: true,
          totalRoyaltyEarned: true,
          royaltyPaid: true,
          royaltyPending: true,
        },
      }),

      // Total tickets belonging to this author
      prisma.ticket.count({
        where: { authorId },
      }),

      // Open tickets belonging to this author
      prisma.ticket.count({
        where: {
          authorId,
          status: "OPEN",
        },
      }),

      // Latest 5 tickets belonging to this author
      prisma.ticket.findMany({
        where: { authorId },
        take: 5,
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
        },
      }),
    ]);

    // Convert grouped book counts to a convenient object
    const booksByStatusMap = {};

    booksByStatus.forEach((item) => {
      booksByStatusMap[item.status] = item._count._all;
    });

    // Normalize empty sums and serialize Prisma Decimal values
    const sums = bookTotals._sum;

    const toMoneyString = (value) =>
  value == null ? "0.00" : Number(value).toFixed(2);

    return res.status(200).json({
      success: true,
      message: "Author dashboard fetched successfully",
      data: {
        stats: {
          totalBooks,
          booksByStatus: booksByStatusMap,

          totalCopiesSold: sums.totalCopiesSold ?? 0,

          totalRoyaltyEarned: toMoneyString(
            sums.totalRoyaltyEarned
          ),

          royaltyPaid: toMoneyString(
            sums.royaltyPaid
          ),

          royaltyPending: toMoneyString(
            sums.royaltyPending
          ),

          totalTickets,
          openTickets,
        },

        recentTickets,
      },
    });
  } catch (error) {
    console.error("getAuthorDashboardStats error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch author dashboard",
    });
  }
};
