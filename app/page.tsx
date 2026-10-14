import { ButtonLogout } from "@/components/button-logout";
import { FormLoading } from "@/components/form-loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auth } from "@/lib/auth";
import { elastic } from "@/lib/elastic";
import { cn } from "@/lib/utils";
import { ProcessoFiscal } from "@/types";
import { range } from "lodash";
import { ChevronDown, ChevronLeft, ChevronRight, Link2Icon, LogOutIcon } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { redirect } from "next/navigation";
import qs from "querystring"
import { estypes } from '@elastic/elasticsearch'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ModeToggle } from "@/components/theme-toggle";

// type T =estypes

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const { q, ano = "todos", auditor = "", p = "1", contribuinte = "", infracao = "", acao = "" } = await searchParams
  const session = await auth()

  const page = parseInt(String(p))

  if (!session?.user) {
    redirect('/login')
  }

  const filter: estypes.QueryDslQueryContainer[] = []

  if (ano != "todos") {
    filter.push({ wildcard: { 'acao.dataCriacao': { value: `*${ano}` } } })
  }

  if (infracao) {
    filter.push({ match_phrase: { 'infracao': String(infracao) } })
  }

  if (auditor) {
    filter.push({ match_phrase: { 'acao.auditor': String(auditor) } })
  }

  if (acao) {
    filter.push({ match_phrase: { 'acao.protocolo': String(acao) } })
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
    <SidebarProvider style={{ "--sidebar-width": "22rem", } as React.CSSProperties}>
      <Form action={``}>
        <Sidebar variant="sidebar">
          <SidebarHeader className="border-b">
            <SidebarMenu>
              <SidebarMenuItem className="flex gap-2">
                <span className="text-xl font-bold text-primary flex-1">
                  SEARCH AUTOS
                </span>
                <ModeToggle />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="flex flex-col gap-4 p-4">

              <Select name="ano" key={`ano-${ano}`} defaultValue={ano.toString() ?? 'todos'}>
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
              <Input key={`q-${q}`} defaultValue={q} placeholder="termo de busca..." name="q" />
              <Input key={`auditor-${auditor}`} defaultValue={auditor} placeholder="auditor..." name="auditor" />
              <Input key={`contribuinte-${contribuinte}`} defaultValue={contribuinte} placeholder="sujeito passivo..." name="contribuinte" />
              <Input key={`infracao-${infracao}`} defaultValue={infracao} placeholder="infracao..." name="infracao" />
              <Input key={`acao-${acao}`} defaultValue={acao} placeholder="acao fiscal..." name="acao" />
              <input type="hidden" name="p" value={1} />

              <div className="flex gap-2 mt-4">
                <Button variant={`outline`} className="flex-1" asChild>
                  <Link href={'/'}>
                    Limpar
                  </Link>
                </Button>
                <Button type="submit" className="col-span-12 md:col-span-1 flex-1">
                  <FormLoading />
                  Filtrar
                </Button>
              </div>


            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size={'lg'} asChild>
                  <div>
                    <div className="flex flex-col">
                      <span>{session.user.name}</span>
                      <span className="text-sm text-gray-300">
                        {session.user?.email ?? ""}
                      </span>

                    </div>
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
