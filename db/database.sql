create database pxldb;
\c pxldb

create user secadv with password 'ilovesecurity';
grant all privileges on database pxldb to secadv;
BEGIN;

create table users (id serial primary key, user_name text not null unique, password text not null);
create extension pgcrypto;
grant all privileges on table users to secadv;

-- Hash the passwords before inserting
INSERT INTO users (user_name, password) VALUES ('pxl-admin', crypt('insecureandlovinit', gen_salt('bf')));
INSERT INTO users (user_name, password) VALUES ('george', crypt('iwishihadbetteradmins', gen_salt('bf')));

COMMIT; 