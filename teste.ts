import { asc } from "drizzle-orm";
import { equipes, processos, acoes } from "./drizzle/schema";
import { db } from "./lib/db";

// const data = await db.select({ auditor: acoes.auditor })
//     .from(acoes)
//     .groupBy(acoes.auditor)
//     .orderBy(asc(acoes.auditor))

const data = await db.select({ infracao: processos.infracao })
.from(processos)
.groupBy(processos.infracao)

console.log(data)