import { Request, Response } from "express";
import db from "../utils/db";

type PetHealthRegisterInfo = {
    size: number,
    weight: number,
    date: string,
}

class PetHealthController {
    async getPetAllHealth(req: Request, res: Response) {

    }

    async getPetHealth(req: Request, res: Response) {

    }

    async updatePetHealth(req: Request, res: Response) {

    }

    async deletePetHealth(req: Request, res: Response) {

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
                return res.status(400).json({status: false,  message: "Failed to create pet health", data: {}});
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