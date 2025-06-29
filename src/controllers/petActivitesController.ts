import { Request, Response } from "express";
import db from "../utils/db";

class petActivitiesController {
    getAllActivities = async (req: Request, res: Response): Promise<any> => {
        try {
            const userEmail = (req as any).user.email;
            const result = await db.$transaction(async (prismadb: any) => {
                return await prismadb.user.findUnique({
                    where: { email: userEmail },
                    select:{
                        pet : {
                            select: {
                                name: true,
                                pta: {
                                    select: {
                                        activity: true,
                                        frequency: true,
                                        date: true
                                    }
                                }
                            }
                        }
                    }
                }).catch((error: any) => {
                    throw new Error("Error retrieving user activities: " + error.message)
                })
            })

            return res.status(200).json({
                success: true,
                message: "Activities retrieved successfully",
                data: result
            })
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message, data: null })
        }
    }

    getActivitiesByPet = async (req: Request, res: Response): Promise<any> => {
        try {
            const petId = parseInt(req.params.petId)

            const result = await db.$transaction(async (prismadb: any) => {
                return await prismadb.pet_to_Activity.findMany({
                    where: { petId: petId },
                    select: {
                        activity: true,
                        frequency: true,
                        date: true
                    }
                }).catch((error: any) => {
                    throw new Error("Error retrieving pet activities: " + error.message)
                })
            })

            return res.status(200).json({
                success: true,
                message: "Activities retrieved successfully",
                data: result
            })
        } catch (error: any) {
            console.log(error)

            return res.status(400).json({ success: false, message: error.message, data: null })
        }
    }

    addPetActivity = async (req: Request, res: Response): Promise<any> => {
        try {
            const petId = parseInt(req.params.petId)
            const {activity, frequency, date } = req.body;

            const result = await db.$transaction(async (prismadb: any) => {
                return await prismadb.pet_to_Activity.create({
                    data: {
                        petId: petId,
                        activity: activity,
                        frequency: frequency,
                        date: date
                    }
                }).catch((error: any) => {
                    throw new Error("Error adding pet activity: " + error.message)
                })
            })

            return res.status(201).json({
                success: true,
                message: "Pet activity added successfully",
                data: result
            })
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message, data: null })
        }
    }

    updatePetActivity = async (req: Request, res: Response): Promise<any> => {
        try {
            const activityId = parseInt(req.params.activityId)
            const {activity, frequency, date } = req.body;

            const result = await db.$transaction(async (prismadb: any) => {
                return await prismadb.pet_to_Activity.update({
                    where: { id: activityId },
                    data: {
                        activity: activity,
                        frequency: frequency,
                        date: date
                    },
                }).catch((error: any) => {
                    throw new Error("Error updating pet activity: " + error.message)
                })
            })

            return res.status(200).json({
                success: true,
                message: "Pet activity updated successfully",
                data: result
            })
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message, data: null })
        }
    }

    deletePetActivity = async (req: Request, res: Response): Promise<any> => {
        try {
            const activityId = parseInt(req.params.activityId)
            await db.$transaction(async (prismadb: any) => {
                const existedActivity = await prismadb.pet_to_Activity.findUnique({
                    where: { id: activityId }
                })
                if (!existedActivity) {
                    return res.status(400).json({ success: false, message: "Pet activity not found", data: null });
                }
                await prismadb.pet_to_Activity.delete({
                    where: { id: activityId }
                }).catch((error: any) => {
                    throw new Error("Error deleting pet activity: " + error.message)
                })
                return
            })

            return res.status(200).json({
                success: true,
                message: "Pet activity deleted successfully",
                data: null
            })
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message, data: null })
        }
    }

    getActivityCountByPet = async (req: Request, res: Response): Promise<any> => {
        try {
            const petId = parseInt(req.params.petId)
            const {activity, start_date, end_date} = req.query
            const result = await db.$transaction(async (prismadb: any) => {
                if (start_date && end_date) {
                    return await prismadb.pet_to_Activity.aggregate({
                        where: { 
                            petId: petId, 
                            activity: activity,
                            date:{
                                gte: new Date(start_date as string),
                                lte: new Date(end_date as string),
                            }
                        },
                        _sum: {
                            frequency: true
                        }
                    }).catch((error: any) => {
                        throw new Error("Error counting pet activities: " + error.message)
                    })
                }
                return await prismadb.pet_to_Activity.aggregate({
                        where: { 
                            petId: petId, 
                            activity: activity,
                        },
                        _sum: {
                            frequency: true
                        }
                    }).catch((error: any) => {
                        throw new Error("Error counting pet activities: " + error.message)
                })
            })

            return res.status(200).json({
                success: true,
                message: "Activity count retrieved successfully",
                data: result
            })
        } catch (error: any) {
            console.log(error)
            return res.status(400).json({ success: false, message: error.message, data: null })
        }
    }
    
}

export default new petActivitiesController();