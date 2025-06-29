import { Request, Response } from "express";``

exports.getAllPets = (req: Request, res: Response) => {
    const Pets = [{ id: 1, name: "Luna" }, { id: 2, name: "CoCo" }];
    res.json(Pets);
};

exports.petDetail =  (req: Request, res: Response) => {
    let name = 'Luna'
    res.status(201).json({
        status: true,
        message: `${name} details`,
        data: { 
            name: name,
            type: "cat",
        }
    });
};
