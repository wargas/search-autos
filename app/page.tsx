import { ButtonLogout } from "@/components/button-logout";
import { FormLoading } from "@/components/form-loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { auth, signOut } from "@/lib/auth";
import { elastic } from "@/lib/elastic";
import { ProcessoFiscal, SearchResponse } from "@/types";
import { LogOut } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { q } = await searchParams
  const session = await auth()

  if (!session) {
    redirect('/login')
  }


  const data = await elastic.search<ProcessoFiscal>({
    index: `processo_fiscal`,
    q: String(q)
  })

  async function handleLogout() {
    'use server'

    console.log(`sair`)

    await signOut({ redirectTo: '/login' })
  }

  return (
    <div className="">
      <div className="fixed h-14 border-b top-0 right-0 left-0 flex items-center px-4 shadow">
        <span className="font-bold text-xl">BUSCAR AUTOS</span>


        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger>
              {session.user?.name}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                  <ButtonLogout className="w-full">
                    <LogOut />
                    Sair
                  </ButtonLogout>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
      <div className="p-4 fixed inset-0 top-14 pt-4 overflow-y-auto">
        <Form action={``} className="flex gap-4 mb-6">
          <Input defaultValue={q} placeholder="termo de busca..." name="q" />
          <Button type="submit">
            <FormLoading />
            Filtrar</Button>
        </Form>
        <div className="flex flex-col gap-4">
          <div>
            <span>{data.hits.hits.length} registros encontrados</span>
          </div>
          {data.hits.hits.map(hit => (
            <Card key={hit._id} className="shadow">
              <CardHeader className="border-b">
                <CardTitle>Processo: {hit._source?.protocolo}</CardTitle>
                <CardDescription>Data: {hit._source?.dataLavratura}</CardDescription>
                <CardDescription>GEAF: {hit._source?.geaf}</CardDescription>
                <CardDescription>AUDITOR: {hit._source?.acaoFiscal.auditor}</CardDescription>
                <CardDescription>INFRAÇÃO: {hit._source?.infracao}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mx-auto" dangerouslySetInnerHTML={{ __html: hit._source?.descricaoFatos ?? '' }}></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
