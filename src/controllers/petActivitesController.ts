import { Request, Response } from "express";
import db from "../utils/db";

class petActivitiesController {
    /**
     * @swagger
     * /api/pets/activities:
     *   get:
     *     summary: Get all activities for all pets owned by the authenticated user
     *     tags: [Pet Activities]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Activities retrieved successfully
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
     *                   example: "Activities retrieved successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     pet:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           name:
     *                             type: string
     *                             example: "Buddy"
     *                           pta:
     *                             type: array
     *                             items:
     *                               type: object
     *                               properties:
     *                                 activity:
     *                                   type: string
     *                                   enum: [walking, feeding, potty, playtime, daycare]
     *                                   example: "walking"
     *                                 frequency:
     *                                   type: integer
     *                                   example: 1
     *                                 date:
     *                                   type: string
     *                                   format: date-time
     *                                   example: "2025-06-30T10:00:00Z"
     *       400:
     *         description: Bad request
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
     *                 data:
     *                   type: null
     */
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

    /**
     * @swagger
     * /api/pets/{petId}/activities:
     *   get:
     *     summary: Get all activities for a specific pet
     *     tags: [Pet Activities]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: petId
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the pet
     *     responses:
     *       200:
     *         description: Pet activities retrieved successfully
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
     *                   example: "Activities retrieved successfully"
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       activity:
     *                         type: string
     *                         enum: [walking, feeding, potty, playtime, daycare]
     *                         example: "walking"
     *                       frequency:
     *                         type: integer
     *                         example: 1
     *                       date:
     *                         type: string
     *                         format: date-time
     *                         example: "2025-06-30T10:00:00Z"
     *       400:
     *         description: Bad request
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
     *                 data:
     *                   type: null
     */
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

    /**
     * @swagger
     * /api/pets/{petId}/activities:
     *   post:
     *     summary: Add a new activity for a specific pet
     *     tags: [Pet Activities]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: petId
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the pet
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - activity
     *               - frequency
     *               - date
     *             properties:
     *               activity:
     *                 type: string
     *                 enum: [walking, feeding, potty, playtime, daycare]
     *                 example: "walking"
     *                 description: Type of activity
     *               frequency:
     *                 type: integer
     *                 example: 1
     *                 description: How many times this activity was performed
     *               date:
     *                 type: string
     *                 format: date-time
     *                 example: "2025-06-30T10:00:00Z"
     *                 description: Date and time when the activity occurred
     *     responses:
     *       201:
     *         description: Pet activity added successfully
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
     *                   example: "Pet activity added successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: integer
     *                       example: 1
     *                     petId:
     *                       type: integer
     *                       example: 1
     *                     activity:
     *                       type: string
     *                       example: "walking"
     *                     frequency:
     *                       type: integer
     *                       example: 1
     *                     date:
     *                       type: string
     *                       format: date-time
     *                       example: "2025-06-30T10:00:00Z"
     *       400:
     *         description: Bad request - validation error or missing fields
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
     *                 data:
     *                   type: null
     */
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

    /**
     * @swagger
     * /api/pets/activities/{activityId}:
     *   put:
     *     summary: Update a specific pet activity
     *     tags: [Pet Activities]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: activityId
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the activity to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               activity:
     *                 type: string
     *                 enum: [walking, feeding, potty, playtime, daycare]
     *                 example: "walking"
     *                 description: Updated activity type
     *               frequency:
     *                 type: integer
     *                 example: 2
     *                 description: Updated frequency count
     *               date:
     *                 type: string
     *                 format: date-time
     *                 example: "2025-06-30T10:00:00Z"
     *                 description: Updated date and time
     *     responses:
     *       200:
     *         description: Pet activity updated successfully
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
     *                   example: "Pet activity updated successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: integer
     *                       example: 1
     *                     petId:
     *                       type: integer
     *                       example: 1
     *                     activity:
     *                       type: string
     *                       example: "walking"
     *                     frequency:
     *                       type: integer
     *                       example: 2
     *                     date:
     *                       type: string
     *                       format: date-time
     *                       example: "2025-06-30T10:00:00Z"
     *       400:
     *         description: Bad request - validation error or activity not found
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
     *                 data:
     *                   type: null
     */
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

    /**
     * @swagger
     * /api/pets/activities/{activityId}:
     *   delete:
     *     summary: Delete a specific pet activity
     *     tags: [Pet Activities]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: activityId
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the activity to delete
     *     responses:
     *       200:
     *         description: Pet activity deleted successfully
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
     *                   example: "Pet activity deleted successfully"
     *                 data:
     *                   type: null
     *       400:
     *         description: Bad request - activity not found or deletion failed
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
     *                   example: "Pet activity not found"
     *                 data:
     *                   type: null
     */
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

    /**
     * @swagger
     * /api/pets/{petId}/activities/count:
     *   get:
     *     summary: Get activity count for a specific pet with optional filtering
     *     tags: [Pet Activities]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: petId
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the pet
     *       - in: query
     *         name: activity
     *         schema:
     *           type: string
     *           enum: [walking, feeding, potty, playtime, daycare]
     *         description: Filter by specific activity type
     *         example: "walking"
     *       - in: query
     *         name: start_date
     *         schema:
     *           type: string
     *           format: date
     *         description: Start date for date range filter (YYYY-MM-DD)
     *         example: "2025-06-01"
     *       - in: query
     *         name: end_date
     *         schema:
     *           type: string
     *           format: date
     *         description: End date for date range filter (YYYY-MM-DD)
     *         example: "2025-06-30"
     *     responses:
     *       200:
     *         description: Activity count retrieved successfully
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
     *                   example: "Activity count retrieved successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     _sum:
     *                       type: object
     *                       properties:
     *                         frequency:
     *                           type: integer
     *                           example: 15
     *                           description: Total frequency count for the specified activity and date range
     *       400:
     *         description: Bad request - invalid parameters
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
     *                 data:
     *                   type: null
     *     examples:
     *       all_activities:
     *         summary: Get total count for all activities
     *         value:
     *           petId: 1
     *           activity: "walking"
     *       date_range:
     *         summary: Get count for activities within date range
     *         value:
     *           petId: 1
     *           activity: "walking"
     *           start_date: "2025-06-01"
     *           end_date: "2025-06-30"
     */
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