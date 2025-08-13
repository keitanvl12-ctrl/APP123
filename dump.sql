--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.user_role AS ENUM (
    'solicitante',
    'atendente',
    'supervisor',
    'administrador'
);


ALTER TYPE public.user_role OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attachments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.attachments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    ticket_id character varying NOT NULL,
    file_name text NOT NULL,
    file_size integer NOT NULL,
    file_type text NOT NULL,
    file_path text NOT NULL,
    uploaded_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.attachments OWNER TO neondb_owner;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    description text,
    department_id character varying,
    sla_hours integer DEFAULT 24,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.comments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    ticket_id character varying NOT NULL,
    user_id character varying NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comments OWNER TO neondb_owner;

--
-- Name: custom_field_values; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.custom_field_values (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    ticket_id character varying NOT NULL,
    custom_field_id character varying NOT NULL,
    value text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_field_values OWNER TO neondb_owner;

--
-- Name: custom_fields; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.custom_fields (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    category_id character varying NOT NULL,
    department_id character varying NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'text'::text NOT NULL,
    required boolean DEFAULT false,
    placeholder text,
    options text[],
    "order" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_fields OWNER TO neondb_owner;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.departments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    is_requester boolean DEFAULT true NOT NULL,
    is_responsible boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.departments OWNER TO neondb_owner;

--
-- Name: pause_reasons; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pause_reasons (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    ticket_id character varying,
    reason text NOT NULL,
    paused_at timestamp without time zone DEFAULT now(),
    paused_by character varying,
    expected_return_at timestamp without time zone,
    resumed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pause_reasons OWNER TO neondb_owner;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.permissions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    role text NOT NULL,
    can_manage_users boolean DEFAULT false,
    can_view_all_tickets boolean DEFAULT false,
    can_view_department_tickets boolean DEFAULT false,
    can_manage_tickets boolean DEFAULT false,
    can_view_reports boolean DEFAULT false,
    can_manage_system boolean DEFAULT false,
    can_manage_categories boolean DEFAULT false,
    can_manage_departments boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.permissions OWNER TO neondb_owner;

--
-- Name: priority_config; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.priority_config (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    value text NOT NULL,
    color text DEFAULT '#6b7280'::text NOT NULL,
    sla_hours integer DEFAULT 24 NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.priority_config OWNER TO neondb_owner;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.role_permissions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    role_id character varying NOT NULL,
    permission_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO neondb_owner;

--
-- Name: sla_rules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sla_rules (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    department_id character varying,
    category text,
    priority text,
    response_time integer DEFAULT 24 NOT NULL,
    resolution_time integer DEFAULT 48 NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sla_rules OWNER TO neondb_owner;

--
-- Name: sla_tracking; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sla_tracking (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    ticket_id character varying,
    sla_rule_id character varying,
    started_at timestamp without time zone DEFAULT now(),
    paused_at timestamp without time zone,
    resumed_at timestamp without time zone,
    completed_at timestamp without time zone,
    total_paused_minutes integer DEFAULT 0,
    effective_minutes integer DEFAULT 0,
    status character varying DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sla_tracking OWNER TO neondb_owner;

--
-- Name: status_config; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.status_config (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    value text NOT NULL,
    color text DEFAULT '#6b7280'::text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.status_config OWNER TO neondb_owner;

--
-- Name: system_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_permissions (
    id character varying NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    category text NOT NULL,
    subcategory text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_permissions OWNER TO neondb_owner;

--
-- Name: system_roles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_roles (
    id character varying NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT 'bg-gray-100 text-gray-800'::text,
    is_system boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_roles OWNER TO neondb_owner;

--
-- Name: tickets; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tickets (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    ticket_number text NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    category text,
    tags text[],
    requester_name text,
    requester_email text,
    requester_phone text,
    form_data text,
    requester_department_id character varying,
    responsible_department_id character varying,
    created_by character varying NOT NULL,
    assigned_to character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    resolved_at timestamp without time zone,
    pause_reason text,
    paused_at timestamp without time zone
);


ALTER TABLE public.tickets OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'solicitante'::text NOT NULL,
    department_id character varying,
    is_active boolean DEFAULT true NOT NULL,
    is_blocked boolean DEFAULT false NOT NULL,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    role_id character varying
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.attachments (id, ticket_id, file_name, file_size, file_type, file_path, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories (id, name, description, department_id, sla_hours, is_active, created_at, updated_at) FROM stdin;
31e68b3a-3ab2-4c00-9e42-e0541811241b	Bug de Sistema	Problemas técnicos no sistema	6c9f0275-f1ef-4913-8e11-565e4c05d1f5	4	t	2025-08-12 18:36:31.021551	2025-08-12 18:36:31.021551
de68f34f-a898-4e69-ab53-a3788387657d	Nova Funcionalidade	Solicitação de nova funcionalidade	6c9f0275-f1ef-4913-8e11-565e4c05d1f5	48	t	2025-08-12 18:36:31.021551	2025-08-12 18:36:31.021551
0cf5d8fd-2aca-4fb1-9f00-8cf25534ae50	Suporte Técnico	Suporte técnico geral	6c9f0275-f1ef-4913-8e11-565e4c05d1f5	8	t	2025-08-12 18:36:31.021551	2025-08-12 18:36:31.021551
248e60ad-892b-4a8f-96e3-404122b103a3	Folha de Pagamento	Questões relacionadas à folha de pagamento	75dd38f0-cb10-4fb7-adcb-438101475977	24	t	2025-08-12 18:36:31.021551	2025-08-12 18:36:31.021551
925d7dd8-ae40-4c76-8c3d-214f9e9e572b	Benefícios	Questões sobre benefícios dos funcionários	75dd38f0-cb10-4fb7-adcb-438101475977	12	t	2025-08-12 18:36:31.021551	2025-08-12 18:36:31.021551
3c920715-330f-43db-80f1-3f0ddcaf1c8a	Contabilidade	Questões contábeis e fiscais	fe320d17-84c8-4c28-bc73-182c78d15a3a	24	t	2025-08-12 18:36:31.021551	2025-08-12 18:36:31.021551
2e91f634-38bd-4580-af55-0948a390e0a2	Contas a Pagar	Processamento de pagamentos	fe320d17-84c8-4c28-bc73-182c78d15a3a	12	t	2025-08-12 18:36:31.021551	2025-08-12 18:36:31.021551
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.comments (id, ticket_id, user_id, content, created_at) FROM stdin;
521ef68e-c957-4c66-887f-73dc35dfc7fa	92cf1682-490e-47aa-b890-a50615112701	4c44ccfc-aca0-474f-b589-4d823d203600	Teste após reinicialização	2025-08-12 19:22:47.770444
004650d5-a281-49df-8bb7-78b8facd9eb9	be99c791-cdec-40c8-ac5d-344e2f02913f	4c44ccfc-aca0-474f-b589-4d823d203600	TESTE	2025-08-12 19:29:08.540739
987e28f4-df9f-4e43-8099-12a304bd6ebc	8fc92248-e257-4635-a815-c9f2c4946a12	4c44ccfc-aca0-474f-b589-4d823d203600	TETE2	2025-08-12 19:29:21.77485
63e8cfb6-69e3-4e35-9e62-e4bc71a2a11d	e013826b-d0af-4eb2-9fa0-222621dd2754	4c44ccfc-aca0-474f-b589-4d823d203600	teste	2025-08-12 21:06:17.796826
\.


--
-- Data for Name: custom_field_values; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.custom_field_values (id, ticket_id, custom_field_id, value, created_at) FROM stdin;
2a1ca458-a444-484d-ab37-2465a1962c59	92cf1682-490e-47aa-b890-a50615112701	9c1ccc6b-7428-430b-9f40-d9a892ea4e5a	Servidor Principal - Sala TI	2025-08-12 19:40:38.354232
dd7fb117-6880-4472-9732-79eaad8e45e4	92cf1682-490e-47aa-b890-a50615112701	b00cda7b-e74f-43a2-9ddf-c67b8f889deb	Sistema de Gerenciamento Interno v2.1	2025-08-12 19:40:38.354232
0aab8bad-e620-4d83-8c89-b58b359109a3	1771a90a-28a6-48e1-997a-df0b359be051	672765f2-8539-4eb0-b5f8-97beae2a431c	te	2025-08-12 20:57:19.99
77222bed-97d2-415f-8f0c-a726f3301032	1771a90a-28a6-48e1-997a-df0b359be051	d2071829-f8f0-4c64-b9b9-7fa4b754fe1c	Cálculo incorreto	2025-08-12 20:57:20.018
1761fd62-c0aa-4e3e-8ddb-d90d6d04536d	4e9d1fc2-13e8-40d3-8056-71efa729c70e	9c1ccc6b-7428-430b-9f40-d9a892ea4e5a	teste	2025-08-12 23:15:43.165
0c291f5a-8bcd-4bfb-8b6e-1af3d78a76c0	4e9d1fc2-13e8-40d3-8056-71efa729c70e	b00cda7b-e74f-43a2-9ddf-c67b8f889deb	teste	2025-08-12 23:15:43.191
\.


--
-- Data for Name: custom_fields; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.custom_fields (id, category_id, department_id, name, type, required, placeholder, options, "order", is_active, created_at, updated_at) FROM stdin;
9c1ccc6b-7428-430b-9f40-d9a892ea4e5a	31e68b3a-3ab2-4c00-9e42-e0541811241b	6c9f0275-f1ef-4913-8e11-565e4c05d1f5	Equipamento Afetado	text	t	Ex: Computador 01, Impressora HP	\N	1	t	2025-08-12 19:39:58.353132	2025-08-12 19:39:58.353132
b00cda7b-e74f-43a2-9ddf-c67b8f889deb	31e68b3a-3ab2-4c00-9e42-e0541811241b	6c9f0275-f1ef-4913-8e11-565e4c05d1f5	Software/Sistema	text	f	Ex: Windows, Office, Sistema ERP	\N	2	t	2025-08-12 19:39:58.353132	2025-08-12 19:39:58.353132
52cc547e-1882-4200-9baa-64698fdfaf25	0cf5d8fd-2aca-4fb1-9f00-8cf25534ae50	6c9f0275-f1ef-4913-8e11-565e4c05d1f5	Local do Equipamento	text	t	Ex: Sala 201, Recepção	\N	2	t	2025-08-12 19:39:58.353132	2025-08-12 19:39:58.353132
672765f2-8539-4eb0-b5f8-97beae2a431c	248e60ad-892b-4a8f-96e3-404122b103a3	75dd38f0-cb10-4fb7-adcb-438101475977	Período da Folha	text	t	Ex: Maio/2024	\N	1	t	2025-08-12 19:39:58.353132	2025-08-12 19:39:58.353132
3308acee-4952-4eec-a154-af197a21d2f7	0cf5d8fd-2aca-4fb1-9f00-8cf25534ae50	6c9f0275-f1ef-4913-8e11-565e4c05d1f5	Tipo de Hardware	select	t		{Desktop,Notebook,Impressora,Monitor,Teclado/Mouse,Outros}	1	t	2025-08-12 19:39:58.353132	2025-08-12 19:39:58.353132
d2071829-f8f0-4c64-b9b9-7fa4b754fe1c	248e60ad-892b-4a8f-96e3-404122b103a3	75dd38f0-cb10-4fb7-adcb-438101475977	Tipo de Erro	select	t		{"Cálculo incorreto","Falta de lançamento","Problema no sistema",Outros}	2	t	2025-08-12 19:39:58.353132	2025-08-12 19:39:58.353132
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.departments (id, name, description, is_requester, is_responsible, created_at, updated_at) FROM stdin;
6c9f0275-f1ef-4913-8e11-565e4c05d1f5	TI	Departamento de Tecnologia da Informação	t	t	2025-08-12 18:36:30.902948	2025-08-12 18:36:30.902948
75dd38f0-cb10-4fb7-adcb-438101475977	RH	Recursos Humanos	t	t	2025-08-12 18:36:30.927274	2025-08-12 18:36:30.927274
fe320d17-84c8-4c28-bc73-182c78d15a3a	Financeiro	Departamento Financeiro	t	t	2025-08-12 18:36:30.972743	2025-08-12 18:36:30.972743
\.


--
-- Data for Name: pause_reasons; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pause_reasons (id, ticket_id, reason, paused_at, paused_by, expected_return_at, resumed_at, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.permissions (id, role, can_manage_users, can_view_all_tickets, can_view_department_tickets, can_manage_tickets, can_view_reports, can_manage_system, can_manage_categories, can_manage_departments, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: priority_config; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.priority_config (id, name, value, color, sla_hours, "order", is_active, is_default, created_at, updated_at) FROM stdin;
a9c2d287-f80a-43b5-8852-9dabd3f60931	Crítica	critical	#dc2626	4	1	t	f	2025-08-12 18:36:30.854008	2025-08-12 18:36:30.854008
2eb3bcd4-5866-47b0-b25a-54c7721340f8	Alta	high	#f59e0b	24	2	t	f	2025-08-12 18:36:30.854008	2025-08-12 18:36:30.854008
b88da404-6b50-4f2c-b48d-88f70b6998c9	Média	medium	#3b82f6	72	3	t	t	2025-08-12 18:36:30.854008	2025-08-12 18:36:30.854008
12900ba8-423b-419c-802f-32180b867c33	Baixa	low	#10b981	168	4	t	f	2025-08-12 18:36:30.854008	2025-08-12 18:36:30.854008
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.role_permissions (id, role_id, permission_id, created_at) FROM stdin;
12be7460-15dc-4c36-9007-50e7638a02e1	administrador	perm_users_view	2025-08-13 01:12:36.413621
a06addc4-de70-4c93-926f-b1b11defe866	supervisor	perm_users_view	2025-08-12 23:59:40.872041
64ee3785-cef7-4e56-82c6-87ad244bb5ed	supervisor	perm_tickets_create	2025-08-12 23:59:40.872041
d1a9af6f-da17-4025-8295-9b0ad7a6e8af	supervisor	perm_tickets_view_all	2025-08-12 23:59:40.872041
6dd58ee4-a1c1-420d-9907-28f3ae587284	supervisor	perm_tickets_view_department	2025-08-12 23:59:40.872041
14044a56-7bb8-415b-8394-355fcb086bbf	supervisor	perm_tickets_edit	2025-08-12 23:59:40.872041
393366cc-870c-4152-8d95-6887c0a4f9f5	supervisor	perm_tickets_assign	2025-08-12 23:59:40.872041
cb2001c2-b8dd-4491-aecb-afffbbfeeedb	supervisor	perm_reports_view	2025-08-12 23:59:40.872041
2ee94814-9428-4bea-99b0-df8e2849cbf3	atendente	perm_tickets_create	2025-08-12 23:59:40.872041
5f354b8a-ad71-4f2c-9c44-56babd01413d	atendente	perm_tickets_view_department	2025-08-12 23:59:40.872041
341511c9-2805-4b97-96e7-01eaade92b8d	atendente	perm_tickets_view_own	2025-08-12 23:59:40.872041
363b1bab-7930-420e-a9e0-9eace1d5b326	atendente	tickets_edit_own	2025-08-12 23:59:40.872041
77c2b84c-4b65-4876-837f-c365c83025a9	solicitante	perm_tickets_create	2025-08-12 23:59:40.872041
071c9b42-c767-45d6-8733-6faeaa01d354	solicitante	perm_tickets_view_own	2025-08-12 23:59:40.872041
065b09a7-145d-4b5e-8784-12c89932b891	administrador	perm_users_create	2025-08-13 01:12:36.447372
5fc98119-f4f0-48bf-907f-53457aff3f33	administrador	perm_users_edit	2025-08-13 01:12:36.471773
2666e7be-e5f9-4315-8764-f9477974d225	administrador	perm_users_delete	2025-08-13 01:12:36.495863
09e5e658-0fbc-4306-bd8b-69feff7e5694	administrador	users_manage_roles	2025-08-13 01:12:36.520768
f30059c4-237d-4596-91b0-9481de21648b	administrador	users_manage_departments	2025-08-13 01:12:36.545271
425eb85e-4cab-49e8-9858-648da3f830c8	administrador	perm_tickets_create	2025-08-13 01:12:36.569544
4985c6e2-38d3-430c-9cd6-cc4f5aa1f8fe	administrador	perm_tickets_view_all	2025-08-13 01:12:36.593735
e59a5229-f95d-422a-b205-6fceff5aa2be	administrador	tickets_delete	2025-08-13 01:12:36.621147
2cf5f8fa-bea6-46b9-b379-b2155692513d	administrador	perm_tickets_assign	2025-08-13 01:12:36.645441
07a889b8-41f5-4507-8a7d-29fd183474ab	administrador	tickets_change_status	2025-08-13 01:12:36.669729
955c8781-d932-4ed6-a36e-ea864a7c7789	administrador	tickets_change_priority	2025-08-13 01:12:36.693819
bf8ddf0f-c2d4-43f5-92fa-2bd6889c7c8b	administrador	tickets_add_comments	2025-08-13 01:12:36.721427
6359e79b-7017-4bd0-803f-35e44b543903	administrador	departments_view	2025-08-13 01:12:36.747211
8279843f-7618-4473-ace7-a73f73d14fa2	administrador	departments_create	2025-08-13 01:12:36.771643
12c3df3e-0748-46ce-9811-f1e5cedb37a3	administrador	departments_edit	2025-08-13 01:12:36.795973
aea30f50-5503-420d-8dd7-e22677916f37	administrador	departments_delete	2025-08-13 01:12:36.820268
fb4f1cab-734b-4364-b99a-4a6d613e1aba	administrador	departments_manage	2025-08-13 01:12:36.843428
d1969a46-136e-4785-b4b9-871483975c4b	administrador	reports_export	2025-08-13 01:12:36.867783
2364850d-31d7-4083-914d-861f9b21d8b1	administrador	system_manage_roles	2025-08-13 01:12:36.8955
3dc18c91-1370-4b38-8b54-7d43b42a8f4a	administrador	system_manage_sla	2025-08-13 01:12:36.919838
11fed487-752a-4547-8e4f-999a1dcb76c5	administrador	perm_tickets_view_department	2025-08-13 01:12:36.944291
\.


--
-- Data for Name: sla_rules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sla_rules (id, name, department_id, category, priority, response_time, resolution_time, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sla_tracking; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sla_tracking (id, ticket_id, sla_rule_id, started_at, paused_at, resumed_at, completed_at, total_paused_minutes, effective_minutes, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: status_config; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.status_config (id, name, value, color, "order", is_active, is_default, created_at, updated_at) FROM stdin;
fc35fb8e-a47a-4221-8f90-3ce62e0d09d7	A Fazer	open	#3b82f6	1	t	t	2025-08-12 18:36:30.211696	2025-08-12 18:36:30.211696
222d3354-d1fc-43e9-928e-8d21ee0e60f7	Atendendo	in_progress	#10b981	2	t	f	2025-08-12 18:36:30.211696	2025-08-12 18:36:30.211696
1f646d91-798b-41fb-9a7d-fe6d3922dc73	Pausado	on_hold	#f59e0b	3	t	f	2025-08-12 18:36:30.211696	2025-08-12 18:36:30.211696
5bdd3593-05db-4470-86aa-5f46ce1b6165	Resolvido	resolved	#6b7280	4	t	f	2025-08-12 18:36:30.211696	2025-08-12 18:36:30.211696
\.


--
-- Data for Name: system_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.system_permissions (id, code, name, description, category, subcategory, created_at) FROM stdin;
perm_users_view	users_view	Visualizar usuários	Permite visualizar lista de usuários	users	\N	2025-08-12 23:43:19.524254
perm_users_create	users_create	Criar usuários	Permite criar novos usuários	users	\N	2025-08-12 23:43:19.524254
perm_users_edit	users_edit	Editar usuários	Permite editar usuários existentes	users	\N	2025-08-12 23:43:19.524254
perm_users_delete	users_delete	Excluir usuários	Permite excluir usuários	users	\N	2025-08-12 23:43:19.524254
perm_tickets_view_all	tickets_view_all	Ver todos tickets	Acesso completo a todos os tickets	tickets	\N	2025-08-12 23:43:19.524254
perm_tickets_view_department	tickets_view_department	Ver tickets do departamento	Ver apenas tickets do próprio departamento	tickets	\N	2025-08-12 23:43:19.524254
perm_tickets_view_own	tickets_view_own	Ver próprios tickets	Ver apenas tickets próprios	tickets	\N	2025-08-12 23:43:19.524254
perm_tickets_create	tickets_create	Criar tickets	Permite criar novos tickets	tickets	\N	2025-08-12 23:43:19.524254
perm_tickets_edit	tickets_edit	Editar tickets	Permite editar tickets	tickets	\N	2025-08-12 23:43:19.524254
perm_tickets_assign	tickets_assign	Atribuir tickets	Permite atribuir tickets a usuários	tickets	\N	2025-08-12 23:43:19.524254
perm_reports_view	reports_view	Acessar relatórios	Permite visualizar relatórios do sistema	reports	\N	2025-08-12 23:43:19.524254
perm_system_admin	system_admin	Administração do sistema	Acesso completo ao sistema	system	\N	2025-08-12 23:43:19.524254
users_manage_roles	usuarios_gerenciar_funcoes	Gerenciar Funções de Usuários	Pode alterar funções e permissões de usuários	usuarios	manage	2025-08-12 23:53:12.542145
users_manage_departments	usuarios_gerenciar_departamentos	Gerenciar Departamentos de Usuários	Pode alterar departamentos dos usuários	usuarios	manage	2025-08-12 23:53:12.542145
tickets_view_own	tickets_ver_proprios	Ver Próprios Tickets	Pode visualizar apenas tickets criados por si	tickets	read	2025-08-12 23:53:12.542145
tickets_edit_own	tickets_editar_proprios	Editar Próprios Tickets	Pode editar apenas tickets criados por si	tickets	update	2025-08-12 23:53:12.542145
tickets_edit_department	tickets_editar_departamento	Editar Tickets do Departamento	Pode editar tickets do seu departamento	tickets	update	2025-08-12 23:53:12.542145
tickets_delete	tickets_deletar	Deletar Tickets	Pode remover tickets do sistema	tickets	delete	2025-08-12 23:53:12.542145
tickets_responsible	tickets_ser_responsavel	Ser Responsável por Tickets	Pode ser atribuído como responsável	tickets	manage	2025-08-12 23:53:12.542145
tickets_change_status	tickets_alterar_status	Alterar Status de Tickets	Pode mudar o status dos tickets	tickets	manage	2025-08-12 23:53:12.542145
tickets_change_priority	tickets_alterar_prioridade	Alterar Prioridade de Tickets	Pode mudar a prioridade dos tickets	tickets	manage	2025-08-12 23:53:12.542145
tickets_add_comments	tickets_adicionar_comentarios	Adicionar Comentários	Pode comentar em tickets	tickets	create	2025-08-12 23:53:12.542145
departments_view	departamentos_visualizar	Visualizar Departamentos	Pode ver lista de departamentos	departamentos	read	2025-08-12 23:53:12.542145
departments_create	departamentos_criar	Criar Departamentos	Pode criar novos departamentos	departamentos	create	2025-08-12 23:53:12.542145
departments_edit	departamentos_editar	Editar Departamentos	Pode editar informações de departamentos	departamentos	update	2025-08-12 23:53:12.542145
departments_delete	departamentos_deletar	Deletar Departamentos	Pode remover departamentos	departamentos	delete	2025-08-12 23:53:12.542145
departments_manage	departamentos_gerenciar	Gerenciar Departamentos	Pode administrar completamente departamentos	departamentos	manage	2025-08-12 23:53:12.542145
reports_basic	relatorios_basicos	Ver Relatórios Básicos	Pode ver relatórios básicos do sistema	relatorios	read	2025-08-12 23:53:12.542145
reports_department	relatorios_departamento	Ver Relatórios do Departamento	Pode ver relatórios do seu departamento	relatorios	read	2025-08-12 23:53:12.542145
reports_all	relatorios_todos	Ver Todos os Relatórios	Pode ver relatórios de todo sistema	relatorios	read	2025-08-12 23:53:12.542145
reports_export	relatorios_exportar	Exportar Relatórios	Pode exportar relatórios em diversos formatos	relatorios	manage	2025-08-12 23:53:12.542145
reports_custom	relatorios_personalizados	Criar Relatórios Personalizados	Pode criar relatórios customizados	relatorios	create	2025-08-12 23:53:12.542145
system_manage_roles	sistema_gerenciar_funcoes	Gerenciar Funções do Sistema	Pode criar e editar funções e permissões	sistema	manage	2025-08-12 23:53:12.542145
system_manage_settings	sistema_gerenciar_configuracoes	Gerenciar Configurações	Pode alterar configurações do sistema	sistema	manage	2025-08-12 23:53:12.542145
system_manage_sla	sistema_gerenciar_sla	Gerenciar SLA	Pode configurar regras de SLA	sistema	manage	2025-08-12 23:53:12.542145
system_view_logs	sistema_visualizar_logs	Visualizar Logs do Sistema	Pode acessar logs e auditoria	sistema	read	2025-08-12 23:53:12.542145
system_backup	sistema_backup_restauracao	Backup e Restauração	Pode fazer backup e restaurar dados	sistema	manage	2025-08-12 23:53:12.542145
\.


--
-- Data for Name: system_roles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.system_roles (id, name, description, color, is_system, created_at, updated_at) FROM stdin;
administrador	Administrador	Acesso completo ao sistema com todas as permissões	bg-purple-100 text-purple-800	t	2025-08-12 23:36:06.028764	2025-08-12 23:36:06.028764
supervisor	Supervisor	Gerencia equipes e tem acesso a relatórios departamentais	bg-blue-100 text-blue-800	t	2025-08-12 23:36:06.028764	2025-08-12 23:36:06.028764
atendente	Atendente	Pode responder tickets atribuídos e ver tickets do departamento	bg-yellow-100 text-yellow-800	t	2025-08-12 23:36:06.028764	2025-08-12 23:36:06.028764
solicitante	Solicitante	Pode apenas criar tickets e visualizar seus próprios	bg-green-100 text-green-800	t	2025-08-12 23:36:06.028764	2025-08-12 23:36:06.028764
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tickets (id, ticket_number, subject, description, status, priority, category, tags, requester_name, requester_email, requester_phone, form_data, requester_department_id, responsible_department_id, created_by, assigned_to, created_at, updated_at, resolved_at, pause_reason, paused_at) FROM stdin;
92cf1682-490e-47aa-b890-a50615112701	TICK-011	Teste para pausar ticket	Este ticket será usado para testar a funcionalidade de pausar.	open	medium	bug	\N	Administrador	admin@empresa.com		{"category":"bug","customFields":{},"originalRequestBody":{"subject":"Teste para pausar ticket","description":"Este ticket será usado para testar a funcionalidade de pausar.","priority":"medium","category":"bug","departmentId":null}}	\N	\N	4c44ccfc-aca0-474f-b589-4d823d203600	\N	2025-08-12 18:47:05.024493	2025-08-12 22:42:04.052	\N	Aguardando resposta do departamento de TI	2025-08-12 18:47:10
e7910303-7ab3-4f18-97ae-8ff2d8f5ec26	TICK-008	Dúvida sobre como usar o sistema	Preciso de ajuda para entender como atribuir tickets para outros usuários e como usar os filtros.	in_progress	low	support	\N	Administrador	admin@empresa.com		{"category":"support","customFields":{},"originalRequestBody":{"subject":"Dúvida sobre como usar o sistema","description":"Preciso de ajuda para entender como atribuir tickets para outros usuários e como usar os filtros.","priority":"low","category":"support","departmentId":null}}	\N	\N	4c44ccfc-aca0-474f-b589-4d823d203600	\N	2025-08-12 18:43:46.728085	2025-08-12 18:45:47.745	\N	\N	\N
8fc92248-e257-4635-a815-c9f2c4946a12	TICK-005	Problema de lentidão na página de relatórios	Os relatórios estão demorando mais de 30 segundos para carregar. Usuários relatam timeout.	resolved	critical	bug	\N	Administrador	admin@empresa.com		{"category":"bug","customFields":{},"originalRequestBody":{"subject":"Problema de lentidão na página de relatórios","description":"Os relatórios estão demorando mais de 30 segundos para carregar. Usuários relatam timeout.","priority":"critical","category":"bug","departmentId":null}}	\N	\N	4c44ccfc-aca0-474f-b589-4d823d203600	\N	2025-08-12 18:43:43.543129	2025-08-12 19:29:21.977	2025-08-12 19:29:21.977	\N	\N
26885f84-1d3a-4997-9952-e116e90fe0ad	TICK-009	Atualização de segurança necessária	Aplicar patches de segurança críticos no servidor de aplicação conforme recomendação da equipe de segurança.	open	critical	bug	\N	Administrador	admin@empresa.com		{"category":"bug","customFields":{},"originalRequestBody":{"subject":"Atualização de segurança necessária","description":"Aplicar patches de segurança críticos no servidor de aplicação conforme recomendação da equipe de segurança.","priority":"critical","category":"bug","departmentId":null}}	\N	\N	4c44ccfc-aca0-474f-b589-4d823d203600	\N	2025-08-12 18:43:47.129884	2025-08-12 22:42:06.565	\N	Dependência de terceiros - teste	2025-08-12 18:51:44.43
be99c791-cdec-40c8-ac5d-344e2f02913f	TICK-001	Sistema de backup não está funcionando	O backup automático falhou nas últimas 3 tentativas. Erro 500 no servidor de backup.	in_progress	high	bug	\N	Administrador	admin@empresa.com		{"category":"bug","customFields":{},"originalRequestBody":{"subject":"Sistema de backup não está funcionando","description":"O backup automático falhou nas últimas 3 tentativas. Erro 500 no servidor de backup.","priority":"high","category":"bug","departmentId":null}}	\N	\N	4c44ccfc-aca0-474f-b589-4d823d203600	\N	2025-08-12 18:43:40.181359	2025-08-12 22:42:08.932	2025-08-12 19:29:08.75	\N	\N
1771a90a-28a6-48e1-997a-df0b359be051	TICK-015	te34444	ttt	on_hold	medium	248e60ad-892b-4a8f-96e3-404122b103a3	\N	Administrador	admin@empresa.com	tttt	{"phone":"tttt","requesterDepartment":"","responsibleDepartment":"75dd38f0-cb10-4fb7-adcb-438101475977","category":"248e60ad-892b-4a8f-96e3-404122b103a3","customFields":{"672765f2-8539-4eb0-b5f8-97beae2a431c":"te","d2071829-f8f0-4c64-b9b9-7fa4b754fe1c":"Cálculo incorreto"},"originalRequestBody":{"subject":"te34444","requesterName":"","requesterEmail":"","requesterPhone":"tttt","requesterDepartment":"","responsibleDepartment":"75dd38f0-cb10-4fb7-adcb-438101475977","category":"248e60ad-892b-4a8f-96e3-404122b103a3","priority":"Média","description":"ttt","attachments":[],"customFields":{"672765f2-8539-4eb0-b5f8-97beae2a431c":"te","d2071829-f8f0-4c64-b9b9-7fa4b754fe1c":"Cálculo incorreto"}}}	\N	75dd38f0-cb10-4fb7-adcb-438101475977	4c44ccfc-aca0-474f-b589-4d823d203600	\N	2025-08-12 20:57:19.973382	2025-08-12 21:06:06.033	\N	Aguardando resposta do cliente	2025-08-12 21:06:05.061
e013826b-d0af-4eb2-9fa0-222621dd2754	TICK-013	teste1234	teste	resolved	medium	31e68b3a-3ab2-4c00-9e42-e0541811241b	\N	Administrador	admin@empresa.com	teste	{"phone":"teste","requesterDepartment":"","responsibleDepartment":"6c9f0275-f1ef-4913-8e11-565e4c05d1f5","category":"31e68b3a-3ab2-4c00-9e42-e0541811241b","customFields":{"9c1ccc6b-7428-430b-9f40-d9a892ea4e5a":"teste","b00cda7b-e74f-43a2-9ddf-c67b8f889deb":"teste"},"originalRequestBody":{"subject":"teste1234","requesterName":"","requesterEmail":"","requesterPhone":"teste","requesterDepartment":"","responsibleDepartment":"6c9f0275-f1ef-4913-8e11-565e4c05d1f5","category":"31e68b3a-3ab2-4c00-9e42-e0541811241b","priority":"Média","description":"teste","attachments":[],"customFields":{"9c1ccc6b-7428-430b-9f40-d9a892ea4e5a":"teste","b00cda7b-e74f-43a2-9ddf-c67b8f889deb":"teste"}}}	\N	6c9f0275-f1ef-4913-8e11-565e4c05d1f5	4c44ccfc-aca0-474f-b589-4d823d203600	\N	2025-08-12 20:53:26.272061	2025-08-12 21:06:18.013	2025-08-12 21:06:18.013	\N	\N
4e9d1fc2-13e8-40d3-8056-71efa729c70e	TICK-016	test123	testet	on_hold	medium	31e68b3a-3ab2-4c00-9e42-e0541811241b	\N	Felipe Lacerda	felipe.lacerda@grupoopus.com	r4331312	{"phone":"r4331312","requesterDepartment":"","responsibleDepartment":"6c9f0275-f1ef-4913-8e11-565e4c05d1f5","category":"31e68b3a-3ab2-4c00-9e42-e0541811241b","customFields":{"9c1ccc6b-7428-430b-9f40-d9a892ea4e5a":"teste","b00cda7b-e74f-43a2-9ddf-c67b8f889deb":"teste"},"originalRequestBody":{"subject":"test123","requesterName":"","requesterEmail":"","requesterPhone":"r4331312","requesterDepartment":"","responsibleDepartment":"6c9f0275-f1ef-4913-8e11-565e4c05d1f5","category":"31e68b3a-3ab2-4c00-9e42-e0541811241b","priority":"Média","description":"testet","attachments":[],"customFields":{"9c1ccc6b-7428-430b-9f40-d9a892ea4e5a":"teste","b00cda7b-e74f-43a2-9ddf-c67b8f889deb":"teste"}}}	6c9f0275-f1ef-4913-8e11-565e4c05d1f5	6c9f0275-f1ef-4913-8e11-565e4c05d1f5	ecbc2711-b99a-4053-90da-3eecd6448786	\N	2025-08-12 23:15:43.108607	2025-08-12 23:15:50.129	\N	Aguardando aprovação - teste	2025-08-12 23:15:49.096
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, name, email, role, department_id, is_active, is_blocked, last_login_at, created_at, updated_at, role_id) FROM stdin;
bc1cd0c3-c7b4-4079-a315-52b41d0f3f13	maria.santos	senha123	Maria Santos	maria.santos@empresa.com	supervisor	\N	t	f	\N	2025-08-12 18:36:30.829405	2025-08-12 18:36:30.829405	8ea23e68-cf41-449c-b07f-de1bb404276a
873d224a-d764-452c-b1b2-08c38f3f52f1	ana.costa	senha123	Ana Costa	ana.costa@empresa.com	atendente	\N	t	f	\N	2025-08-12 18:36:30.879114	2025-08-12 18:36:30.879114	a599f7f3-adbf-4c1d-b351-67b310620e94
ecbc2711-b99a-4053-90da-3eecd6448786	felipe.lacerda	$2b$10$uXqxSeZ6ZyQDsy9vRSr2X.fMNWwuaCzszXEeV.djKQEd5ngEEIW1G	Felipe Lacerda	felipe.lacerda@grupoopus.com	admin	6c9f0275-f1ef-4913-8e11-565e4c05d1f5	t	f	\N	2025-08-12 22:36:03.361084	2025-08-12 22:36:03.361084	\N
9e59d94b-66cc-4436-9ea4-062c447ed4b9	carlos.oliveira	$2b$10$HhjLWOy9.enbdRcR9sYjauouYc/4gWutkhlaHt94aX2oKvYn1a/mK	Carlos Oliveira	carlos.oliveira@empresa.com	solicitante	\N	t	f	2025-08-12 22:36:41.981	2025-08-12 18:36:30.854398	2025-08-12 22:36:41.981	aac701be-2fec-4e65-b4fd-69624bb23452
4c44ccfc-aca0-474f-b589-4d823d203600	admin	$2b$10$34gJE5cqbqGKIXOODMd7jeW9MmA.TItafLmzXxnvUGGj9GGXDsa8G	Administrador	admin@empresa.com	admin	\N	t	f	2025-08-13 01:12:07.312	2025-08-12 18:36:30.220838	2025-08-13 01:12:07.312	be27940c-aa55-4f70-8868-581d4f0ba8b3
\.


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: custom_field_values custom_field_values_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT custom_field_values_pkey PRIMARY KEY (id);


--
-- Name: custom_fields custom_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_fields
    ADD CONSTRAINT custom_fields_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_unique UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: pause_reasons pause_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pause_reasons
    ADD CONSTRAINT pause_reasons_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: priority_config priority_config_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.priority_config
    ADD CONSTRAINT priority_config_name_unique UNIQUE (name);


--
-- Name: priority_config priority_config_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.priority_config
    ADD CONSTRAINT priority_config_pkey PRIMARY KEY (id);


--
-- Name: priority_config priority_config_value_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.priority_config
    ADD CONSTRAINT priority_config_value_unique UNIQUE (value);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: sla_rules sla_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sla_rules
    ADD CONSTRAINT sla_rules_pkey PRIMARY KEY (id);


--
-- Name: sla_tracking sla_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sla_tracking
    ADD CONSTRAINT sla_tracking_pkey PRIMARY KEY (id);


--
-- Name: status_config status_config_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.status_config
    ADD CONSTRAINT status_config_name_unique UNIQUE (name);


--
-- Name: status_config status_config_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.status_config
    ADD CONSTRAINT status_config_pkey PRIMARY KEY (id);


--
-- Name: status_config status_config_value_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.status_config
    ADD CONSTRAINT status_config_value_unique UNIQUE (value);


--
-- Name: system_permissions system_permissions_code_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_permissions
    ADD CONSTRAINT system_permissions_code_key UNIQUE (code);


--
-- Name: system_permissions system_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_permissions
    ADD CONSTRAINT system_permissions_pkey PRIMARY KEY (id);


--
-- Name: system_roles system_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_roles
    ADD CONSTRAINT system_roles_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_ticket_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_ticket_number_unique UNIQUE (ticket_number);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: attachments attachments_ticket_id_tickets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_ticket_id_tickets_id_fk FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: attachments attachments_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: categories categories_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: comments comments_ticket_id_tickets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_ticket_id_tickets_id_fk FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: comments comments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: custom_field_values custom_field_values_custom_field_id_custom_fields_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT custom_field_values_custom_field_id_custom_fields_id_fk FOREIGN KEY (custom_field_id) REFERENCES public.custom_fields(id);


--
-- Name: custom_field_values custom_field_values_ticket_id_tickets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT custom_field_values_ticket_id_tickets_id_fk FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: custom_fields custom_fields_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_fields
    ADD CONSTRAINT custom_fields_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: custom_fields custom_fields_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_fields
    ADD CONSTRAINT custom_fields_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: pause_reasons pause_reasons_paused_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pause_reasons
    ADD CONSTRAINT pause_reasons_paused_by_users_id_fk FOREIGN KEY (paused_by) REFERENCES public.users(id);


--
-- Name: pause_reasons pause_reasons_ticket_id_tickets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pause_reasons
    ADD CONSTRAINT pause_reasons_ticket_id_tickets_id_fk FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.system_permissions(id);


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.system_roles(id);


--
-- Name: sla_rules sla_rules_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sla_rules
    ADD CONSTRAINT sla_rules_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: sla_tracking sla_tracking_sla_rule_id_sla_rules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sla_tracking
    ADD CONSTRAINT sla_tracking_sla_rule_id_sla_rules_id_fk FOREIGN KEY (sla_rule_id) REFERENCES public.sla_rules(id);


--
-- Name: sla_tracking sla_tracking_ticket_id_tickets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sla_tracking
    ADD CONSTRAINT sla_tracking_ticket_id_tickets_id_fk FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: tickets tickets_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: tickets tickets_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: tickets tickets_requester_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_requester_department_id_departments_id_fk FOREIGN KEY (requester_department_id) REFERENCES public.departments(id);


--
-- Name: tickets tickets_responsible_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_responsible_department_id_departments_id_fk FOREIGN KEY (responsible_department_id) REFERENCES public.departments(id);


--
-- Name: users users_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

