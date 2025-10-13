import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { logger } from "../utils/logger";

export interface SubscriptionLimits {
  maxRooms: number;
  maxTimersPerRoom: number;
  maxMonthlyViews: number;
  canCreateRooms: boolean;
  canUseAdvancedFeatures: boolean;
}

export const getSubscriptionLimits = async (userId: string): Promise<SubscriptionLimits> => {
  try {
    // Get user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ["active", "trialing"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!subscription) {
      // Free plan limits
      return {
        maxRooms: 3,
        maxTimersPerRoom: 10,
        maxMonthlyViews: 100,
        canCreateRooms: true,
        canUseAdvancedFeatures: false,
      };
    }

    // Determine limits based on subscription plan
    switch (subscription.plan.toLowerCase()) {
      case "pro":
        return {
          maxRooms: 50,
          maxTimersPerRoom: 100,
          maxMonthlyViews: 10000,
          canCreateRooms: true,
          canUseAdvancedFeatures: true,
        };
      case "enterprise":
        return {
          maxRooms: -1, // Unlimited
          maxTimersPerRoom: -1, // Unlimited
          maxMonthlyViews: -1, // Unlimited
          canCreateRooms: true,
          canUseAdvancedFeatures: true,
        };
      default:
        // Default to free plan limits
        return {
          maxRooms: 3,
          maxTimersPerRoom: 10,
          maxMonthlyViews: 100,
          canCreateRooms: true,
          canUseAdvancedFeatures: false,
        };
    }
  } catch (error) {
    logger.error("Error getting subscription limits:", error);
    // Return free plan limits as fallback
    return {
      maxRooms: 3,
      maxTimersPerRoom: 10,
      maxMonthlyViews: 100,
      canCreateRooms: true,
      canUseAdvancedFeatures: false,
    };
  }
};

export const checkRoomLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const limits = await getSubscriptionLimits(req.user.id);

    if (!limits.canCreateRooms) {
      res.status(403).json({
        success: false,
        message: "Room creation not allowed with your current plan",
      });
      return;
    }

    if (limits.maxRooms === -1) {
      // Unlimited rooms
      next();
      return;
    }

    // Check current room count
    const roomCount = await prisma.room.count({
      where: {
        ownerId: req.user.id,
      },
    });

    if (roomCount >= limits.maxRooms) {
      res.status(403).json({
        success: false,
        message: `Room limit reached. You can create up to ${limits.maxRooms} rooms with your current plan.`,
        limit: limits.maxRooms,
        current: roomCount,
      });
      return;
    }

    next();
  } catch (error) {
    logger.error("Error checking room limit:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const checkTimerLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const limits = await getSubscriptionLimits(req.user.id);

    if (limits.maxTimersPerRoom === -1) {
      // Unlimited timers
      next();
      return;
    }

    const { roomId } = req.params;

    // Check current timer count for the room
    const timerCount = await prisma.timer.count({
      where: {
        roomId,
      },
    });

    if (timerCount >= limits.maxTimersPerRoom) {
      res.status(403).json({
        success: false,
        message: `Timer limit reached for this room. You can create up to ${limits.maxTimersPerRoom} timers per room with your current plan.`,
        limit: limits.maxTimersPerRoom,
        current: timerCount,
      });
      return;
    }

    next();
  } catch (error) {
    logger.error("Error checking timer limit:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const requireSubscription = (requiredPlan: string = "pro") => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: req.user.id,
          status: {
            in: ["active", "trialing"],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!subscription) {
        res.status(403).json({
          success: false,
          message: "Active subscription required",
          requiredPlan,
        });
        return;
      }

      // Check if user has the required plan level
      const planHierarchy = {
        free: 0,
        pro: 1,
        enterprise: 2,
      };

      const userPlanLevel = planHierarchy[subscription.plan.toLowerCase() as keyof typeof planHierarchy] || 0;
      const requiredPlanLevel = planHierarchy[requiredPlan.toLowerCase() as keyof typeof planHierarchy] || 1;

      if (userPlanLevel < requiredPlanLevel) {
        res.status(403).json({
          success: false,
          message: `${requiredPlan} plan or higher required`,
          currentPlan: subscription.plan,
          requiredPlan,
        });
        return;
      }

      next();
    } catch (error) {
      logger.error("Error checking subscription requirement:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

export const checkUsageLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const limits = await getSubscriptionLimits(req.user.id);

    if (limits.maxMonthlyViews === -1) {
      // Unlimited views
      next();
      return;
    }

    // Check monthly view count (this would need to be tracked in a separate table)
    // For now, we'll just pass through
    // In a real implementation, you'd track views and check against the limit

    next();
  } catch (error) {
    logger.error("Error checking usage limit:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
