import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import { SSOAuth } from "./ssoAuth";
import { last } from "lodash";

export const { auth, handlers, signIn, signOut} = NextAuth({
    providers: [
        CredentialsProvider({
            credentials: {cpf: {}, password: {}},
            name: `Credentials`,
            async authorize(credentials, req) {
            
                const token = await SSOAuth.factory().login(String(credentials.cpf), String(credentials.password))

                if(!token) return null;

                const payload = JSON.parse(atob(token.split('.')[1])) as any

                const lastName = last(String(payload.family_name).split(` `))
               
                return {
                    name: `${payload.given_name} ${lastName}`,
                    email: payload.email,
                    id: payload.sid,
                    image: ''
                }
            },
        })
    ]
});