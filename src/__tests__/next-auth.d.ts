import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      movie?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    movie?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    movie?: string | null;
  }
}
