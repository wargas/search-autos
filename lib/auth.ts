import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/nodemailer"
import { SSOAuth } from "./ssoAuth";
import { last } from "lodash";
import { createStorage } from "unstorage"
import { UnstorageAdapter } from "@auth/unstorage-adapter"
import fsDriver from "unstorage/drivers/fs";
import { html, text } from "./email";
import { createTransport } from "nodemailer";


const storage = createStorage({
    driver: fsDriver({ base: "./data" })
})

export const { auth, handlers, signIn, signOut } = NextAuth({
    providers: [

        EmailProvider({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM,

            async sendVerificationRequest(params) {
                if(process.env.NODE_ENV != "production") {
                    console.log(params.url);

                    return;
                }

                const { identifier, url, provider, theme } = params;
                const { host } = new URL(url);
                const transport = createTransport(provider.server);
                const result = await transport.sendMail({
                    to: identifier,
                    from: provider.from,
                    subject: `Sign in to ${host}`,
                    text: text({ url, host }),
                    html: html({ url, host, theme }),
                });
                const rejected = result.rejected || [];
                const pending = result.pending || [];
                const failed = rejected.concat(pending).filter(Boolean);
                if (failed.length) {
                    throw new Error(`Email (${failed.join(", ")}) could not be sent`);
                }
            }
        }),


    ],
    adapter: UnstorageAdapter(storage),
    callbacks: {
        async signIn(props) {
            return !!props.user.email?.toLocaleLowerCase().endsWith("@sefaz.pe.gov.br")
        }
    }
});