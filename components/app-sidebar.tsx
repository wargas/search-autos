import { FilterParams } from "@/lib/search";
import { range } from "lodash";
import { LogOutIcon } from "lucide-react";
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

export async function AppSidebar({ fields }: ComponentProps<"div"> & { fields: FilterParams }) {

    const session = await auth()
        
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
                    <Input key={`q-${fields.q}`} defaultValue={fields.q} placeholder="termo de busca..." name="q" />
                    <Input key={`auditor-${fields.auditor}`} defaultValue={fields.auditor} placeholder="auditor..." name="auditor" />
                    <Input key={`contribuinte-${fields.contribuinte}`} defaultValue={fields.contribuinte} placeholder="sujeito passivo..." name="contribuinte" />
                    <Input key={`infracao-${fields.infracao}`} defaultValue={fields.infracao} placeholder="infracao..." name="infracao" />
                    <Input key={`acao-${fields.acao}`} defaultValue={fields.acao} placeholder="acao fiscal..." name="acao" />
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