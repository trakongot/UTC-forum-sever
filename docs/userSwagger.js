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
 * /users/logout:
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
