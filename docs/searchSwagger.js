/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     tags: [Search]
 *     summary: Suggest accounts based on search query
 *     description: Provides a list of user accounts that match the search query.
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The partial text to search for user accounts.
 *     responses:
 *       200:
 *         description: List of suggested accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The user ID.
 *                   name:
 *                     type: string
 *                     description: The user's full name.
 *                   username:
 *                     type: string
 *                     description: The user's username.
 *                   profilePic:
 *                     type: string
 *                     description: The URL of the user's profile picture.
 *               example:
 *                 - _id: "63745d178a113b76cbcaff1d"
 *                   name: "John Doe"
 *                   username: "johndoe"
 *                   profilePic: "https://example.com/johndoe.jpg"
 *                 - _id: "63745d178a113b76cbcaff2e"
 *                   name: "Jane Smith"
 *                   username: "janesmith"
 *                   profilePic: "https://example.com/janesmith.jpg"
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Internal Server Error
 */
/**
 * @swagger
 * /api/search/searchThread:
 *   get:
 *     tags: [Search]
 *     summary: Search for threads
 *     description: Find threads based on a keyword in the text.
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The search keyword.
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page number for pagination (default is 1).
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of threads per page (default is 20).
 *     responses:
 *       200:
 *         description: List of threads matching the search query.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 threads:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       text:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       likeCount:
 *                         type: integer
 *                       commentCount:
 *                         type: integer
 *                       repostCount:
 *                         type: integer
 *                       shareCount:
 *                         type: integer
 *                       imgs:
 *                         type: array
 *                         items:
 *                           type: string
 *                       postedBy:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           username:
 *                             type: string
 *                           profilePic:
 *                             type: string
 *                 isNext:
 *                   type: boolean
 *       400:
 *         description: Missing query parameter
 *       500:
 *         description: Internal Server Error
 */