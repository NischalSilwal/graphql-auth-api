export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}