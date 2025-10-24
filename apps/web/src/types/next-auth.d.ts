import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    nestjsToken?: string;
  }

  interface User {
    id: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    nestjsToken?: string;
  }
}