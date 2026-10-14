import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/auth";
import { elastic } from "@/lib/elastic";
import { cn } from "@/lib/utils";
import { ProcessoFiscal } from "@/types";
import { ChevronDown, ChevronLeft, ChevronRight, Link2Icon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import qs from "querystring"
import { estypes } from '@elastic/elasticsearch'
import { SidebarInset, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getFilterParams } from "@/lib/search";
import { AppSidebar } from "@/components/app-sidebar";


export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;

  const fields = getFilterParams(params as {})

  const session = await auth()

  const page = parseInt(fields.p)

  if (!session?.user) {
    redirect('/login')
  }

  const filter: estypes.QueryDslQueryContainer[] = []

  if (fields.ano != "todos") {
    filter.push({ wildcard: { 'acao.dataCriacao': { value: `*${fields.ano}` } } })
  }

  if (fields.infracao) {
    filter.push({ match_phrase: { 'infracao': String(fields.infracao) } })
  }

  if (fields.auditor) {
    filter.push({ match_phrase: { 'acao.auditor': String(fields.auditor) } })
  }

  if (fields.acao) {
    filter.push({ match_phrase: { 'acao.protocolo': String(fields.acao) } })
  }

  if (fields.contribuinte) {
    filter.push({
      multi_match: {
        query: fields.contribuinte.toString(),
        fields: ['acao.identificacao', 'acao.nome', 'cnpj'],
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
          ...fields.q ? [{ match_phrase: { descricao_text: String(fields.q) } }] : [],
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
    const search = { ...fields, ...newParams }

    return "?" + qs.stringify(search)
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "22rem", } as React.CSSProperties}>
      <AppSidebar fields={fields} />
      <SidebarRail />
      <SidebarInset>
        <main className="">

          <div className="p-4">

            <div className="flex flex-col gap-4">
              <div className="flex items-center">

                <SidebarTrigger />

                <div className="text-sm flex-1">
                  <span>mostrando de {((page - 1) * 20) + 1} a {((page - 1) * 20) + data.hits.hits.length} de {count.count} registros encontrados</span>
                </div>
                <div>
                  {data.hits.hits.length > 0 && (
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
                  )}
                </div>
              </div>
              
              {data.hits.hits.map(hit => hit._source).map(item => (
                <Collapsible className="relative group" key={item?.id}>
                  <Card className="shadow">
                    <CardHeader className="relative">
                      <CollapsibleTrigger asChild>
                        <Button className="absolute -bottom-3 right-1 group" variant={'outline'}>
                          <ChevronDown className="transition-all group-data-[state=open]:rotate-180" />
                        </Button>
                      </CollapsibleTrigger>
                      <CardTitle>Processo: {item?.protocolo}</CardTitle>
                      <CardDescription className="flex items-center gap-1">Ação Fiscal: {item?.acao.protocolo} <Link href={`?acao=${item?.acao.protocolo}`}><Link2Icon className="size-4" /></Link></CardDescription>
                      <CardDescription>Data lavratura: {item?.dataLavratura}</CardDescription>
                      <CardDescription>Sujeito passivo: {item?.acao.nome} - {item?.cnpj} - {item?.acao.identificacao}</CardDescription>
                      <CardDescription>GEAF: {item?.acao.equipe_id}</CardDescription>
                      <CardDescription>AUDITOR: {item?.acao.auditor}</CardDescription>
                      <CardDescription>INFRAÇÃO: {item?.infracao}</CardDescription>
                    </CardHeader>
                    <CollapsibleContent asChild>
                      <CardContent className="border-t pt-4">
                        <div className="mx-auto" dangerouslySetInnerHTML={{ __html: item?.descricao ?? '' }}></div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )


}
