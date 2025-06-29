import { Request, Response } from "express";
import db from "../utils/db";
import { Pet_Type, Sex_Type } from "@prisma/client";

type PetRegistrationInfo = {
    dateOfBirth: string;
    name: string;
    sex: Sex_Type;
    type: Pet_Type;
}

type PetBasicInfo = {
    dateOfBirth?: string;
    name?: string;
    sex?: Sex_Type;
    type?: Pet_Type;
}

class PetsController {
    /**
     * @swagger
     * /api/pets:
     *   get:
     *     summary: Get all pets owned by the authenticated user
     *     tags: [Pets]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Pets retrieved successfully
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
     *                   example: "Pets found successfully"
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       name:
     *                         type: string
     *                         example: "Buddy"
     *                       sex:
     *                         type: string
     *                         enum: [M, F]
     *                         example: "M"
     *                       type:
     *                         type: string
     *                         enum: [Cat, Dog]
     *                         example: "Dog"
     *                       dateOfBirth:
     *                         type: string
     *                         format: date-time
     *                         example: "2022-01-15T00:00:00Z"
     *       404:
     *         description: User not found
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
     *                   example: "User not found"
     *                 data:
     *                   type: object
     *       500:
     *         description: Server error
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
     *                   example: "Failed to find pets"
     *                 data:
     *                   type: object
     */
    async getAllPets(req: Request, res: Response): Promise<any> | never {
        try {
            const user = (req as any).user;

            const pets = await db.$transaction(async (prisma) => {
                const existedUser = await prisma.user.findUnique({
                    where: {
                        email: user.email
                    },
                    include: {
                        pet: {
                            select: {
                                name: true,
                                sex: true,
                                type: true,
                                dateOfBirth: true
                            }
                        }
                    }
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Failed to find user");
                });

                if (!existedUser) {
                    return res.status(404).json({ success: false, message: "User not found", data: {} });
                }

                return existedUser.pet
            });

            if (pets) {
                return res.status(200).json({ success: true, message: "Pets found successfully", data: pets });
            } else {
                return res.status(500).json({ success: false, message: "Failed to find pets", data: {} });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Failed to find pets", data: {} });
        }
    }

    /**
     * @swagger
     * /api/pets/create:
     *   post:
     *     summary: Create a new pet for the authenticated user
     *     tags: [Pets]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - dateOfBirth
     *               - name
     *               - sex
     *               - type
     *             properties:
     *               dateOfBirth:
     *                 type: string
     *                 format: date
     *                 example: "2022-01-15"
     *                 description: Pet's date of birth (YYYY-MM-DD format)
     *               name:
     *                 type: string
     *                 example: "Buddy"
     *                 description: Pet's name
     *               sex:
     *                 type: string
     *                 enum: [M, F]
     *                 example: "M"
     *                 description: Pet's sex (M for Male, F for Female)
     *               type:
     *                 type: string
     *                 enum: [Cat, Dog]
     *                 example: "Dog"
     *                 description: Pet's type
     *     responses:
     *       201:
     *         description: Pet created successfully
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
     *                   example: "Pet created successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                       example: "Buddy"
     *                     sex:
     *                       type: string
     *                       enum: [M, F]
     *                       example: "M"
     *                     type:
     *                       type: string
     *                       enum: [Cat, Dog]
     *                       example: "Dog"
     *                     dateOfBirth:
     *                       type: string
     *                       format: date-time
     *                       example: "2022-01-15T00:00:00Z"
     *       400:
     *         description: Invalid pet registration data
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
     *                   example: "Invalid pet registration data"
     *                 data:
     *                   type: object
     *       404:
     *         description: User not found
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
     *                   example: "User not found"
     *                 data:
     *                   type: object
     *       500:
     *         description: Server error
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
     *                   example: "Failed to create pet"
     *                 data:
     *                   type: object
     */
    async createPet(req: Request<{}, {}, PetRegistrationInfo>, res: Response): Promise<any> | never {
        try {
            const user = (req as any).user;

            const pet_registration_data = req.body;
            if (!(pet_registration_data.dateOfBirth && pet_registration_data.name && pet_registration_data.sex && pet_registration_data.type)) {
                return res.status(400).json({ success: false, message: "Invalid pet registration data", data: {} });
            }

            const newPet = await db.$transaction(async (prisma) => {
                const existedUser = await prisma.user.findUnique({
                    where: {
                        email: user.email
                    }
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Failed to find user");
                });

                if (!existedUser) {
                    return res.status(404).json({ success: false, message: "User not found", data: {} });
                }

                const newPet = await prisma.pet.create({
                    data: {
                        dateOfBirth: new Date(pet_registration_data.dateOfBirth),
                        name: pet_registration_data.name,
                        sex: pet_registration_data.sex,
                        type: pet_registration_data.type,
                        userId: existedUser.id
                    }
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Failed to create pet");
                });

                if (!newPet) {
                    return res.status(500).json({ success: false, message: "Failed to create pet", data: {} });
                }

                return {
                    name: newPet.name,
                    sex: newPet.sex,
                    type: newPet.type,
                    dateOfBirth: newPet.dateOfBirth,
                };
            });

            if (newPet) {
                return res.status(201).json({ success: true, message: "Pet created successfully", data: newPet });
            } else {
                return res.status(500).json({ success: false, message: "Failed to create pet", data: {} });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Failed to create pet", data: {} });
        }
    }

    /**
     * @swagger
     * /api/pets/details/{id}:
     *   get:
     *     summary: Get detailed information about a specific pet
     *     tags: [Pets]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the pet to get details for
     *     responses:
     *       200:
     *         description: Pet details retrieved successfully
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
     *                   example: "Pet details found successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: integer
     *                       example: 1
     *                     name:
     *                       type: string
     *                       example: "Buddy"
     *                     sex:
     *                       type: string
     *                       enum: [M, F]
     *                       example: "M"
     *                     type:
     *                       type: string
     *                       enum: [Cat, Dog]
     *                       example: "Dog"
     *                     dateOfBirth:
     *                       type: string
     *                       format: date-time
     *                       example: "2022-01-15T00:00:00Z"
     *                     userId:
     *                       type: integer
     *                       example: 1
     *                     healthInfo:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           size:
     *                             type: string
     *                             example: "Medium"
     *                           weight:
     *                             type: number
     *                             example: 25.5
     *                           date:
     *                             type: string
     *                             format: date-time
     *                             example: "2025-06-30T10:00:00Z"
     *                     pta:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           frequency:
     *                             type: integer
     *                             example: 1
     *                           activity:
     *                             type: string
     *                             enum: [walking, feeding, potty, playtime, daycare]
     *                             example: "walking"
     *                           date:
     *                             type: string
     *                             format: date-time
     *                             example: "2025-06-30T10:00:00Z"
     *                     event:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           date:
     *                             type: string
     *                             format: date-time
     *                             example: "2025-06-30T10:00:00Z"
     *                           start_time:
     *                             type: string
     *                             example: "09:00"
     *                           end_time:
     *                             type: string
     *                             example: "10:00"
     *                           type:
     *                             type: string
     *                             enum: [health_care, walk]
     *                             example: "walk"
     *                           description:
     *                             type: string
     *                             example: "Morning walk"
     *                           detail:
     *                             type: string
     *                             example: "Take usual route"
     *                           frequency:
     *                             type: integer
     *                             example: 1
     *       500:
     *         description: Server error - User not found, Pet not found, or Failed to get pet details
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
     *                   example: "Failed to get pet details"
     *                 data:
     *                   type: object
     */
    async getPetDetails(req: Request, res: Response): Promise<any> | never {
        try {
            const user = (req as any).user;
            const pet_id = req.params.id;

            const petDetails = await db.$transaction(async (prisma) => {
                const existedUser = await prisma.user.findUnique({
                    where: {
                        email: user.email
                    }
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Failed to find user");
                });

                if (!existedUser) {
                    throw new Error("User not found");
                }

                const getPetDetails = await prisma.pet.findUnique({
                    where: {
                        id: Number(pet_id),
                        userId: existedUser.id
                    },
                    include: {
                        healthInfo: {
                            select: {
                                size: true,
                                weight: true,
                                date: true,
                            }
                        },
                        pta: {
                            select: {
                                frequency: true,
                                activity: true,
                                date: true,
                            }
                        },
                        event: {
                            select: {
                                date: true,
                                start_time: true,
                                end_time: true,
                                type: true,
                                description: true,
                                detail: true,
                                frequency: true,
                            }
                        }
                    },
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Failed to find pet");
                });

                if (!getPetDetails) {
                    throw new Error("Pet not found");
                }

                return getPetDetails;
            });

            if (petDetails) {
                return res.status(200).json({ success: true, message: "Pet details found successfully", data: petDetails });
            } else {
                return res.status(500).json({ success: false, message: "Failed to get pet details", data: {} });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Failed to get pet details", data: {} });
        }
    }

    /**
     * @swagger
     * /api/pets/update/{id}:
     *   put:
     *     summary: Update a specific pet's information
     *     tags: [Pets]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the pet to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               dateOfBirth:
     *                 type: string
     *                 format: date
     *                 example: "2022-01-15"
     *                 description: Updated pet's date of birth (YYYY-MM-DD format)
     *               name:
     *                 type: string
     *                 example: "Buddy Jr."
     *                 description: Updated pet's name
     *               sex:
     *                 type: string
     *                 enum: [M, F]
     *                 example: "F"
     *                 description: Updated pet's sex (M for Male, F for Female)
     *               type:
     *                 type: string
     *                 enum: [Cat, Dog]
     *                 example: "Cat"
     *                 description: Updated pet's type
     *             description: All fields are optional for partial updates
     *     responses:
     *       200:
     *         description: Pet updated successfully
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
     *                   example: "Pet updated successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                       example: "Buddy Jr."
     *                     sex:
     *                       type: string
     *                       enum: [M, F]
     *                       example: "F"
     *                     type:
     *                       type: string
     *                       enum: [Cat, Dog]
     *                       example: "Cat"
     *                     dateOfBirth:
     *                       type: string
     *                       format: date-time
     *                       example: "2022-01-15T00:00:00Z"
     *       500:
     *         description: Server error - User not found, Pet not found, or Failed to update pet
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
     *                   example: "Failed to update pet"
     *                 data:
     *                   type: object
     */
    async updatePet(req: Request<{id: string}, {}, PetBasicInfo>, res: Response): Promise<any> | never { 
        try {
            const user = (req as any).user;
            const pet_id = req.params.id;
            const updateData = req.body

            const petUpdated = await db.$transaction(async (prisma) => {
                const existedUser = await prisma.user.findUnique({
                    where: {
                        email: user.email
                    }
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Failed to find user");
                });

                if (!existedUser) {
                    throw new Error("User not found");
                }

                const petUpdated = await prisma.pet.update({
                    where: {
                        id: Number(pet_id),
                        userId: existedUser!.id
                    },
                    data: {
                        ...(updateData.name && { name: updateData.name }),
                        ...(updateData.sex && { sex: updateData.sex }),
                        ...(updateData.type && { type: updateData.type as Pet_Type }),
                        ...(updateData.dateOfBirth && { dateOfBirth: new Date(updateData.dateOfBirth) }),
                    },  
                    select: {
                        name: true,
                        sex: true,
                        type: true,
                        dateOfBirth: true
                    }
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Failed to update pet");
                })

                if (!petUpdated) {
                    throw new Error("Pet not found");
                }

                return petUpdated;
            });

            return res.status(200).json({ success: true, message: "Pet updated successfully", data: petUpdated });``
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Failed to update pet", data: {} });
        }
    }

    /**
     * @swagger
     * /api/pets/delete/{id}:
     *   delete:
     *     summary: Delete a specific pet and all associated data
     *     tags: [Pets]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the pet to delete
     *     responses:
     *       200:
     *         description: Pet deleted successfully
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
     *                   example: "Pet deleted successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: integer
     *                       example: 1
     *                     name:
     *                       type: string
     *                       example: "Buddy"
     *                     sex:
     *                       type: string
     *                       enum: [M, F]
     *                       example: "M"
     *                     type:
     *                       type: string
     *                       enum: [Cat, Dog]
     *                       example: "Dog"
     *                     dateOfBirth:
     *                       type: string
     *                       format: date-time
     *                       example: "2022-01-15T00:00:00Z"
     *                     userId:
     *                       type: integer
     *                       example: 1
     *       500:
     *         description: Server error - User not found, Pet not found, or Failed to delete pet
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
     *                   example: "Failed to delete pet"
     *                 data:
     *                   type: object
     *     description: |
     *       **Warning**: This operation will permanently delete the pet and all associated data including:
     *       - Health information records
     *       - Activity logs (pta records)
     *       - Event/reminder records
     *       
     *       This action cannot be undone.
     */
    async deletePet(req: Request, res: Response): Promise<any> | never {
        try {
            const user = (req as any).user;
            const pet_id = req.params.id;
            const deletePet = await db.$transaction(async (prisma) => {
                const existedUser = await prisma.user.findUnique({
                    where: {
                        email: user.email
                    }
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Failed to find user");
                });

                if (!existedUser) {
                    throw new Error("User not found");
                }

                const deletePet = await prisma.pet.delete({
                    where: {
                        id: Number(pet_id),
                        userId: existedUser!.id
                    }
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Failed to delete pet");
                });

                if (!deletePet) {
                    throw new Error("Pet not found");
                }

                return deletePet;
            });

            if (deletePet) {
                return res.status(200).json({ success: true, message: "Pet deleted successfully", data: deletePet });
            } else {
                return res.status(500).json({ success: false, message: "Failed to delete pet", data: {} });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Failed to delete pet", data: {} });
        }
    }
}

export default new PetsController();