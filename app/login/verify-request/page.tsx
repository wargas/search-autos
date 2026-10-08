import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function VerifyRequestPage() {
    return <div className="h-screen w-full flex items-center justify-center">
        <Card className="w-lg">
            <CardHeader>
                <CardTitle>Verifique se Email</CardTitle>
                <CardDescription>Um link de acesso foi enviado para o seu endereço de e-mail.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href={`/`}>Voltar</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
}