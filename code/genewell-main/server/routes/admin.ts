import { RequestHandler } from 'express';
import {
  getAllUsers,
  getUserWithPurchases,
  query,
} from '../lib/db';

/**
 * Middleware to verify admin access
 * In production, implement proper authentication
 */
export const requireAdmin: RequestHandler = (req, res, next) => {
  const adminToken = req.headers['x-admin-token'];
  
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Invalid or missing admin token',
    });
  }

  next();
};

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
export const handleGetAllUsers: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const users = await getAllUsers(limit, offset);

    // Get total count
    const countResult = await query('SELECT COUNT(*) as count FROM users');
    const totalCount = countResult.rows[0].count;

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/admin/users/:userId
 * Get detailed user information with all purchases
 */
export const handleGetUserDetails: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const userDetails = await getUserWithPurchases(parseInt(userId));

    if (!userDetails.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get quiz data if available
    let quizData = null;
    if (userDetails.latestQuiz) {
      quizData = {
        analysisId: userDetails.latestQuiz.analysis_id,
        quizData: userDetails.latestQuiz.quiz_data,
        personalizationData: userDetails.latestQuiz.personalization_data,
        createdAt: userDetails.latestQuiz.created_at,
      };
    }

    res.json({
      success: true,
      user: userDetails.user,
      purchases: userDetails.purchases,
      latestQuiz: quizData,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics
 */
export const handleAdminDashboard: RequestHandler = async (req, res) => {
  try {
    // Total users
    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = usersResult.rows[0].count;

    // Total quiz responses
    const quizResult = await query('SELECT COUNT(*) as count FROM quiz_responses');
    const totalQuizzes = quizResult.rows[0].count;

    // Total purchases
    const purchasesResult = await query('SELECT COUNT(*) as count FROM purchases');
    const totalPurchases = purchasesResult.rows[0].count;

    // Completed purchases
    const completedResult = await query(
      "SELECT COUNT(*) as count FROM purchases WHERE payment_status = 'completed'"
    );
    const completedPurchases = completedResult.rows[0].count;

    // Total revenue
    const revenueResult = await query(
      "SELECT SUM(total_price) as total FROM purchases WHERE payment_status = 'completed'"
    );
    const totalRevenue = revenueResult.rows[0].total || 0;

    // Email statistics
    const emailResult = await query(
      "SELECT status, COUNT(*) as count FROM email_logs GROUP BY status"
    );
    const emailStats = emailResult.rows.reduce(
      (acc: any, row: any) => {
        acc[row.status] = row.count;
        return acc;
      },
      {}
    );

    // Recent purchases
    const recentResult = await query(`
      SELECT 
        p.id, p.user_id, p.total_price, p.payment_status, p.created_at,
        u.email, u.name
      FROM purchases p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      statistics: {
        totalUsers,
        totalQuizzes,
        totalPurchases,
        completedPurchases,
        totalRevenue: parseFloat(totalRevenue),
        emailStats,
      },
      recentPurchases: recentResult.rows,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/admin/purchases
 * Get all purchases with filters
 */
export const handleGetAllPurchases: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    let query_str = `
      SELECT 
        p.id, p.user_id, p.plan_id, p.total_price, p.payment_status, 
        p.created_at, p.completed_at, u.email, u.name
      FROM purchases p
      JOIN users u ON p.user_id = u.id
    `;

    const params: any[] = [];

    if (status) {
      query_str += ` WHERE p.payment_status = $${params.length + 1}`;
      params.push(status);
    }

    query_str += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(query_str, params);

    // Get count
    let countQuery = 'SELECT COUNT(*) as count FROM purchases';
    if (status) {
      countQuery += " WHERE payment_status = $1";
      const countResult = await query(countQuery, [status]);
    } else {
      const countResult = await query(countQuery);
    }

    res.json({
      success: true,
      purchases: result.rows,
      pagination: {
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/admin/quiz-responses
 * Get quiz responses data
 */
export const handleGetQuizResponses: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT 
        qr.id, qr.analysis_id, qr.created_at, 
        u.id as user_id, u.email, u.name, u.age, u.gender
      FROM quiz_responses qr
      JOIN users u ON qr.user_id = u.id
      ORDER BY qr.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await query('SELECT COUNT(*) as count FROM quiz_responses');
    const totalCount = countResult.rows[0].count;

    res.json({
      success: true,
      quizResponses: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching quiz responses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/admin/email-logs
 * Get email activity logs
 */
export const handleGetEmailLogs: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT * FROM email_logs
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await query('SELECT COUNT(*) as count FROM email_logs');
    const totalCount = countResult.rows[0].count;

    res.json({
      success: true,
      emailLogs: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/admin/export/users-csv
 * Export users data as CSV
 */
export const handleExportUsersCSV: RequestHandler = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id, u.email, u.name, u.age, u.gender, u.phone,
        COUNT(DISTINCT qr.id) as total_quizzes,
        COUNT(DISTINCT p.id) as total_purchases,
        u.created_at
      FROM users u
      LEFT JOIN quiz_responses qr ON u.id = qr.user_id
      LEFT JOIN purchases p ON u.id = p.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    const csv = [
      ['ID', 'Email', 'Name', 'Age', 'Gender', 'Phone', 'Total Quizzes', 'Total Purchases', 'Created At'],
      ...result.rows.map((row: any) => [
        row.id,
        row.email,
        row.name || '',
        row.age || '',
        row.gender || '',
        row.phone || '',
        row.total_quizzes || 0,
        row.total_purchases || 0,
        row.created_at,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users-export.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
