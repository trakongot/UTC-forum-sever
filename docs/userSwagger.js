/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     tags: [Users]
 *     summary: Signup a new user
 *     description: Create a new user account with name, email, username, and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 username:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 profilePic:
 *                   type: string
 *       400:
 *         description: User already exists or invalid user data
 *       500:
 *         description: Internal Server Error
 */
/**
 * @swagger
 * /api/users/signin:
 *   post:
 *     tags: [Users]
 *     summary: Sign in a user
 *     description: Authenticate a user with their username and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *           example:           
 *             {
 *                 "username": "muckhpo",
 *                 "password": "123"
 *             }
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 username:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 profilePic:
 *                   type: string
 *       400:
 *         description: Invalid username or password
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     tags: [Users]
 *     summary: Logout a user
 *     description: Log out the currently logged-in user.
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/users/block:
 *   post:
 *     summary: Block or Unblock a user
 *     description: Toggle the block status of a user. If the user is blocked, they will be unblocked. If the user is not blocked, they will be blocked.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIdToToggle:
 *                 type: string
 *                 description: The ID of the user to block or unblock.
 *                 example: "60b4f8d1d98c6a2c4f2b3d61"
 *     responses:
 *       200:
 *         description: User was successfully blocked or unblocked.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "User blocked successfully."
 *       400:
 *         description: Bad request due to invalid ID or attempting to block/unblock yourself.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "You cannot block/unblock yourself."
 *       404:
 *         description: User not found or user is not in the blocked list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "User not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Internal server error."
 */

/**
 * @swagger
 * /api/users/block:
 *   get:
 *     summary: Retrieve a list of blocked users
 *     description: Returns a list of users who are blocked by the current user.
 *     responses:
 *       200:
 *         description: A list of blocked users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockedUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       profilePic:
 *                         type: string
 *                       bio:
 *                         type: string
 *                       accountStatus:
 *                         type: string
 *       404:
 *         description: No blocked users found
 *       500:
 *         description: An error occurred while fetching blocked users
 */
