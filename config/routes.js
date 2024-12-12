import messageRoutes from '../routes/messageRoutes.js';
import notificationRoutes from '../routes/notificationRoutes.js';
import policyRoutes from '../routes/policyRoutes.js';
import reportRoutes from '../routes/reportRoutes.js';
import repostRoutes from '../routes/repostRoutes.js';
import searchRoutes from '../routes/searchRoutes.js';
import threadRoutes from '../routes/threadRoutes.js';
import userRoutes from '../routes/userRoutes.js';

/**
 * Cấu hình các route cho ứng dụng
 */
const configureRoutes = (app) => {
  app.use('/api/users', userRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/threads', threadRoutes);
  app.use('/api/repost', repostRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/report', reportRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/policies', policyRoutes);
};

export default configureRoutes;
