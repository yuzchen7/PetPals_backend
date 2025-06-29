import { Request, Response } from "express";
import db from "../utils/db";

class eventsController {
    getAllReminders = async (req: Request, res: Response): Promise<any> => {
        try{
            const userEmail = (req as any).user.email
            const curUser = await db.$transaction(async (prismadb: any) => {
                return await prismadb.user.findUnique({
                    where: {
                        email: userEmail
                    }
                });
            })  
            const result = await db.$transaction(async (prismadb: any) => {
                return await prismadb.event.findMany({
                    where: {
                        userId: curUser.id
                    },
                    select: {
                        id: true,
                        start_time: true,
                        end_time: true,
                        description: true,
                        type: true,
                        frequency: true,
                        pet: {
                            select: {
                                name: true,
                            }
                        }
                    },
                });
            })
            return res.status(200).json({
                success: true,
                message: "Reminders retrieved successfully",
                data: result
            });

        }catch (error: any) {
            console.log(error)
            return res.status(400).json({ success: false, message: error.message, data: null });
        }
    }

    addReminders = async (req: Request, res: Response): Promise<any> => {

        try{
            const userEmail = (req as any).user.email
            const petId = parseInt(req.params.petId)
            const {date, start_time, end_time, description, type, detail, frequency } = req.body
            const curUser = await db.$transaction(async (prismadb: any) => {
                return await prismadb.user.findUnique({
                    where:{
                        email:userEmail
                    }
                })
            })
            await db.$transaction(async (prismadb: any) =>{
                await prismadb.event.create({
                    data: {
                        date,
                        start_time,
                        end_time,
                        description,
                        type,
                        detail,
                        frequency,
                        petId,
                        userId: curUser.id
                    }
                }).catch((error: any) => {
                    throw new Error("Failed to add reminder: " + error.message);
                });
            })
            return res.status(201).json({
                success: true,
                message: "Reminder added successfully",
                data: null
            });

        }catch (error: any) {
            console.log(error)
            return res.status(400).json({ success: false, message: error.message, data: null });
        }
    }

    deleteReminders = async (req: Request, res: Response): Promise<any> => {
        try{
            const eventId = parseInt(req.params.eventId)
            await db.$transaction(async (prismadb: any) =>{
                await prismadb.event.delete({
                    where: {
                        id: eventId,
                    }
                }).catch((error: any) => {
                    throw new Error("Failed to delete reminder: " + error.message);
                });
            })
            return res.status(200).json({
                success: true,
                message: "Reminder deleted successfully",
                data: null
            });

        }catch (error: any) {
            return res.status(400).json({ success: false, message: error.message, data: null });
        }
    }

    updateReminders = async (req: Request, res: Response): Promise<any> => {
        try{
            const eventId = parseInt(req.params.eventId)
            const {date, start_time, end_time, description, type, detail, frequency } = req.body

            await db.$transaction(async (prismadb: any) =>{
                await prismadb.event.update({
                    where: {
                        id: eventId,
                    },
                    data: {
                        date,
                        start_time,
                        end_time,
                        description,
                        type,
                        detail,
                        frequency
                    }
                }).catch((error: any) => {
                    throw new Error("Failed to update reminder: " + error.message);
                });
            })
            return res.status(200).json({
                success: true,
                message: "Reminder updated successfully",
                data: null
            });

        }catch (error: any) {
            return res.status(400).json({ success: false, message: error.message, data: null });
        }
    }

    getRemindersByPet = async (req: Request, res: Response): Promise<any> => {
        try{
            const petId = parseInt(req.params.petId)
            const result = await db.$transaction(async (prismadb: any) => {
                return await prismadb.event.findMany({
                    where: {
                        petId: petId,
                        
                    }
                });
            })
            return res.status(200).json({
                success: true,
                message: "Reminder details retrieved successfully",
                data: result
            });

        }catch (error: any) {
            return res.status(400).json({ success: false, message: error.message, data: null });
        }
    }

    getReminderDetail = async (req: Request, res: Response): Promise<any> => {
        try{
            const eventId = parseInt(req.params.eventId)
            const result = await db.$transaction(async (prismadb: any) => {
                return await prismadb.event.findUnique({
                    where: {
                        id: eventId,
                    },
                    include: {
                        pet: { 
                            select: {
                                name: true,
                            }
                        }
                    }
                });
            })
            if (!result) {
                return res.status(404).json({ success: false, message: "Reminder not found", data: null });
            }
            return res.status(200).json({
                success: true,
                message: "Reminder details retrieved successfully",
                data: result
            });

        }catch (error: any) {
            return res.status(400).json({ success: false, message: error.message, data: null });
        }
    }
        
}

export default new eventsController()