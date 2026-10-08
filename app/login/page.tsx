
import { Button } from "@/components/ui/button";
import { auth, signIn, signOut } from "@/lib/auth";
import Form from "next/form";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormLoading } from "@/components/form-loading";

export default async function PageLogin({searchParams}:PageProps<"/login">) {

    const { error, success } = await searchParams
    const session = await auth()

    if(session?.user) {
        redirect(`/`)
    }

    async function handleLogin(data: FormData) {
        'use server'

        try {

            const email = data.get("email")?.toString()

            await signIn("nodemailer", { email, redirect: false})
            // await signIn('credentials', { cpf: data.get('cpf'), password: data.get('password'), redirect: false });

        } catch (error) {

            console.log(error)

            redirect(`/login?error=1`)            
        }

        redirect(`/login/verify-request`)
        
    }

    return <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">

        <div className="flex flex-col gap-6 w-full max-w-sm">
            <div className="w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Login em sua conta</CardTitle>
                        <CardDescription>
                            Entre com suas credenciais da SEFAZ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error == "1" && <Alert variant={'destructive'} className="mb-4">
                                <AlertTitle>Erro</AlertTitle>
                                <AlertDescription>Credenciais Invalidas</AlertDescription>
                            </Alert>}
                        <Form action={handleLogin}>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        type="text"
                                        name="email"
                                        // required
                                    />
                                </Field>
                                
                                <Field>
                                    <Button type="submit">
                                        <FormLoading />
                                        Entrar</Button>

                                </Field>
                            </FieldGroup>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
}