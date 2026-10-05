declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
        photo?: string;
        position?: string;
        status?: string;
        birthDate?: string;
        createdAt?: string;
        updatedAt?: string;
      };
    }
  }
}

export {};
