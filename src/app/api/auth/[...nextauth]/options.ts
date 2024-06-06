import GithubProvider from 'next-auth/providers/github';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

interface Credentials {
  username: string;
  password: string;
}
interface User {
    id: number;
    name: string;
    password: string;
  } 
export const options: NextAuthOptions = {
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID as string,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    // }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
          username: { label: 'username', type: 'text', placeholder: 'username' },
          password: { label: 'password', type: 'password', placeholder: 'password' },
        },
        async authorize(credentials: Record<"username" | "password", string> | undefined, req: any) {
          const user:any = { id: 1, name: 'test', password: 'test' };
          if (
            credentials?.username === user.name &&
            credentials?.password === user.password)
          {
            console.log(user);
            return user;
          } else {
            return null;
          }
        },
      }),
  ],
};
