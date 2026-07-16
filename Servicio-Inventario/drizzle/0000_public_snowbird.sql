CREATE TYPE "public"."estado_reserva" AS ENUM('RESERVADO', 'SIN_STOCK');--> statement-breakpoint
CREATE TYPE "public"."estado_unidad" AS ENUM('DISPONIBLE', 'RESERVADO', 'DESPACHADO');--> statement-breakpoint
CREATE TABLE "reservas" (
	"id" serial PRIMARY KEY NOT NULL,
	"pedido_id" varchar(30) NOT NULL,
	"insumo" varchar(100) NOT NULL,
	"cantidad" integer NOT NULL,
	"estado" "estado_reserva" NOT NULL,
	"seriales" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "unico_reserva_item" UNIQUE("pedido_id","insumo")
);
--> statement-breakpoint
CREATE TABLE "unidades_insumo" (
	"id" serial PRIMARY KEY NOT NULL,
	"serial" varchar(50) NOT NULL,
	"insumo" varchar(100) NOT NULL,
	"bodega_id" varchar(50) NOT NULL,
	"estado" "estado_unidad" DEFAULT 'DISPONIBLE' NOT NULL,
	"pedido_id" varchar(30),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unidades_insumo_serial_unique" UNIQUE("serial")
);
--> statement-breakpoint
CREATE INDEX "idx_unidades_insumo_estado" ON "unidades_insumo" USING btree ("insumo","estado");