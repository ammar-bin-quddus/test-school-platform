import { Router } from "express";
import {
  listUsers,
  updateUser,
  deleteUser,
  analyticsByStep,
  analyticsByCertifiedLevel,
} from "../controllers/admin.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

// User management
router.get("/users", authenticateJWT, authorizeRoles("admin"), listUsers);
router.put("/users/:id", authenticateJWT, authorizeRoles("admin"), updateUser);
router.delete("/users/:id", authenticateJWT, authorizeRoles("admin"), deleteUser);

// Analytics
router.get("/analytics/step", authenticateJWT, authorizeRoles("admin"), analyticsByStep);
router.get("/analytics/level", authenticateJWT, authorizeRoles("admin"), analyticsByCertifiedLevel);

export default router;
