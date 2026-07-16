CREATE TYPE "public"."estado_pago" AS ENUM('PENDIENTE', 'PAGADO', 'ANULADO');--> statement-breakpoint
CREATE TYPE "public"."estado_reserva" AS ENUM('RESERVADO', 'SIN_STOCK');--> statement-breakpoint
CREATE TABLE "cuenta_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cuenta_id" varchar(50) NOT NULL,
	"insumo" varchar(100) NOT NULL,
	"cantidad" integer NOT NULL,
	"precio_unitario" integer NOT NULL,
	"subtotal" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cuentas_medicas" (
	"id" serial PRIMARY KEY NOT NULL,
	"cuenta_id" varchar(50) NOT NULL,
	"pedido_id" varchar(30) NOT NULL,
	"ficha_paciente" varchar(50),
	"pabellon" varchar(100) NOT NULL,
	"costo_total" integer NOT NULL,
	"estado_pago" "estado_pago" DEFAULT 'PENDIENTE' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "cuentas_medicas_cuenta_id_unique" UNIQUE("cuenta_id"),
	CONSTRAINT "cuentas_medicas_pedido_id_unique" UNIQUE("pedido_id")
);
--> statement-breakpoint
CREATE TABLE "items_pendientes" (
	"id" serial PRIMARY KEY NOT NULL,
	"pedido_id" varchar(30) NOT NULL,
	"insumo" varchar(100) NOT NULL,
	"cantidad" integer NOT NULL,
	"estado_reserva" "estado_reserva" NOT NULL,
	"seriales" jsonb,
	"total_items" integer NOT NULL,
	"pabellon" varchar(100) NOT NULL,
	"ficha_paciente" varchar(50),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "unico_pendiente_item" UNIQUE("pedido_id","insumo")
);
--> statement-breakpoint
CREATE TABLE "tarifas" (
	"insumo" varchar(100) PRIMARY KEY NOT NULL,
	"precio_unitario" integer NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "cuenta_items" ADD CONSTRAINT "cuenta_items_cuenta_id_cuentas_medicas_cuenta_id_fk" FOREIGN KEY ("cuenta_id") REFERENCES "public"."cuentas_medicas"("cuenta_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_cuenta_items_cuenta" ON "cuenta_items" USING btree ("cuenta_id");--> statement-breakpoint
CREATE INDEX "idx_pendientes_pedido" ON "items_pendientes" USING btree ("pedido_id");