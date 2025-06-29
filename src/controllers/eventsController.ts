import { Request, Response } from "express";
import db from "../utils/db";

class eventsController {
    /**
     * @swagger
     * /api/Reminders:
     *   get:
     *     summary: Get all reminders for the authenticated user
     *     tags: [Reminders]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Reminders retrieved successfully
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
     *                   example: "Reminders retrieved successfully"
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: integer
     *                         example: 1
     *                       start_time:
     *                         type: string
     *                         example: "09:00"
     *                       end_time:
     *                         type: string
     *                         example: "10:00"
     *                       description:
     *                         type: string
     *                         example: "Morning walk"
     *                       type:
     *                         type: string
     *                         enum: [health_care, walk]
     *                         example: "walk"
     *                       frequency:
     *                         type: integer
     *                         example: 1
     *                       pet:
     *                         type: object
     *                         properties:
     *                           name:
     *                             type: string
     *                             example: "Buddy"
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

    /**
     * @swagger
     * /api/Reminders/pet/{petId}:
     *   post:
     *     summary: Add a new reminder for a specific pet
     *     tags: [Reminders]
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
     *               - date
     *               - start_time
     *               - end_time
     *               - description
     *               - type
     *             properties:
     *               date:
     *                 type: string
     *                 format: date-time
     *                 example: "2025-06-30T09:00:00Z"
     *                 description: Date and time for the reminder
     *               start_time:
     *                 type: string
     *                 example: "09:00"
     *                 description: Start time in HH:MM format
     *               end_time:
     *                 type: string
     *                 example: "10:00"
     *                 description: End time in HH:MM format
     *               description:
     *                 type: string
     *                 example: "Morning walk in the park"
     *                 description: Description of the reminder
     *               type:
     *                 type: string
     *                 enum: [health_care, walk]
     *                 example: "walk"
     *                 description: Type of reminder/event
     *               detail:
     *                 type: string
     *                 example: "Take the usual route through the park"
     *                 description: Additional details about the reminder
     *               frequency:
     *                 type: integer
     *                 example: 1
     *                 description: How often this reminder occurs
     *     responses:
     *       201:
     *         description: Reminder added successfully
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
     *                   example: "Reminder added successfully"
     *                 data:
     *                   type: null
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

    /**
     * @swagger
     * /api/Reminders/{RemindersId}:
     *   delete:
     *     summary: Delete a specific reminder
     *     tags: [Reminders]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: RemindersId
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the event/reminder to delete
     *     responses:
     *       200:
     *         description: Reminder deleted successfully
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
     *                   example: "Reminder deleted successfully"
     *                 data:
     *                   type: null
     *       400:
     *         description: Bad request - reminder not found or deletion failed
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
     *                   example: "Failed to delete reminder"
     *                 data:
     *                   type: null
     */
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

    /**
     * @swagger
     * /api/Reminders/{RemindersId}:
     *   put:
     *     summary: Update a specific reminder
     *     tags: [Reminders]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: RemindersId
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the event/reminder to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               date:
     *                 type: string
     *                 format: date-time
     *                 example: "2025-06-30T09:00:00Z"
     *                 description: Updated date and time for the reminder
     *               start_time:
     *                 type: string
     *                 example: "09:00"
     *                 description: Updated start time in HH:MM format
     *               end_time:
     *                 type: string
     *                 example: "10:00"
     *                 description: Updated end time in HH:MM format
     *               description:
     *                 type: string
     *                 example: "Evening walk in the park"
     *                 description: Updated description of the reminder
     *               type:
     *                 type: string
     *                 enum: [health_care, walk]
     *                 example: "walk"
     *                 description: Updated type of reminder/event
     *               detail:
     *                 type: string
     *                 example: "Take the longer route today"
     *                 description: Updated additional details about the reminder
     *               frequency:
     *                 type: integer
     *                 example: 2
     *                 description: Updated frequency of this reminder
     *     responses:
     *       200:
     *         description: Reminder updated successfully
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
     *                   example: "Reminder updated successfully"
     *                 data:
     *                   type: null
     *       400:
     *         description: Bad request - validation error or update failed
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
     *                   example: "Failed to update reminder"
     *                 data:
     *                   type: null
     */
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

    /**
     * @swagger
     * /api/Reminders/pet/{petId}:
     *   get:
     *     summary: Get all reminders for a specific pet
     *     tags: [Reminders]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: petId
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the pet to get reminders for
     *     responses:
     *       200:
     *         description: Pet reminders retrieved successfully
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
     *                   example: "Reminder details retrieved successfully"
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: integer
     *                         example: 1
     *                       date:
     *                         type: string
     *                         format: date-time
     *                         example: "2025-06-30T09:00:00Z"
     *                       start_time:
     *                         type: string
     *                         example: "09:00"
     *                       end_time:
     *                         type: string
     *                         example: "10:00"
     *                       description:
     *                         type: string
     *                         example: "Morning walk"
     *                       type:
     *                         type: string
     *                         enum: [health_care, walk]
     *                         example: "walk"
     *                       detail:
     *                         type: string
     *                         example: "Take usual route"
     *                       frequency:
     *                         type: integer
     *                         example: 1
     *                       petId:
     *                         type: integer
     *                         example: 1
     *                       userId:
     *                         type: integer
     *                         example: 1
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

    /**
     * @swagger
     * /api/Reminders/detail/{RemindersId}:
     *   get:
     *     summary: Get detailed information of a specific reminder
     *     tags: [Reminders]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: Reminders
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the event/reminder to get details for
     *     responses:
     *       200:
     *         description: Reminder details retrieved successfully
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
     *                   example: "Reminder details retrieved successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: integer
     *                       example: 1
     *                     date:
     *                       type: string
     *                       format: date-time
     *                       example: "2025-06-30T09:00:00Z"
     *                     start_time:
     *                       type: string
     *                       example: "09:00"
     *                     end_time:
     *                       type: string
     *                       example: "10:00"
     *                     description:
     *                       type: string
     *                       example: "Morning walk"
     *                     type:
     *                       type: string
     *                       enum: [health_care, walk]
     *                       example: "walk"
     *                     detail:
     *                       type: string
     *                       example: "Take usual route through the park"
     *                     frequency:
     *                       type: integer
     *                       example: 1
     *                     petId:
     *                       type: integer
     *                       example: 1
     *                     userId:
     *                       type: integer
     *                       example: 1
     *                     pet:
     *                       type: object
     *                       properties:
     *                         name:
     *                           type: string
     *                           example: "Buddy"
     *       404:
     *         description: Reminder not found
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
     *                   example: "Reminder not found"
     *                 data:
     *                   type: null
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