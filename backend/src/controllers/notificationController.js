const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get user notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const user = req.user;

    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [user.id]
    );

    const unreadCount = result.rows.filter(n => !n.is_read).length;

    return successResponse(res, 200, 'Notifications retrieved', result.rows, {
      unread_count: unreadCount
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const result = await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Notification not found.');
    }

    return successResponse(res, 200, 'Notification marked as read', result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Mark all user notifications as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const user = req.user;

    await db.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [user.id]);
    return successResponse(res, 200, 'All notifications marked as read.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
