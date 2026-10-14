import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/nodemailer"
import { createStorage } from "unstorage"
import { UnstorageAdapter } from "@auth/unstorage-adapter"
import fsDriver from "unstorage/drivers/fs";
import { html, text } from "./email";
import { createTransport } from "nodemailer";
import qs from 'querystring'
import { writeFile } from "fs/promises";
import _ from "lodash";

const storage = createStorage({
    driver: fsDriver({ base: "./data" })
})

export const { auth, handlers, signIn, signOut } = NextAuth({
    providers: [

        EmailProvider({
            server: process.env.EMAIL_SERVER ?? "smtp://admin:admin@smtp.deltex.com.br:587",
            from: process.env.EMAIL_FROM!,
            generateVerificationToken() {
                return crypto.randomUUID()
            },
            async sendVerificationRequest(params) {

                console.log("TOKEN", params.token);
                console.log("EXPIRES", params.expires);


                const { identifier, url, provider, theme } = params;
                const { host } = new URL(url);

                console.log(params.token);

                if (process.env.NODE_ENV != "production") {
                    console.log(params.url);

                    await writeFile("email.html", html({ url: params.url, host: host, theme: params.theme, token: params.token }))

                    return;
                }


                // console.log(params.url);


                const transport = createTransport(provider.server);
                const result = await transport.sendMail({
                    to: identifier,
                    from: provider.from,
                    subject: `Sign in to ${host}`,
                    text: text({ url, host, token: params.token }),
                    html: html({ url, host, theme, token: params.token }),
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
        },
        session({ session }) {

            session.user.name = session.user.email.replace(/(.*?)\.(.*?)@(.*)/, "$1 $2")
                .split(" ").map(t => _.upperFirst(t)).join(" ")

            return session
        }
    }
});