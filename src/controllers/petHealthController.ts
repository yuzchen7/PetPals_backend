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