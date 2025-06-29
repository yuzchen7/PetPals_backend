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

    async updatePet(req: Request, res: Response) { }

    async deletePet(req: Request, res: Response): Promise<any> | never {
        try {
            // const user = (req as any).user;
            // const pet_id = req.params.id;
        
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Failed to delete pet", data: {} });
        }
    }
}

export default new PetsController();