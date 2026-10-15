import { FilterParams } from "@/lib/search";
import { range } from "lodash";
import { LogOutIcon, X } from "lucide-react";
import { ComponentProps } from "react";
import { ButtonLogout } from "./button-logout";
import { FormLoading } from "./form-loading";
import { ModeToggle } from "./theme-toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarContent, SidebarFooter, SidebarMenuButton, Sidebar } from "./ui/sidebar";
import Form from 'next/form'
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { InputGroup, InputGroupButton, InputGroupInput } from "./ui/input-group";
import qs from 'querystring'
import { acoes, processos } from "@/drizzle/schema";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { Autocomplete } from "./autocomplete";


export async function AppSidebar({ fields }: ComponentProps<"div"> & { fields: FilterParams }) {

    const session = await auth()

    function generateSearchParams(newParams: any) {
        const search = { ...fields, ...newParams }

        return "?" + qs.stringify(search)
    }

    const auditores = (await db.select({ label: acoes.auditor })
        .from(acoes)
        .groupBy(acoes.auditor)
        .orderBy(asc(acoes.auditor))).map(i => ({ label: String(i.label), value: String(i.label) }))

    const infracoes = (await db.select({ label: processos.infracao })
        .from(processos)
        .groupBy(processos.infracao)
        .orderBy(asc(processos.infracao))).map(i => ({ label: String(i.label), value: String(i.label) }))

    return <Sidebar variant="sidebar">

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
            <Form action={``}>
                <SidebarMenu className="flex flex-col gap-4 p-4">
                    <Field className="gap-1">
                        <FieldLabel>Ano</FieldLabel>

                        <Select name="ano" key={`ano-${fields.ano}`} defaultValue={fields.ano ?? 'todos'}>
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
                    </Field>
                    <Field className="gap-1 relative">
                        <FieldLabel>Termo</FieldLabel>
                        <InputGroup>
                            <InputGroupInput key={`q-${fields.q}`} defaultValue={fields.q} placeholder="termo de busca..." name="q" />
                            {fields.q !== "" && (
                                <InputGroupButton asChild>
                                    <Link href={generateSearchParams({ q: '' })}>
                                        <X />
                                    </Link>
                                </InputGroupButton>
                            )}
                        </InputGroup>

                    </Field>
                    <Field className="gap-1">
                        <FieldLabel>Auditor</FieldLabel>
                        <Autocomplete placeholder="auditor" key={`auditor-${fields.auditor}`} defaultValue={fields.auditor} name="auditor" items={auditores} />
                        
                    </Field>
                    <Field className="gap-1">
                        <FieldLabel>Sujeito Passivo</FieldLabel>
                        <InputGroup>
                            <InputGroupInput key={`contribuinte-${fields.contribuinte}`} defaultValue={fields.contribuinte} placeholder="sujeito passivo..." name="contribuinte" />
                            {fields.contribuinte !== "" && (
                                <InputGroupButton asChild>
                                    <Link href={generateSearchParams({ contribuinte: '' })}>
                                        <X />
                                    </Link>
                                </InputGroupButton>
                            )}
                        </InputGroup>
                    </Field>
                    <Field className="gap-1">
                        <FieldLabel>Infração</FieldLabel>
                        <Autocomplete placeholder="infracao" defaultValue={fields.infracao} key={`infracao-${fields.infracao}`} name="infracao" items={infracoes} />
                        
                    </Field>
                    <Field className="gap-1">
                        <FieldLabel>Ação</FieldLabel>
                        <InputGroup>
                            <InputGroupInput key={`acao-${fields.acao}`} defaultValue={fields.acao} placeholder="acao fiscal..." name="acao" />
                            {fields.acao !== "" && (
                                <InputGroupButton asChild>
                                    <Link href={generateSearchParams({ acao: '' })}>
                                        <X />
                                    </Link>
                                </InputGroupButton>
                            )}
                        </InputGroup>
                    </Field>
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
                <code>

                </code>
            </Form>
        </SidebarContent>
        <SidebarFooter className="border-t">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size={'lg'} asChild>
                        <div>
                            <div className="flex flex-col">
                                <span>{session?.user?.name}</span>
                                <span className="text-sm text-gray-300">
                                    {session?.user?.email ?? ""}
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
}