import { Router } from "express";
import citizenController from "../controllers/citizen.controller";

const citizenRoutes = Router();

citizenRoutes.get("/", citizenController.getAll);
citizenRoutes.get("/cities", citizenController.getAllCities);

export { citizenRoutes };
