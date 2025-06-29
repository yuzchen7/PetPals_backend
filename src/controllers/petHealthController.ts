import { Request, Response } from "express";
import db from "../utils/db";

type PetHealthRegisterInfo = {
    size: number,
    weight: number,
    date: string,
}

type PetHealthUpdateInfo = {
    size?: number,
    weight?: number,
    date?: string,
}

class PetHealthController {
    /**
     * @swagger
     * /api/health:
     *   get:
     *     summary: Get health information for all pets owned by the authenticated user
     *     tags: [Pet Health]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Pet health information retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Pet health retrieved successfully"
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
     *                       healthInfo:
     *                         type: array
     *                         items:
     *                           type: object
     *                           properties:
     *                             size:
     *                               type: number
     *                               example: 25.5
     *                               description: Pet's size/height measurement
     *                             weight:
     *                               type: number
     *                               example: 30.2
     *                               description: Pet's weight in kg
     *                             date:
     *                               type: string
     *                               format: date-time
     *                               example: "2025-06-30T10:00:00Z"
     *                               description: Date when measurements were taken
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Pet health Internal Error"
     *                 data:
     *                   type: object
     */
    async getPetAllHealth(req: Request<{id: string}>, res: Response): Promise<any> | never {
        try {
            const user = (req as any).user;
            const result = await db.$transaction(async (prisma) => {
                const petHealth = await prisma.pet_Heath_Info.findMany({
                    where: {
                        pet: {
                            master: {
                                email: user.email
                            }
                        }
                    },
                    include: {
                        pet: {
                            include: {
                                master: true
                            }
                        }
                    }
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Failed to get pet health");
                });

                if (!petHealth) {
                    throw new Error("Failed to get pet health");
                }

                return petHealth;
            });

            const groupedPetsMap: Record<number, any> = {};

            result.forEach((health) => {
                const key = health.pet.id;

                if (!groupedPetsMap[key]) {
                    groupedPetsMap[key] = {
                        name: health.pet.name,
                        sex: health.pet.sex,
                        type: health.pet.type,
                        dateOfBirth: health.pet.dateOfBirth.toISOString(),
                        healthInfo: [],
                    };
                }

                groupedPetsMap[key].healthInfo.push({
                    size: health.size,
                    weight: health.weight,
                    date: health.date.toISOString(),
                });
            });

            const groupedPets = Object.values(groupedPetsMap);

            if (!result) {
                res.status(500).json({ status: false, message: "Pet health Internal Error", data: {} });
            } else {
                res.status(200).json({ status: true, message: "Pet health retrieved successfully", data: groupedPets });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    /**
     * @swagger
     * /api/health/pet/{id}:
     *   get:
     *     summary: Get health information for a specific pet
     *     tags: [Pet Health]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the pet to get health information for
     *     responses:
     *       200:
     *         description: Pet health information retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Pet health retrieved successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     pet:
     *                       type: object
     *                       properties:
     *                         name:
     *                           type: string
     *                           example: "Buddy"
     *                         sex:
     *                           type: string
     *                           enum: [M, F]
     *                           example: "M"
     *                         type:
     *                           type: string
     *                           enum: [Cat, Dog]
     *                           example: "Dog"
     *                         dateOfBirth:
     *                           type: string
     *                           format: date-time
     *                           example: "2022-01-15T00:00:00Z"
     *                     healthInfo:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           size:
     *                             type: number
     *                             example: 25.5
     *                             description: Pet's size/height measurement
     *                           weight:
     *                             type: number
     *                             example: 30.2
     *                             description: Pet's weight in kg
     *                           date:
     *                             type: string
     *                             format: date-time
     *                             example: "2025-06-30T10:00:00Z"
     *                             description: Date when measurements were taken
     *       500:
     *         description: Internal server error or pet not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Pet health Internal Error"
     *                 data:
     *                   type: object
     */
    async getPetHealth(req: Request, res: Response): Promise<any> | never {
        try {
            const user = (req as any).user;
            const pet_id = req.params.id;
            const result = await db.$transaction(async (prisma) => {
                const petHealth = await prisma.pet_Heath_Info.findMany({
                    where: {
                        petId: Number(pet_id),
                        pet: {
                            master: {
                                email: user.email
                            }
                        }
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
                    throw new Error("Failed to get pet health");
                });

                if (!petHealth) {
                    throw new Error("Failed to get pet health");
                }

                const resultArray = petHealth.map((health) => {
                    return {
                        size: health.size,
                        weight: health.weight,
                        date: health.date.toISOString(),
                    }
                })

                return {
                    pet: {
                        name: petHealth[0].pet.name,
                        sex: petHealth[0].pet.sex,
                        type: petHealth[0].pet.type,
                        dateOfBirth: petHealth[0].pet.dateOfBirth.toISOString()
                    },
                    healthInfo: resultArray
                }
            });

            if (!result) {
                return res.status(500).json({ status: false, message: "Pet health Internal Error", data: {} });
            } else {
                return res.status(200).json({ status: true, message: "Pet health retrieved successfully", data: result });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    /**
     * @swagger
     * /api/pets-health/update/{id}:
     *   put:
     *     summary: Update health information for a specific pet
     *     tags: [Pet Health]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the pet to update health information for
     *       - in: query
     *         name: health_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the specific health record to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               size:
     *                 type: number
     *                 example: 26.0
     *                 description: Updated pet's size/height measurement
     *               weight:
     *                 type: number
     *                 example: 31.5
     *                 description: Updated pet's weight in kg
     *               date:
     *                 type: string
     *                 format: date
     *                 example: "2025-06-30"
     *                 description: Updated date when measurements were taken (YYYY-MM-DD)
     *             description: All fields are optional for partial updates
     *     responses:
     *       200:
     *         description: Pet health information updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Pet health updated successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     status:
     *                       type: string
     *                       example: "updated"
     *                     pet:
     *                       type: object
     *                       properties:
     *                         name:
     *                           type: string
     *                           example: "Buddy"
     *                         sex:
     *                           type: string
     *                           enum: [M, F]
     *                           example: "M"
     *                         type:
     *                           type: string
     *                           enum: [Cat, Dog]
     *                           example: "Dog"
     *                         dateOfBirth:
     *                           type: string
     *                           format: date-time
     *                           example: "2022-01-15T00:00:00Z"
     *                     healthInfo:
     *                       type: object
     *                       properties:
     *                         size:
     *                           type: number
     *                           example: 26.0
     *                         weight:
     *                           type: number
     *                           example: 31.5
     *                         date:
     *                           type: string
     *                           format: date-time
     *                           example: "2025-06-30T00:00:00Z"
     *       500:
     *         description: Internal server error or update failed
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Pet health Internal Error"
     *                 data:
     *                   type: object
     */
    async updatePetHealth(req: Request<{id: string}, {}, PetHealthUpdateInfo>, res: Response): Promise<any> | never {
        try {
            const user = (req as any).user;
            const pet_id = req.params.id;
            const health_id = req.query.health_id;

            const result = await db.$transaction(async (prisma) => {
                const updatedHealth = await prisma.pet_Heath_Info.update({
                    where: {
                        id: Number(health_id),
                        petId: Number(pet_id),
                        pet: {
                            master: {
                                email: user.email
                            }
                        }
                    },
                    data: {
                        ...(req.body.size && { size: req.body.size }),
                        ...(req.body.weight && { weight: req.body.weight }),
                        ...(req.body.date && { date: new Date(req.body.date) }),
                    },
                    include: {
                        pet: true
                    }
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Failed to update pet health");
                });

                if (!updatedHealth) {
                    throw new Error("Failed to update pet health");
                }

                return {
                    status: 'updated',
                    pet: {
                        name: updatedHealth.pet.name,
                        sex: updatedHealth.pet.sex,
                        type: updatedHealth.pet.type,
                        dateOfBirth: updatedHealth.pet.dateOfBirth.toISOString()
                    },
                    healthInfo: {
                        size: updatedHealth.size,
                        weight: updatedHealth.weight,
                        date: updatedHealth.date.toISOString()
                    }
                }
            });

            if (!result) {
                return res.status(500).json({ status: false, message: "Pet health Internal Error", data: {} });
            } else {
                return res.status(200).json({ status: true, message: "Pet health updated successfully", data: result });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    /**
     * @swagger
     * /api/pets-health/delete/{id}:
     *   delete:
     *     summary: Delete a specific health record for a pet
     *     description: |
     *       **⚠️ WARNING: This is a destructive operation!**
     *       
     *       This endpoint permanently deletes a specific health record for a pet. 
     *       The health record will be completely removed from the database and cannot be recovered.
     *       
     *       **Authorization:** Requires a valid JWT token in the Authorization header.
     *       Only the pet owner can delete health records for their pets.
     *       
     *       **Example:** 
     *       ```
     *       Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *       ```
     *     tags: [Pet Health]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the pet whose health record to delete
     *         example: 1
     *       - in: query
     *         name: health_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the specific health record to delete
     *         example: 5
     *     responses:
     *       200:
     *         description: Pet health record deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Pet health deleted successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     status:
     *                       type: string
     *                       example: "deleted"
     *                     pet:
     *                       type: object
     *                       properties:
     *                         name:
     *                           type: string
     *                           example: "Buddy"
     *                         sex:
     *                           type: string
     *                           enum: [M, F]
     *                           example: "M"
     *                         type:
     *                           type: string
     *                           enum: [Cat, Dog]
     *                           example: "Dog"
     *                         dateOfBirth:
     *                           type: string
     *                           format: date-time
     *                           example: "2022-01-15T00:00:00Z"
     *                     healthInfo:
     *                       type: object
     *                       properties:
     *                         size:
     *                           type: number
     *                           example: 25.5
     *                           description: The deleted size measurement
     *                         weight:
     *                           type: number
     *                           example: 30.2
     *                           description: The deleted weight measurement
     *                         date:
     *                           type: string
     *                           format: date-time
     *                           example: "2025-06-30T10:00:00Z"
     *                           description: The date of the deleted measurement
     *       400:
     *         description: Bad request - Invalid pet ID or health record ID
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Internal Server Error"
     *       404:
     *         description: Pet or health record not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Internal Server Error"
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Pet health fail to Internal Server Error"
     *                 data:
     *                   type: object
     */
    async deletePetHealth(req: Request, res: Response): Promise<any> | never {
        try {
            const user = (req as any).user;
            const pet_id = req.params.id;
            const health_id = req.query.health_id;

            const result = await db.$transaction(async (prisma) => {
                const deleted = await prisma.pet_Heath_Info.delete({
                    where: {
                        id: Number(health_id),
                        petId: Number(pet_id),
                        pet: {
                            master: {
                                email: user.email
                            }
                        }
                    },
                    include: {
                        pet: {
                            include: {
                                master: true
                            }
                        }
                    }
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Failed to delete pet health");
                });

                if (!deleted) {
                    throw new Error("Failed to delete pet health");
                }

                return {
                    status: 'deleted',
                    pet: {
                        name: deleted.pet.name,
                        sex: deleted.pet.sex,
                        type: deleted.pet.type,
                        dateOfBirth: deleted.pet.dateOfBirth
                    },
                    healthInfo: {
                        size: deleted.size,
                        weight: deleted.weight,
                        date: deleted.date.toISOString()
                    }
                }
            });

            if (!result) {
                return res.status(500).json({ status: false, message: "Pet health fail to Internal Server Error", data: {} });
            } else {
                return res.status(200).json({ status: true, message: "Pet health deleted successfully", data: result });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    /**
     * @swagger
     * /api/pets-health/create/{id}:
     *   post:
     *     summary: Create a new health record for a specific pet
     *     description: |
     *       Add a new health measurement record for a pet owned by the authenticated user.
     *       This allows tracking of the pet's size, weight, and measurement dates over time.
     *       
     *       **Authorization:** Requires a valid JWT token in the Authorization header.
     *       Only the pet owner can create health records for their pets.
     *       
     *       **Example Authorization:** 
     *       ```
     *       Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *       ```
     *     tags: [Pet Health]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: The ID of the pet to create health record for
     *         example: 1
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - size
     *               - weight
     *               - date
     *             properties:
     *               size:
     *                 type: number
     *                 minimum: 0
     *                 example: 25.5
     *                 description: Pet's size/height measurement in appropriate units
     *               weight:
     *                 type: number
     *                 minimum: 0
     *                 example: 30.2
     *                 description: Pet's weight in kg
     *               date:
     *                 type: string
     *                 format: date
     *                 example: "2025-06-30"
     *                 description: Date when measurements were taken (YYYY-MM-DD format)
     *           examples:
     *             dog_measurement:
     *               summary: Dog health measurement
     *               value:
     *                 size: 25.5
     *                 weight: 30.2
     *                 date: "2025-06-30"
     *             cat_measurement:
     *               summary: Cat health measurement
     *               value:
     *                 size: 12.0
     *                 weight: 4.5
     *                 date: "2025-06-30"
     *     responses:
     *       201:
     *         description: Pet health record created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Pet health created successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     pet:
     *                       type: object
     *                       properties:
     *                         name:
     *                           type: string
     *                           example: "Buddy"
     *                         sex:
     *                           type: string
     *                           enum: [M, F]
     *                           example: "M"
     *                         type:
     *                           type: string
     *                           enum: [Cat, Dog]
     *                           example: "Dog"
     *                         dateOfBirth:
     *                           type: string
     *                           format: date-time
     *                           example: "2022-01-15T00:00:00Z"
     *                     healthInfo:
     *                       type: object
     *                       properties:
     *                         size:
     *                           type: number
     *                           example: 25.5
     *                         weight:
     *                           type: number
     *                           example: 30.2
     *                         date:
     *                           type: string
     *                           format: date-time
     *                           example: "2025-06-30T00:00:00Z"
     *       400:
     *         description: Bad request - Invalid input data or missing required fields
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Internal Server Error"
     *       404:
     *         description: Pet not found or doesn't belong to authenticated user
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Internal Server Error"
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Failed to Internal Server Error"
     *                 data:
     *                   type: object
     */
    async createPetHealth(req: Request<{id: string}, {}, PetHealthRegisterInfo>, res: Response): Promise<any> | never {
        try {
            const user = (req as any).user;
            const pet_id = req.params.id;

            const newHealth = await db.$transaction(async (prisma) => {
                const exitedPet = await prisma.pet.findUnique({
                    where: { 
                        id: Number(pet_id),
                        master: {
                            email: user.email
                        }
                    },
                    include: {
                        master: true
                    }
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Pet not found");
                });

                if (!exitedPet) {
                    throw new Error("Pet not found");
                }

                const newHealth = await prisma.pet_Heath_Info.create({
                    data: {
                        size: req.body.size,
                        weight: req.body.weight,
                        date: new Date(req.body.date),
                        petId: exitedPet!.id,
                    },
                    include: {
                        pet: true
                    }
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Failed to create pet health");
                });

                if (!newHealth) {
                    throw new Error("Failed to create pet health");
                }

                return {
                    pet: {
                        name: newHealth.pet.name,
                        sex: newHealth.pet.sex,
                        type: newHealth.pet.type,
                        dateOfBirth: newHealth.pet.dateOfBirth
                    },
                    healthInfo: {
                        size: newHealth.size,
                        weight: newHealth.weight,
                        date: newHealth.date.toISOString()
                    }
                };
            });

            if (!newHealth) {
                return res.status(500).json({status: false,  message: "Failed to Internal Server Error", data: {}});
            } else {
                return res.status(201).json({status: true,  message: "Pet health created successfully", data: newHealth});
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

export default new PetHealthController();