import _ from "lodash"
import z from 'zod';


const schema = z.object({
    q: z.string().default(''),
    ano: z.string().default('todos'),
    auditor: z.string().default(''),
    p: z.string().default('1'),
    contribuinte: z.string().default(''),
    infracao: z.string().default(''),
    acao: z.string().default(''),
    geaf: z.string().default('')
})
 

export function getFilterParams(params: Record<string, string | string[]>) {
    const data = schema.safeParse(params);

    return data.data!;
}


export type FilterParams = ReturnType<typeof getFilterParams>