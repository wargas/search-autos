import { pgTable, varchar, integer, text, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const acoes = pgTable("acoes", {
	protocolo: varchar().primaryKey(),
	identificacao: varchar(),
	nome: varchar(),
	dataCriacao: varchar(),
	tipo: varchar(),
	auditor: varchar(),
	encerramento: text(),
	equipeId: text("equipe_id"),
	chave: text(),
});

export const equipes = pgTable("equipes", {
	id: varchar().primaryKey(),
	lastUpdatedTime: integer("last_updated_time"),
	html: text(),
});

export const processos = pgTable("processos", {
	protocolo: varchar().primaryKey(),
	acaoProtocolo: varchar("acao_protocolo"),
	descricao: text(),
	especie: varchar(),
	natureza: varchar(),
	infracao: varchar(),
	descricaoText: text("descricao_text"),
	chave: text(),
	cnpj: varchar(),
	dataLavratura: varchar(),
	situacao: varchar(),
});
