import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { EmailService } from "../services/email.service";

export class AuthController {
  // Register new user
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      // Validate input
      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          message: "Email, password, and name are required",
        });
        return;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
        return;
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          emailVerified: false,
        },
      });

      // Create account with hashed password
      await prisma.account.create({
        data: {
          accountId: user.id,
          providerId: "credential",
          userId: user.id,
          password: hashedPassword,
        },
      });

      // Generate email verification token
      const verificationToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

      // Store verification token
      await prisma.emailVerification.create({
        data: {
          userId: user.id,
          token: verificationToken,
          expiresAt,
        },
      });

      // Send verification email
      const emailSent = await EmailService.sendVerificationEmail(email, name, verificationToken);

      if (!emailSent) {
        logger.warn(`Failed to send verification email to ${email}, but user was created`);
      }

      logger.info(`New user registered: ${user.email} (${user.id})`);

      res.status(201).json({
        success: true,
        message: "User registered successfully. Please check your email to verify your account.",
        requiresEmailVerification: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      logger.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Login user
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          accounts: {
            where: { providerId: "credential" },
          },
        },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Check if user is banned
      if (user.banned) {
        const now = new Date();
        if (!user.banExpires || user.banExpires > now) {
          res.status(403).json({
            success: false,
            message: "Account is banned",
          });
          return;
        }
      }

      // Get password from account
      const account = user.accounts[0];
      if (!account || !account.password) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, account.password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("JWT_SECRET not configured");
      }

      const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: "7d" });

      logger.info(`User logged in: ${user.email} (${user.id})`);

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      logger.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get current user
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      res.json({
        success: true,
        user: req.user,
      });
    } catch (error) {
      logger.error("Get current user error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Logout user
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a JWT-based system, logout is typically handled client-side
      // by removing the token. You could implement token blacklisting here
      // if needed for enhanced security.

      logger.info(`User logged out: ${req.user?.email || "unknown"}`);

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      logger.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Verify email address
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          message: "Verification token is required",
        });
        return;
      }

      // Find verification record
      const verification = await prisma.emailVerification.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!verification) {
        res.status(400).json({
          success: false,
          message: "Invalid verification token",
        });
        return;
      }

      // Check if token is expired
      if (verification.expiresAt < new Date()) {
        // Clean up expired token
        await prisma.emailVerification.delete({
          where: { id: verification.id },
        });

        res.status(400).json({
          success: false,
          message: "Verification token has expired",
        });
        return;
      }

      // Check if user is already verified
      if (verification.user.emailVerified) {
        res.status(400).json({
          success: false,
          message: "Email address is already verified",
        });
        return;
      }

      // Update user as verified
      const updatedUser = await prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      });

      // Clean up verification token
      await prisma.emailVerification.delete({
        where: { id: verification.id },
      });

      // Send welcome email
      await EmailService.sendWelcomeEmail(updatedUser.email, updatedUser.name);

      logger.info(`Email verified for user: ${updatedUser.email} (${updatedUser.id})`);

      res.json({
        success: true,
        message: "Email verified successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          emailVerified: updatedUser.emailVerified,
        },
      });
    } catch (error) {
      logger.error("Email verification error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Resend verification email
  async resendVerificationEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email address is required",
        });
        return;
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Check if already verified
      if (user.emailVerified) {
        res.status(400).json({
          success: false,
          message: "Email address is already verified",
        });
        return;
      }

      // Clean up any existing verification tokens for this user
      await prisma.emailVerification.deleteMany({
        where: { userId: user.id },
      });

      // Generate new verification token
      const verificationToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

      // Store verification token
      await prisma.emailVerification.create({
        data: {
          userId: user.id,
          token: verificationToken,
          expiresAt,
        },
      });

      // Send verification email
      const emailSent = await EmailService.sendVerificationEmail(email, user.name, verificationToken);

      if (!emailSent) {
        res.status(500).json({
          success: false,
          message: "Failed to send verification email",
        });
        return;
      }

      logger.info(`Verification email resent to: ${email}`);

      res.json({
        success: true,
        message: "Verification email sent successfully",
      });
    } catch (error) {
      logger.error("Resend verification email error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      const { name, image } = req.body;
      const updates: any = {};

      if (name) updates.name = name;
      if (image) updates.image = image;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updates,
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info(`User profile updated: ${updatedUser.email} (${updatedUser.id})`);

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      logger.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
