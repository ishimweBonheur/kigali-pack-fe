import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authService, authUserToSession, type SessionUser } from "@/services/auth.service";
import { loginSchema } from "@/schemas/auth";

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }

  interface User extends SessionUser {
    accessToken: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT extends SessionUser {
    accessToken: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await authService.login(parsed.data);
        return authUserToSession(user);
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        return { ...token, ...user };
      }

      if (trigger === "update" && session?.user) {
        return { ...token, ...session.user };
      }

      const expiresAt = token.expiresAt as number | undefined;
      if (expiresAt && Date.now() < expiresAt - 60_000) {
        return token;
      }

      const refreshToken = token.refreshToken as string | undefined;
      if (!refreshToken) return token;

      try {
        const refreshed = await authService.refresh(refreshToken);
        const sessionUser = authUserToSession(refreshed);
        return { ...token, ...sessionUser };
      } catch {
        return null;
      }
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          role: token.role as string,
          organizationId: token.organizationId as string,
          accessToken: token.accessToken as string,
          refreshToken: token.refreshToken as string,
          expiresAt: token.expiresAt as number,
          emailVerified: null,
        };
      }
      return session;
    },
  },
});
