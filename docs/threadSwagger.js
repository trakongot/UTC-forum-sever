

/**
 * @swagger
 * /api/threads:
 *   get:
 *     tags: [Threads]
 *     summary: Retrieve a list of threads
 *     description: Get all threads, with pagination support and user-specific filtering.
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         description: Page number for pagination (default is 1)
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: pageSize
 *         required: false
 *         description: Number of threads per page (default is 20)
 *         schema:
 *           type: integer
 *           example: 20
 *     security:
 *       - BearerAuth: [] 
 *     responses:
 *       200:
 *         description: A list of threads retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 threads:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique identifier of the thread.
 *                       title:
 *                         type: string
 *                         description: The title of the thread.
 *                       content:
 *                         type: string
 *                         description: The content of the thread.
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: The creation date of the thread.
 *                       postedBy:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: Name of the user who posted the thread.
 *                           profilePic:
 *                             type: string
 *                             description: URL of the user's profile picture.
 *                       isFollowed:
 *                         type: boolean
 *                         description: Indicates if the current user follows the thread's author.
 *                 isNext:
 *                   type: boolean
 *                   description: Indicates if there are more threads to load.
 *       500:
 *         description: Internal Server Error
 *       404:
 *         description: No threads found
 */
/**
 * @swagger
 * /api/threads:
 *   post:
 *     summary: Create or reply to a thread with images
 *     description: Upload images as part of creating a new thread or replying to an existing one.
 *     tags: [Threads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The content of the thread.
 *                 example: "This is a new thread or a reply."
 *               postedBy:
 *                 type: string
 *                 description: The ID of the user creating the thread.
 *                 example: "671bd06ac8f3562b0371f32c"
 *               imgs:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: An array of image files to upload.
 *     responses:
 *       201:
 *         description: Successfully created a new thread or reply.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the created thread.
 *                 text:
 *                   type: string
 *                   description: The content of the thread.
 *                 imgs:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uri
 *                     description: The URLs of the uploaded images.
 *       400:
 *         description: Bad Request, validation errors.
 *       401:
 *         description: Unauthorized, user not allowed to create this post.
 *       404:
 *         description: Not Found, the parent thread does not exist.
 *       500:
 *         description: Internal Server Error.
 */
/**
 * @swagger
 * /api/threads/{userId}/replies:
 *   get:
 *     tags: [Threads]
  *     summary: Get a list of replies by a user
 *     description: Retrieve a list of threads where the user has posted replies, including the original thread and replies.
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user whose replies are being fetched.
 *         required: true
 *         schema:
 *           type: string
 *       - name: pageNumber
 *         in: query
 *         description: The page number to fetch.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: pageSize
 *         in: query
 *         description: The number of replies per page.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 20
 *     responses:
 *       200:
 *         description: Successfully retrieved list of replies and the original threads.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 threads:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       thread:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           text:
 *                             type: string
 *                           postedBy:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               profilePic:
 *                                 type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           imgs:
 *                             type: array
 *                             items:
 *                               type: string
 *                           likeCount:
 *                             type: integer
 *                           commentCount:
 *                             type: integer
 *                           shareCount:
 *                             type: integer
 *                           repostCount:
 *                             type: integer
 *                       reply:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           text:
 *                             type: string
 *                           postedBy:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               profilePic:
 *                                 type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           imgs:
 *                             type: array
 *                             items:
 *                               type: string
 *                           likeCount:
 *                             type: integer
 *                           commentCount:
 *                             type: integer
 *                           shareCount:
 *                             type: integer
 *                           repostCount:
 *                             type: integer
 *       400:
 *         description: Invalid user ID or request parameters.
 *       500:
 *         description: Internal Server Error
 */
/**
 * @swagger
 * /api/threads/{userId}/reposts:
 *   get:
 *     tags: [Threads]
 *     summary: Get a list of threads reposted by a user
 *     description: Retrieve a list of threads that a user has reposted, with full details like the original thread.
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user whose reposts are being fetched.
 *         required: true
 *         schema:
 *           type: string
 *       - name: pageNumber
 *         in: query
 *         description: The page number to fetch.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: pageSize
 *         in: query
 *         description: The number of reposts per page.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 20
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of reposted threads.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 reposts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique identifier of the reposted thread.
 *                       text:
 *                         type: string
 *                         description: The content of the reposted thread.
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: The creation date of the reposted thread.
 *                       likeCount:
 *                         type: integer
 *                         description: Number of likes on the reposted thread.
 *                       commentCount:
 *                         type: integer
 *                         description: Number of comments on the reposted thread.
 *                       shareCount:
 *                         type: integer
 *                         description: Number of shares of the reposted thread.
 *                       repostCount:
 *                         type: integer
 *                         description: Number of reposts of the reposted thread.
 *                       imgs:
 *                         type: array
 *                         items:
 *                           type: string
 *                           format: uri
 *                           description: The URLs of the images in the reposted thread.
 *                       postedBy:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: The ID of the user who posted the thread.
 *                           name:
 *                             type: string
 *                             description: The name of the user who posted the thread.
 *                           profilePic:
 *                             type: string
 *                             description: URL of the user's profile picture.
 *       400:
 *         description: Invalid user ID or request parameters.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /api/threads/reply/{parentId}:
 *   post:
 *     summary: Create or reply to a thread with images
 *     description: Upload images as part of creating a replying Threads.
 *     tags: [Threads]
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         description: The ID of the parent thread. If creating a new thread, this can be omitted.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The content of the thread.
 *                 example: "This is a new thread or a reply."
 *               postedBy:
 *                 type: string
 *                 description: The ID of the user creating the thread.
 *                 example: "671bd06ac8f3562b0371f32c"
 *               imgs:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: An array of image files to upload.
 *     responses:
 *       201:
 *         description: Successfully created a new thread or reply.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the created thread.
 *                 text:
 *                   type: string
 *                   description: The content of the thread.
 *                 imgs:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uri
 *                     description: The URLs of the uploaded images.
 *       400:
 *         description: Bad Request, validation errors.
 *       401:
 *         description: Unauthorized, user not allowed to create this post.
 *       404:
 *         description: Not Found, the parent thread does not exist.
 *       500:
 *         description: Internal Server Error.
 */