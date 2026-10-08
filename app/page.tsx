import { ButtonLogout } from "@/components/button-logout";
import { FormLoading } from "@/components/form-loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auth, signOut } from "@/lib/auth";
import { elastic } from "@/lib/elastic";
import { cn } from "@/lib/utils";
import { ProcessoFiscal, SearchResponse } from "@/types";
import { range, set } from "lodash";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { redirect } from "next/navigation";
import qs from "querystring"
import { estypes } from '@elastic/elasticsearch'

// type T =estypes

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const { q, ano = "todos", auditor = "", p = "1", contribuinte = "" } = await searchParams
  const session = await auth()

  const page = parseInt(String(p))

  if (!session?.user) {
    redirect('/login')
  }

  const filter: estypes.QueryDslQueryContainer[] = []

  if (ano != "todos") {
    filter.push({ wildcard: { 'acao.dataCriacao': { value: `*${ano}` } } })
  }

  if (auditor) {
    filter.push({ match_phrase: { 'acao.auditor': String(auditor) } })
  }

  if (contribuinte) {
    filter.push({
      multi_match: {
        query: contribuinte.toString(),
        fields: ['acao.identificacao', 'acao.nome'],
        type: 'phrase'
      }
    })
  }

  const query: Parameters<typeof elastic.search>[0] = {
    index: `auto_infracao`,
    query: {
      bool: {
        filter,
        must: [
          ...q ? [{ match_phrase: { descricao_text: String(q) } }] : [],
        ]
      }
    }
  };


  const count = await elastic.count(query)

  const data = await elastic.search<ProcessoFiscal>({
    ...query,
    size: 20,
    from: (page - 1) * 20,
    sort: { 'protocolo.keyword': { order: 'desc' } }
  })

  const pages = Math.ceil(count.count / 20)


  function generateSearchParams(newParams: any) {
    const search = { ...params, ...newParams }

    return "?" + qs.stringify(search)
  }

  return (
    <div className="">
      <div className="fixed h-14 border-b top-0 right-0 left-0 flex items-center px-4 shadow">
        <span className="font-bold text-xl">BUSCAR AUTOS</span>


        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger>
              {session.user?.email?.split("@").at(0) ?? ""} 
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
        <Form action={``} className="grid grid-cols-12 gap-4 mb-6">
          <Select name="ano" defaultValue={ano.toString()}>
            <SelectTrigger className="w-full col-span-12 md:col-span-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {range(2021, 2027).reverse().map(ano => (
                <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input className="col-span-12 md:col-span-6" defaultValue={q} placeholder="termo de busca..." name="q" />
          <Input className="col-span-12 md:col-span-2" defaultValue={auditor} placeholder="auditor..." name="auditor" />
          <Input className="col-span-12 md:col-span-2" defaultValue={contribuinte} placeholder="sujeito passivo..." name="contribuinte" />
          <input type="hidden" name="p" value={1} />
          <Button type="submit" className="col-span-12 md:col-span-1">
            <FormLoading />
            Filtrar</Button>
        </Form>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">

            <div className="text-sm">
              <span>mostrando de {((page - 1) * 20) + 1} a {((page - 1) * 20) + data.hits.hits.length} de {count.count} registros encontrados</span>
            </div>
            <div>
              <div className="flex">
                <Button className={cn({ "opacity-30": page == 1 })} variant={`ghost`} asChild>
                  <Link href={generateSearchParams({ p: Math.max(1, page - 1) })}><ChevronLeft /></Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={`outline`}>{page.toString().padStart(2, `0`)} <span className="opacity-50">/</span>  {pages.toString().padStart(2, '0')}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {Array(pages).fill(1).map((_, p) => (
                      <DropdownMenuItem key={p} asChild>
                        <Link href={generateSearchParams({ p: p + 1 })}>{(p + 1).toString().padStart(2, '0')}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button className={cn({ "opacity-30": page == pages })} variant={`ghost`} asChild>
                  <Link href={generateSearchParams({ p: Math.min(pages, page + 1) })}><ChevronRight /></Link>
                </Button>
              </div>
            </div>
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
