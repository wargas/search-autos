import { ButtonLogout } from "@/components/button-logout";
import { FormLoading } from "@/components/form-loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auth, signOut } from "@/lib/auth";
import { elastic } from "@/lib/elastic";
import { ProcessoFiscal, SearchResponse } from "@/types";
import { range } from "lodash";
import { LogOut } from "lucide-react";
import Form from "next/form";
import { redirect } from "next/navigation";
import pretty from "pretty-time"

export default async function Home({ searchParams }: PageProps<"/">) {
  const { q, ano = "todos", auditor = "" } = await searchParams
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const start = process.hrtime()

  const query: Parameters<typeof elastic.search>[0] = {
    index: `auto_infracao`,
    query: {
      bool: {
        filter: [
          ...ano != "todos" ? [{ wildcard: { 'acao.dataCriacao': { value: `*${ano}` } } }] : [],
          ...auditor != "" ? [{ match_phrase: { 'acao.auditor': String(auditor) } }] : []
        ],
        must: [
          ...q ? [{ match: { descricao_text: String(q) } }] : [],

        ]
      }
    }    
  };


  const count = await elastic.count(query)

  const data = await elastic.search<ProcessoFiscal>({
    ...query, size: 20, sort: { 'protocolo.keyword': { order: 'desc' } }
  })


  const duration = process.hrtime(start)

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
          <Select name="ano" defaultValue={ano.toString()}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {range(2021, 2027).reverse().map(ano => (
                <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input defaultValue={q} placeholder="termo de busca..." name="q" />
          <Input defaultValue={auditor} placeholder="auditor..." name="auditor" />
          <Button type="submit">
            <FormLoading />
            Filtrar</Button>
        </Form>
        <div className="flex flex-col gap-4">
          <div className="text-sm">
            <span>{count.count} registros encontrados em {pretty(duration)}</span>
          </div>
          {data.hits.hits.map(hit => (
            <Card key={hit._id} className="shadow">
              <CardHeader className="border-b">
                <CardTitle>Processo: {hit._source?.protocolo}</CardTitle>
                <CardDescription>Ação Fiscal: {hit._source?.acao.protocolo}</CardDescription>
                <CardDescription>Data criacao: {hit._source?.acao.dataCriacao}</CardDescription>
                <CardDescription>Sujeito passivo: {hit._source?.acao.nome} - {hit._source?.acao.identificacao}</CardDescription>
                <CardDescription>GEAF: {hit._source?.acao.equipe}</CardDescription>
                <CardDescription>AUDITOR: {hit._source?.acao.auditor}</CardDescription>
                <CardDescription>INFRAÇÃO: {hit._source?.infracao}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mx-auto" dangerouslySetInnerHTML={{ __html: hit._source?.descricao ?? '' }}></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
