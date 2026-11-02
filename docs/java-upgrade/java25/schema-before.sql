--
-- PostgreSQL database dump
--

\restrict u5NQe2rKOz40LkY9FGd6gyBW7Hy6kTI731VavKtJ7cBV2H4pf7q2sZOLzp4Viih

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg12+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg12+2)

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
-- Name: location_id_seq; Type: SEQUENCE; Schema: public; Owner: trixlog
--

CREATE SEQUENCE public.location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.location_id_seq OWNER TO trixlog;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: trixlog
--

CREATE TABLE public.locations (
    id integer NOT NULL,
    data_criacao timestamp without time zone,
    latitude real,
    longitude real,
    name character varying(255)
);


ALTER TABLE public.locations OWNER TO trixlog;

--
-- Name: tag_id_seq; Type: SEQUENCE; Schema: public; Owner: trixlog
--

CREATE SEQUENCE public.tag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tag_id_seq OWNER TO trixlog;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: trixlog
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    data_criacao timestamp without time zone,
    name character varying(255),
    location_id integer
);


ALTER TABLE public.tags OWNER TO trixlog;

--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: trixlog
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: trixlog
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tags fk_mjo7t1wavh6timugdcageiapb; Type: FK CONSTRAINT; Schema: public; Owner: trixlog
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT fk_mjo7t1wavh6timugdcageiapb FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- PostgreSQL database dump complete
--

\unrestrict u5NQe2rKOz40LkY9FGd6gyBW7Hy6kTI731VavKtJ7cBV2H4pf7q2sZOLzp4Viih

