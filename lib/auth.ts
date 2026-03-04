import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import getSupabase from './db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const identifier = (credentials.email as string).trim().toLowerCase();
        const supabase = getSupabase();

        // Accept either email or username — try email first, then username
        const { data: userByEmail, error: emailError } = await supabase
          .from('users')
          .select('id, username, email, password_hash')
          .eq('email', identifier)
          .maybeSingle();

        if (emailError) {
          console.error('Auth email lookup error:', emailError);
        }

        let user = userByEmail;

        if (!user) {
          // Try username lookup
          const { data: userByUsername, error: usernameError } = await supabase
            .from('users')
            .select('id, username, email, password_hash')
            .eq('username', identifier)
            .maybeSingle();

          if (usernameError) {
            console.error('Auth username lookup error:', usernameError);
          }
          user = userByUsername;
        }

        if (!user) {
          console.log('Auth: no user found for identifier:', identifier);
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!passwordMatch) return null;

        return {
          id: String(user.id),
          name: user.username,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.username as string;
      }
      return session;
    },
  },
});
