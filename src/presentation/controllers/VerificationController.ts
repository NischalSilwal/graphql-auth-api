import { Router, Request, Response } from 'express';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { container, TYPES } from '../../infrastructure/di/inversify.config';

const router = Router();
const userRepository = container.get<IUserRepository>(TYPES.UserRepository);

router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #f44336;">❌ Invalid Verification Link</h1>
            <p>The verification link is invalid or missing.</p>
          </body>
        </html>
      `);
    }

    const isVerified = await userRepository.verifyEmail(token);

    if (isVerified) {
      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #4CAF50;">✅ Email Verified Successfully!</h1>
            <p>Your email has been verified. You can now log in to your account.</p>
            <a href="${process.env.CLIENT_URL || '#'}" style="display: inline-block; background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go to Login</a>
          </body>
        </html>
      `);
    } else {
      res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #f44336;">❌ Verification Failed</h1>
            <p>The verification link is invalid or has already been used.</p>
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #f44336;">❌ Server Error</h1>
          <p>An error occurred during email verification. Please try again later.</p>
        </body>
      </html>
    `);
  }
});

export default router;