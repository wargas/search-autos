export function html(params: { url: string; host: string; theme: any, token: string }) {
    const { url, host, theme } = params

    const escapedHost = host.replace(/\./g, "&#8203;.")

    const brandColor = theme.brandColor || "#346df1"

    const buttonText = theme.buttonText || "#fff"

    const color = {
        background: "#f9f9f9",
        text: "#444",
        mainBackground: "#fff",
        buttonBackground: brandColor,
        buttonBorder: brandColor,
        buttonText,
    }

    return `
  <body style="background: ${color.background};">
    <table width="100%" border="0" cellspacing="20" cellpadding="0"
      style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
      <tr>
        <td align="center"
          style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          Logar em <strong>${escapedHost}</strong>
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 10px 0px; font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          token de Acesso: <strong>${params.token}</strong>
        </td>
      </tr>
      
       
      <tr>
        <td align="center"
          style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          Se você não solicitou este e-mail, pode ignorá-lo com segurança.

        </td>
      </tr>
    </table>
  </body>
  `
}

export function text({ url, host }: { url: string; host: string, token: string }) {
    return `Sign in to ${host}\n${token}\n\n`
}

