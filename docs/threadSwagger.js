
/**
 * @swagger
 * swagger: "2.0"
 * info:
 *   title: "API Documentation"
 *   version: "1.0.0"
 * securityDefinitions:
 *   cookieAuth:
 *     type: "apiKey"
 *     in: "cookie"
 *     name: "jwt"  
 * security:
 *   - cookieAuth: [] 
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
 * /api/threads/{id}/replies:
 *   post:
 *     summary: Create or reply to a thread with images
 *     description: Upload images as part of creating a replying Threads.
 *     tags: [Threads]
 *     parameters:
 *       - in: path
 *         name: id
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
 * /api/threads/{id}:
 *   get:
 *     tags: [Threads]
 *     summary: Get thread by ID
 *     description: Retrieves a specific thread by its ID, including details of the user who posted it and any child threads (replies) with author information.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the thread to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the thread.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 thread:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "615b3a1234d8e654fca9e401"
 *                     content:
 *                       type: string
 *                       example: "This is a sample thread content."
 *                     postedBy:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "615b3a1234d8e654fca9e402"
 *                         name:
 *                           type: string
 *                           example: "Jane Doe"
 *                     children:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "615b3a1234d8e654fca9e403"
 *                           content:
 *                             type: string
 *                             example: "This is a reply to the thread."
 *                           author:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "615b3a1234d8e654fca9e404"
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                               parentId:
 *                                 type: string
 *                                 example: "615b3a1234d8e654fca9e401"
 *                               image:
 *                                 type: string
 *                                 example: "https://res.cloudinary.com/demo/image/upload/v1618880625/profilepic.jpg"
 *       404:
 *         description: Thread not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Thread not found"
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */

/**
 * @swagger
 * /api/threads/{parentId}/replies:
 *   get:
 *     summary: Get replies to a parent thread
 *     description: Retrieve a list of replies to a specific parent thread by its ID, with pagination.
 *     parameters:
 *       - name: parentId
 *         in: path
 *         required: true
 *         description: ID of the parent thread to get replies for
 *         schema:
 *           type: string
 *       - name: pageNumber
 *         in: query
 *         required: false
 *         description: The page number to fetch (default is 1)
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         required: false
 *         description: The number of replies to fetch per page (default is 20)
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       '200':
 *         description: A list of replies to the parent thread
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 replies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       text:
 *                         type: string
 *                       imgs:
 *                         type: array
 *                         items:
 *                           type: string
 *                       likeCount:
 *                         type: integer
 *                       commentCount:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       postedBy:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           profilePic:
 *                             type: string
 *                 isNext:
 *                   type: boolean
 *                   example: true
 *       '400':
 *         description: Parent thread ID is required
 *       '404':
 *         description: Parent thread not found
 *       '500':
 *         description: Internal Server Error
 */
/**
 * @swagger
 * /api/threads/{id}/byUser:
 *   get:
 *     summary: Get threads created by a specific user
 *     description: Retrieve a paginated list of threads created by the user identified by the given ID.
 *     tags:
 *       - Threads
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user whose threads are being retrieved.
 *         schema:
 *           type: string
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         description: Page number for pagination (default is 1).
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         required: false
 *         description: Number of threads per page (default is 20).
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: A paginated list of threads created by the user.
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
 *                         example: '60b8d6d45f1b2c001c8eaf3b'
 *                       title:
 *                         type: string
 *                         example: 'Thread title'
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: '2022-06-15T08:00:00Z'
 *       404:
 *         description: User not found or no threads available for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'User not found'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Internal Server Error'
 */