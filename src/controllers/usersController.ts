import { Request, Response } from "express"; ``
import db from "../utils/db";
import JWToken from "../utils/token"
import PasswordTools from "../utils/hashPassword"

class usersController {
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
                    include: {
                        refreshToken: true
                    }
                });
            })


        }
        catch (error: any) {
            return res.status(400).json({ success: false, message: error.message, data: null });
        }
    }
}

export default new usersController()