

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