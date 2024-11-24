/**
 * @swagger
 * /api/repost/repost:
 *   put:
 *     summary: Repost a thread to user's profile
 *     description: Repost a thread to the user's profile, increasing the repost count and adding the repost to the user's repost list.
 *     tags: [Threads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               threadId:
 *                 type: string
 *                 description: The ID of the thread to repost.
 *                 example: "672b88a89b7d45b13ec7a596"
 *     responses:
 *       200:
 *         description: Successfully reposted the thread.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Thread reposted successfully"
 *                 repostedThread:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the reposted thread.
 *                       example: "672b88a89b7d45b13ec7a596"
 *                     user:
 *                       type: string
 *                       description: The ID of the user who reposted the thread.
 *                       example: "671bd06ac8f3562b0371f32c"
 *                     repostedAt:
 *                       type: string
 *                       format: date-time
 *                       description: The time when the thread was reposted.
 *                       example: "2024-11-06T08:00:00Z"
 *                     thread:
 *                       type: string
 *                       description: The ID of the original thread.
 *                       example: "672b88a89b7d45b13ec7a596"
 *       400:
 *         description: Bad Request, invalid input data.
 *       404:
 *         description: Not Found, thread not found.
 *       500:
 *         description: Internal Server Error.
 */
/**
 * @swagger
 * /api/repost/{repostId}/replies:
 *   post:
 *     summary: Add a reply to a repost
 *     description: Add a reply to an existing repost by its ID.
 *     tags: [Repost Replies]
 *     parameters:
 *       - in: path
 *         name: repostId
 *         required: true
 *         description: The ID of the repost to reply to.
 *         schema:
 *           type: string
 *           example: "673402922a7214c4f823f474"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The content of the reply.
 *                 example: "This is a reply to the repost."
 *     responses:
 *       201:
 *         description: Successfully added the reply to the repost.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Reply added successfully."
 *                 replyId:
 *                   type: string
 *                   description: The ID of the newly created reply.
 *                   example: "672d33a89b7d45b13ec7a123"
 *       404:
 *         description: Repost not found.
 *       500:
 *         description: Internal Server Error.
 */
/**
 * @swagger
 * /api/repost/{repostId}/replies/{replyId}:
 *   delete:
 *     summary: Delete a reply from a repost
 *     description: Remove a reply from a repost by its ID. Only the user who created the reply can delete it.
 *     tags: [Repost Replies]
 *     parameters:
 *       - in: path
 *         name: repostId
 *         required: true
 *         description: The ID of the repost.
 *         schema:
 *           type: string
 *           example: "673402922a7214c4f823f474"
 *       - in: path
 *         name: replyId
 *         required: true
 *         description: The ID of the reply to delete.
 *         schema:
 *           type: string
 *           example: "672c33a89b7d45b13ec7a123"
 *     responses:
 *       200:
 *         description: Successfully deleted the reply from the repost.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Reply deleted successfully."
 *                 replyId:
 *                   type: string
 *                   description: The ID of the deleted reply.
 *                   example: "672c33a89b7d45b13ec7a123"
 *       404:
 *         description: Reply or repost not found.
 *       500:
 *         description: Internal Server Error.
 */