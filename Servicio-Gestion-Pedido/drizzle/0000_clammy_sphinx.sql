CREATE TYPE "public"."estado_item" AS ENUM('PENDIENTE', 'RESERVADO', 'SIN_STOCK', 'FACTURADO');--> statement-breakpoint
CREATE TYPE "public"."estado_pedido" AS ENUM('RECIBIDO', 'BUSCANDO_STOCK', 'RESERVADO', 'PARCIAL', 'SIN_STOCK', 'COMPLETADO');--> statement-breakpoint
CREATE TABLE "historial_estados" (
	"id" serial PRIMARY KEY NOT NULL,
	"pedido_id" varchar(30) NOT NULL,
	"estado" varchar(30) NOT NULL,
	"detalle" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pedido_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"pedido_id" varchar(30) NOT NULL,
	"insumo" varchar(100) NOT NULL,
	"cantidad" integer NOT NULL,
	"estado" "estado_item" DEFAULT 'PENDIENTE' NOT NULL,
	"costo_subtotal" integer,
	CONSTRAINT "unico_pedido_insumo" UNIQUE("pedido_id","insumo")
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"nombre_enfermero" varchar(100) NOT NULL,
	"pabellon" varchar(100) NOT NULL,
	"ficha_paciente" varchar(50),
	"estado" "estado_pedido" DEFAULT 'RECIBIDO' NOT NULL,
	"costo_total" integer,
	"cuenta_id" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_historial_pedido" ON "historial_estados" USING btree ("pedido_id");--> statement-breakpoint
CREATE INDEX "idx_items_pedido_id" ON "pedido_items" USING btree ("pedido_id");