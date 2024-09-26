import NextAuth, { Profile as NextAuthProfile } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

interface Profile extends NextAuthProfile {
  id?: string;
}


const authOptions = {
  secret: process.env.NEXT_PUBLIC_SECRET,
  debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_SECRET_KEY,
      idToken: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/webmasters.readonly"
        }
      },
    }
    )
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token = Object.assign({}, token, { access_token: account.access_token });
      }
      return token
    },
    async session({ session, token }) {
      if (session) {
        session = Object.assign({}, session, { access_token: token.access_token })
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
