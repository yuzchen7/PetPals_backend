import { Request, Response } from "express";``

class PetsController {
    async getAllPets(req: Request, res: Response) {}
    async createPet(req: Request, res: Response) {}
    async getPetDetails(req: Request, res: Response) {}
    async updatePet(req: Request, res: Response) {}
    async deletePet(req: Request, res: Response) {}
}

export default new PetsController();