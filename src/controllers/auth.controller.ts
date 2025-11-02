import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { EmailService } from "../services/email.service";

export class AuthController {
  private googleClient: OAuth2Client | null = null;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (clientId && clientSecret && redirectUri) {
      this.googleClient = new OAuth2Client(clientId, clientSecret, redirectUri);
    } else {
      logger.warn("Google OAuth credentials not fully configured. Google OAuth will be disabled.");
    }
  }

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

  // Google OAuth login
  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      if (!this.googleClient) {
        res.status(503).json({
          success: false,
          message: "Google OAuth is not configured",
        });
        return;
      }

      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          message: "Google token is required",
        });
        return;
      }

      // Verify the Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        res.status(400).json({
          success: false,
          message: "Invalid Google token",
        });
        return;
      }

      const { email, name, picture, sub: googleId } = payload;

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email not provided by Google",
        });
        return;
      }

      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email },
        include: {
          accounts: {
            where: { providerId: "google" },
          },
        },
      });

      if (user) {
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

        // Check if Google account is linked
        const googleAccount = user.accounts.find((account) => account.providerId === "google");
        if (!googleAccount) {
          // Link Google account to existing user
          await prisma.account.create({
            data: {
              accountId: googleId,
              providerId: "google",
              userId: user.id,
            },
          });
        }

        // Update user info if needed
        const updates: any = {};
        if (name && user.name !== name) updates.name = name;
        if (picture && user.image !== picture) updates.image = picture;
        if (!user.emailVerified) updates.emailVerified = true;

        if (Object.keys(updates).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updates,
            include: {
              accounts: {
                where: { providerId: "google" },
              },
            },
          });
        }
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split("@")[0],
            image: picture,
            emailVerified: true,
          },
          include: {
            accounts: {
              where: { providerId: "google" },
            },
          },
        });

        // Create Google account
        await prisma.account.create({
          data: {
            accountId: googleId,
            providerId: "google",
            userId: user.id,
          },
        });

        // Send welcome email
        await EmailService.sendWelcomeEmail(user.email, user.name);
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("JWT_SECRET not configured");
      }

      const jwtToken = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: "7d" });

      logger.info(`User logged in via Google: ${user.email} (${user.id})`);

      res.json({
        success: true,
        message: "Google authentication successful",
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      logger.error("Google authentication error:", error);
      res.status(500).json({
        success: false,
        message: "Google authentication failed",
      });
    }
  }

  // Get Google OAuth URL
  async getGoogleAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      if (!this.googleClient) {
        res.status(503).json({
          success: false,
          message: "Google OAuth is not configured",
        });
        return;
      }

      const authUrl = this.googleClient.generateAuthUrl({
        access_type: "offline",
        scope: ["profile", "email"],
        prompt: "select_account",
      });

      res.json({
        success: true,
        authUrl,
      });
    } catch (error) {
      logger.error("Get Google auth URL error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate Google auth URL",
      });
    }
  }

  // Handle Google OAuth callback
  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      if (!this.googleClient) {
        res.status(503).json({
          success: false,
          message: "Google OAuth is not configured",
        });
        return;
      }

      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          message: "Authorization code is required",
        });
        return;
      }

      // Exchange authorization code for tokens
      const { tokens } = await this.googleClient.getToken(code);
      this.googleClient.setCredentials(tokens);

      // Get user info from Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        res.status(400).json({
          success: false,
          message: "Invalid Google token",
        });
        return;
      }

      const { email, name, picture, sub: googleId } = payload;

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email not provided by Google",
        });
        return;
      }

      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email },
        include: {
          accounts: {
            where: { providerId: "google" },
          },
        },
      });

      if (user) {
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

        // Check if Google account is linked
        const googleAccount = user.accounts.find((account) => account.providerId === "google");
        if (!googleAccount) {
          // Link Google account to existing user
          await prisma.account.create({
            data: {
              accountId: googleId,
              providerId: "google",
              userId: user.id,
            },
          });
        }

        // Update user info if needed
        const updates: any = {};
        if (name && user.name !== name) updates.name = name;
        if (picture && user.image !== picture) updates.image = picture;
        if (!user.emailVerified) updates.emailVerified = true;

        if (Object.keys(updates).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updates,
            include: {
              accounts: {
                where: { providerId: "google" },
              },
            },
          });
        }
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split("@")[0],
            image: picture,
            emailVerified: true,
          },
          include: {
            accounts: {
              where: { providerId: "google" },
            },
          },
        });

        // Create Google account
        await prisma.account.create({
          data: {
            accountId: googleId,
            providerId: "google",
            userId: user.id,
          },
        });

        // Send welcome email
        await EmailService.sendWelcomeEmail(user.email, user.name);
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("JWT_SECRET not configured");
      }

      const jwtToken = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: "7d" });

      logger.info(`User logged in via Google OAuth callback: ${user.email} (${user.id})`);

      res.json({
        success: true,
        message: "Google authentication successful",
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      logger.error("Google OAuth callback error:", error);
      res.status(500).json({
        success: false,
        message: "Google OAuth callback failed",
      });
    }
  }

  // Handle Google OAuth callback redirect (GET request from Google)
  async googleCallbackRedirect(req: Request, res: Response): Promise<void> {
    try {
      if (!this.googleClient) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        res.redirect(`${frontendUrl}/auth/google-callback?error=oauth_not_configured`);
        return;
      }

      const { code, error } = req.query;

      if (error) {
        // Redirect to frontend with error
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        res.redirect(`${frontendUrl}/auth/google-callback?error=${encodeURIComponent(error as string)}`);
        return;
      }

      if (!code) {
        // Redirect to frontend with error
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        res.redirect(`${frontendUrl}/auth/google-callback?error=no_code`);
        return;
      }

      // Exchange authorization code for tokens
      const { tokens } = await this.googleClient.getToken(code as string);
      this.googleClient.setCredentials(tokens);

      // Get user info from Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        res.redirect(`${frontendUrl}/auth/google-callback?error=invalid_token`);
        return;
      }

      const { email, name, picture, sub: googleId } = payload;

      if (!email) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        res.redirect(`${frontendUrl}/auth/google-callback?error=no_email`);
        return;
      }

      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email },
        include: {
          accounts: {
            where: { providerId: "google" },
          },
        },
      });

      if (user) {
        // Check if user is banned
        if (user.banned) {
          const now = new Date();
          if (!user.banExpires || user.banExpires > now) {
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
            res.redirect(`${frontendUrl}/auth/google-callback?error=account_banned`);
            return;
          }
        }

        // Check if Google account is linked
        const googleAccount = user.accounts.find((account) => account.providerId === "google");
        if (!googleAccount) {
          // Link Google account to existing user
          await prisma.account.create({
            data: {
              accountId: googleId,
              providerId: "google",
              userId: user.id,
            },
          });
        }

        // Update user info if needed
        const updates: any = {};
        if (name && user.name !== name) updates.name = name;
        if (picture && user.image !== picture) updates.image = picture;
        if (!user.emailVerified) updates.emailVerified = true;

        if (Object.keys(updates).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updates,
            include: {
              accounts: {
                where: { providerId: "google" },
              },
            },
          });
        }
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split("@")[0],
            image: picture,
            emailVerified: true,
          },
          include: {
            accounts: {
              where: { providerId: "google" },
            },
          },
        });

        // Create Google account
        await prisma.account.create({
          data: {
            accountId: googleId,
            providerId: "google",
            userId: user.id,
          },
        });

        // Send welcome email
        await EmailService.sendWelcomeEmail(user.email, user.name);
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("JWT_SECRET not configured");
      }

      const jwtToken = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: "7d" });

      logger.info(`User logged in via Google OAuth redirect: ${user.email} (${user.id})`);

      // Redirect to frontend with success and token
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(
        `${frontendUrl}/auth/google-callback?success=true&token=${jwtToken}&user=${encodeURIComponent(
          JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
          })
        )}`
      );
    } catch (error) {
      logger.error("Google OAuth redirect error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/auth/google-callback?error=server_error`);
    }
  }
}
