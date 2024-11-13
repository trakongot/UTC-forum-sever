
/**
 * @swagger
 * /api/saves:
 *   post:
 *     summary: Save or unsave a thread
 *     description: This endpoint allows a user to save or unsave a thread. If the thread is already saved, it will be unsaved. If it's not saved, it will be saved.
 *     tags: [Saves]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: The thread ID to save or unsave
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               threadId:
 *                 type: string
 *                 description: The ID of the thread to save or unsave
 *                 example: "673402922a7214c4f823f474"
 *     responses:
 *       200:
 *         description: Thread successfully saved or unsaved
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
 *                   example: "Thread saved successfully"
 *       400:
 *         description: Invalid request or missing data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Text is required"
 *       404:
 *         description: Thread or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Thread not found"
 *       401:
 *         description: Unauthorized (if no token is provided)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No token, authorization denied"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
