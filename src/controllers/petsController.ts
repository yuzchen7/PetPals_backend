import { Request, Response } from "express";
import db from "../utils/db";
import { Pet_Type, Sex_Type } from "@prisma/client";

type PetRegistrationInfo = {
    dateOfBirth: string;
    name: string;
    sex: Sex_Type;
    type: Pet_Type;
}

class PetsController {
    async getAllPets(req: Request, res: Response): Promise<any> | never {
        
    }

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

    async getPetDetails(req: Request, res: Response) { }

    async updatePet(req: Request, res: Response) { }

    async deletePet(req: Request, res: Response) { }
}

export default new PetsController();