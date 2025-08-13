import { Request, Response } from "express";
import User from "../models/User.model";
import TestResult from "../models/TestResult.model";

/**
 * List users with pagination & filtering
 */
export const listUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const query: any = {};
    if (role) query.role = role;
    if (search) query.email = { $regex: search, $options: "i" };

    const users = await User.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      data: users,
      pagination: { total, page: +page, pages: Math.ceil(total / +limit) },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to list users" });
  }
};

/**
 * Update user role or verification status
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, isVerified } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { role, isVerified },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ error: "User not found" });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

/**
 * Analytics: average score by step
 */
export const analyticsByStep = async (_req: Request, res: Response) => {
  try {
    const data = await TestResult.aggregate([
      {
        $group: {
          _id: "$step",
          avgScore: { $avg: "$scorePercent" },
          attempts: { $sum: 1 },
          passRate: { $avg: { $cond: ["$pass", 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch step analytics" });
  }
};

/**
 * Analytics: certified levels distribution
 */
export const analyticsByCertifiedLevel = async (_req: Request, res: Response) => {
  try {
    const data = await TestResult.aggregate([
      {
        $group: {
          _id: "$certifiedLevel",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch level analytics" });
  }
};
