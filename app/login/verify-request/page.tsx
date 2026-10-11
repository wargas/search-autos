import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Form from "next/form";
import Link from "next/link";

export default async function VerifyRequestPage({ searchParams }: PageProps<"/login/verify-request">) {

    const { email = "" } = await searchParams

    return <div className="h-screen w-full flex items-center justify-center">
        <Card className="w-lg">
            <CardHeader>
                <CardTitle>Verifique se Email</CardTitle>
                <CardDescription>O token de acesso foi enviado para o seu endereço de e-mail.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form action={'/api/auth/callback/nodemailer'} formMethod="GET" className="flex flex-col gap-4">
                    <Field>
                        <FieldLabel>Token</FieldLabel>
                        <Input type="hidden" name="callbackUrl" value={process.env.AUTH_URL!} />
                        <Input name="token" />

                        <Input type="hidden" name="email" value={email} />
                    </Field>

                    <Button>Entrar</Button>
                </Form>
                <Button asChild>
                    <Link href={`/`}>Voltar</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
}