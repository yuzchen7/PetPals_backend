import { Request, Response } from "express";
import db from "../utils/db";
import JWToken from "../utils/token"
import PasswordTools from "../utils/hashPassword"

class usersController {
    /**
     * @swagger
     * /api/user/signup:
     *   post:
     *     summary: Register a new user account
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "user@example.com"
     *                 description: User's email address
     *               password:
     *                 type: string
     *                 example: "password123"
     *                 description: User's password
     *     responses:
     *       200:
     *         description: User registered successfully
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
     *                   example: "Successfully registered! Welcome to PetPals"
     *                 data:
     *                   type: object
     *                   properties:
     *                     email:
     *                       type: string
     *                       format: email
     *                       example: "user@example.com"
     *       400:
     *         description: Bad request - validation error or user already exists
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Missing email or password"
     *                 data:
     *                   type: null
     */
    signup = async (req: Request, res: Response): Promise<any> => {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return res.status(400).json({ success: false, message: "Missing email or password", data: null });
            }

            const existedUser = await db.user.findUnique({
                where: {
                    email: email,
                },
            }).catch ((error: any) => {
                console.log(error);
                throw error;
            })

            if (existedUser) {
                return res.status(400).json({ success: false, message: "User already exists", data: null });
            }
            const salt = PasswordTools.generateSalt()
            const user = await db.user.create({
                data: {
                    email,
                    password: PasswordTools.encryptPassword(password, salt),
                    salt: salt
                }
            }).catch((error: any) => {
                console.log(error);
                throw error;
            })
            
            res.status(200).json({
                success: true,
                message: "Successfully registered! Welcome to PetPals",
                data: {
                    email: user.email,
                }
            })

        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message, data: null });
        }
    }

    /**
     * @swagger
     * /api/user/refreshAccessToken:
     *   put:
     *     summary: Refresh the access token using a valid refresh token
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *             properties:
     *               token:
     *                 type: string
     *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *                 description: Valid refresh token
     *     responses:
     *       200:
     *         description: Access token refreshed successfully
     *         headers:
     *           Set-Cookie:
     *             description: HTTP-only cookie containing the new access token
     *             schema:
     *               type: string
     *               example: "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...;"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 access_token:
     *                   type: string
     *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *                   description: New access token (expires in 1 hour)
     *                 message:
     *                   type: string
     *                   example: "Refresh successfully"
     *                 data:
     *                   type: null
     *       400:
     *         description: Bad request - invalid or missing refresh token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "refresh token not existed"
     *                 data:
     *                   type: null
     */
    refreshAccessToken = async (req: Request, res: Response): Promise<any> => {
        try {

            const token = req.body.token
            if (!token) {
                return res.status(400).json({ success: false, message: "refresh token not existed", data: null });
            }
            const user = JWToken.verifyToken(token, process.env.REFRESH_TOKEN_SECRET!)
            const existedUser = await db.$transaction(async (prismadb: any) => {
                return await prismadb.user.findUnique({
                    where: {
                        email: user.email
                    },
                    include: {
                        refreshToken: true
                    }
                });
            })
            if (!existedUser) {
                return res.status(400).json({ success: false, message: "user not existed", data: null });
            }

            const access_token = JWToken.getAccessToken(user)
            res.status(200).cookie("token", access_token, { expires: new Date(Date.now() + 1 * 60 * 60 * 1000), httpOnly: true }).json({
                success: true,
                access_token,
                message: "Refresh successfully",
                data: null
            })
        }
        catch (error: any) {
            return res.status(400).json({ success: false, message: error.message, data: null });
        }
    }

    /**
     * @swagger
     * /api/user/login:
     *   post:
     *     summary: Authenticate user and generate access/refresh tokens
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "test1@gmail.com"
     *                 description: User's registered email address
     *               password:
     *                 type: string
     *                 example: "test1"
     *                 description: User's password
     *     responses:
     *       200:
     *         description: Login successful. Use the access_token in the Authorization header for subsequent requests.
     *         headers:
     *           Set-Cookie:
     *             description: HTTP-only cookie containing the access token
     *             schema:
     *               type: string
     *               example: "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Expires=..."
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 access_token:
     *                   type: string
     *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *                   description: JWT access token (expires in 1 hour). Include this in Authorization header as "Bearer {access_token}" for authenticated requests.
     *                 refresh_token:
     *                   type: string
     *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *                   description: JWT refresh token for renewing access tokens when the access token expires.
     *                 message:
     *                   type: string
     *                   example: "Login Successfully!"
     *                 data:
     *                   type: null
     *       400:
     *         description: Bad request - invalid credentials or missing fields
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Missing email or password"
     *                 data:
     *                   type: null
     *     x-codeSamples:
     *       - lang: 'JavaScript'
     *         source: |
     *           // After successful login, use the access token in subsequent requests
     *           const response = await fetch('/api/users/login', {
     *             method: 'POST',
     *             headers: { 'Content-Type': 'application/json' },
     *             body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
     *           });
     *           const data = await response.json();
     *           
     *           // Use the access_token in Authorization header for protected routes
     *           const protectedResponse = await fetch('/api/protected-route', {
     *             headers: {
     *               'Authorization': `Bearer ${data.access_token}`,
     *               'Content-Type': 'application/json'
     *             }
     *           });
     *       - lang: 'cURL'
     *         source: |
     *           # Login request
     *           curl -X POST http://localhost:3000/api/users/login \
     *             -H "Content-Type: application/json" \
     *             -d '{"email":"user@example.com","password":"password123"}'
     *           
     *           # Use the returned access_token in subsequent requests
     *           curl -X GET http://localhost:3000/api/protected-route \
     *             -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
     */
    login = async (req: Request, res: Response): Promise<any> => {

        try{

            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Missing email or password",
                    data: null,
                });
            }

            const existedUser = await db.$transaction(async (prismadb: any) => {
                return await prismadb.user.findUnique({
                    where: {
                        email: email
                    },
                });
            })
            if(!existedUser){
                return res.status(400).json({ success: false, message: "user not existed", data: null });
            }

            const access_token = JWToken.getAccessToken({email:existedUser.email})
            const refresh_token = JWToken.getRefreshToken({email:existedUser.email})
            await db.$transaction(async (prismadb: any) => {
                return await prismadb.refreshToken.upsert({
                    where:{
                        userId: existedUser.id,
                    },
                    update:{
                        token: refresh_token
                    },
                    create:{
                        userId: existedUser.id,
                        token: refresh_token
                    }
                })
            })

            res.status(200).cookie("token", access_token, { expires: new Date(Date.now() + 1 * 60 * 60 * 1000), httpOnly: true }).json({
                success: true,
                access_token,
                refresh_token,
                message: "Login Successfully!",
                data: null
            })

        }
        catch (error: any) {
            return res.status(400).json({ success: false, message: error.message, data: null });
        }
    }
}

export default new usersController()