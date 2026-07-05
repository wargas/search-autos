import got from 'got';
import { parseHTML } from 'linkedom';
import _ from 'lodash';
import crypto from 'node:crypto'
import qs from 'querystring'

export class SSOAuth {

    static factory() {
        return new SSOAuth()
    }

    async generateAuthURL() {

        const baseUrl = "https://sso.sefaz.pe.gov.br/auth";
        const realm = "sefazpe";
        const client_id = "trb-gac-front-web";
        const scope = "openid";

        const url = new URL(
            `${baseUrl}/realms/${realm}/protocol/openid-connect/auth`
        );

        url.searchParams.set("client_id", client_id);
        url.searchParams.set(
            "redirect_uri",
            "https://conformidade.sefaz.pe.gov.br"
        );
        url.searchParams.set("state", crypto.randomUUID());
        url.searchParams.set("response_mode", "fragment");
        url.searchParams.set("response_type", "code");
        url.searchParams.set("scope", scope);
        url.searchParams.set("nonce", crypto.randomUUID());

        const code_verify = crypto.randomBytes(32).toBase64()
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");

        const code_chalange = crypto.createHash("sha256").update(code_verify).digest()
            .toBase64()
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");

        url.searchParams.set("code_challenge", code_chalange);
        url.searchParams.set("code_challenge_method", "S256");

        return { url: url.href, code_verify };
    }

    extractCookieString(header: string[]) {
        return header.map(c => {
            return c.replace(/(.*?)=(.*?);.*/, "$1=$2")
        }).join("; ")
    }


    async login(username: string, password: string) {

        
        const cpf = username.replace(/\D/g, "").padStart(11, '0')
        const cpfPlaceholder = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
        
        const authUrl = await this.generateAuthURL()

        const req = await got.get(authUrl.url, { cookieJar: undefined });

        let cookies = this.extractCookieString(req.headers["set-cookie"]!)

        const document = parseHTML(req.body).document

        const action = document.querySelector(`form`)?.getAttribute(`action`) ?? ``

        const reqLogin = await got.post(action, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": cookies
            },
            followRedirect: false,
            throwHttpErrors: false,
            form: {
                usernameplaceholder: cpfPlaceholder,
                username: cpf,
                password: password,
                credentialId: ''
            }
        })

        cookies = this.extractCookieString(reqLogin.headers["set-cookie"]!)

        const location = reqLogin.headers["location"]!

        if (!location) {
            return null
        }

        const { code } = qs.parse(location.split(`#`)[1]!)

        const reqToken = await got.post(`https://sso.sefaz.pe.gov.br/auth/realms/sefazpe/protocol/openid-connect/token`, {
            form: {
                code,
                grant_type: `authorization_code`,
                client_id: `trb-gac-front-web`,
                redirect_uri: `https://conformidade.sefaz.pe.gov.br`,
                code_verifier: authUrl.code_verify
            }
        })

        const { access_token, refresh_token } = JSON.parse(reqToken.body)

        return String(access_token)
    }


}