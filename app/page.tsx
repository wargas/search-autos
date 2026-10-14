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
import { ChevronDown, ChevronLeft, ChevronRight, LogOut, LogOutIcon } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { redirect } from "next/navigation";
import qs from "querystring"
import { estypes } from '@elastic/elasticsearch'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ModeToggle } from "@/components/theme-toggle";

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
    <SidebarProvider style={{ "--sidebar-width": "25rem", } as React.CSSProperties}>
      <Form action={``}>
        <Sidebar variant="sidebar">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem className="flex gap-2">
                <span className="text-xl font-bold text-primary flex-1">
                  SEARCH AUTOS 
                </span>
                <ModeToggle />
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarSeparator />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="flex flex-col gap-4 p-4">

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


            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarSeparator />
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div>
                    {session.user?.email ?? ""}



                    <ButtonLogout className="ml-auto">
                      <LogOutIcon />
                    </ButtonLogout>


                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </Form>
      <SidebarRail />
      <SidebarInset>
        <main className="relative">

          <div className="p-4">

            <div className="flex flex-col gap-4">
              <div className="flex items-center">

                <SidebarTrigger />

                <div className="text-sm flex-1">
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
                <Collapsible className="relative group" key={hit._id}>
                  <Card className="shadow">
                    <CardHeader className="border-b relative">
                      <CollapsibleTrigger asChild>
                        <Button className="absolute bottom-1 right-1 group" variant={'outline'}>
                          <ChevronDown className="transition-all group-data-[state=open]:rotate-180" />
                        </Button>
                      </CollapsibleTrigger>
                      <CardTitle>Processo: {hit._source?.protocolo}</CardTitle>
                      <CardDescription>Ação Fiscal: {hit._source?.acao.protocolo}</CardDescription>
                      <CardDescription>Data lavratura: {hit._source?.dataLavratura}</CardDescription>
                      <CardDescription>Sujeito passivo: {hit._source?.acao.nome} - {hit._source?.cnpj} - {hit._source?.acao.identificacao}</CardDescription>
                      <CardDescription>GEAF: {hit._source?.acao.equipe_id}</CardDescription>
                      <CardDescription>AUDITOR: {hit._source?.acao.auditor}</CardDescription>
                      <CardDescription>INFRAÇÃO: {hit._source?.infracao}</CardDescription>
                    </CardHeader>
                    <CollapsibleContent asChild>
                      <CardContent>
                        <div className="mx-auto" dangerouslySetInnerHTML={{ __html: hit._source?.descricao ?? '' }}></div>
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
