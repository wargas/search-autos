-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "acoes" (
	"protocolo" varchar PRIMARY KEY,
	"identificacao" varchar,
	"nome" varchar,
	"dataCriacao" varchar,
	"tipo" varchar,
	"auditor" varchar,
	"encerramento" text,
	"equipe_id" text,
	"chave" text
);
--> statement-breakpoint
CREATE TABLE "equipes" (
	"id" varchar PRIMARY KEY,
	"last_updated_time" integer,
	"html" text
);
--> statement-breakpoint
CREATE TABLE "processos" (
	"protocolo" varchar PRIMARY KEY,
	"acao_protocolo" varchar,
	"descricao" text,
	"especie" varchar,
	"natureza" varchar,
	"infracao" varchar,
	"descricao_text" text,
	"chave" text,
	"cnpj" varchar,
	"dataLavratura" varchar,
	"situacao" varchar
);

*/