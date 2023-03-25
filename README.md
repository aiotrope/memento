# memento

FSO Part 13

Date: 22.03.2023

---

## CLI commands used

```bash
# Postgres
$ psql -U postgres

$ \du+ # list users

$ \l # list db's

$ \! clear # clear screen

# create user with login password
$ CREATE USER user WITH PASSWORD 'password';

# give role attributes to user to create DB
$ ALTER ROLE user CREATEDB;

# create db using the created user with role and grant privileges
$ psql postgres -U user
$ CREATE DATABSE db;
$ GRANT CONNECT ON DATABASE db TO user;
$ GRANT ALL PRIVILEGES ON DATABASE db TO user;

# create db and user with some privileges using postgres user 
$ psql -U postgres
$ CREATE USER user WITH PASSWORD 'password';
$ CREATE DATABASE db OWNER user;
$ GRANT CONNECT ON DATABASE db TO user;
$ GRANT ALL PRIVILEGES ON DATABASE db TO user;

# connect to db using user other than postgres
$ psql postgres -U user
$ \c dbname OR \conninfo dbname
$ \dt+ # show all tables in the current schema

# query db
$ psql -U postgres dbname
$ \dt
$ DROP TABLE "table_name"; # drop table on the current schema

# list tables of all schema
$ \dt *.*

# drop database outside the psql shell
$ dropdb dbname

# drop user
$ DROP OWNED BY user;
$ DROP USER user;

# display table data
$ \c dbname
$ Table "tablename";

# delete a row with condition
$ \c dbname
$ DELETE FROM "Blogs" WHERE id = 1;

# Sequelize

# generate/initialize db config dirs based on .sequilizerc using globally installed sequelize-cli
$ sequelize init

# create models and migrations with sequelize-cli
$ sequelize model:generate --name ModelName --attributes name:string,username:string,password:string

# migration to create db table
$ sequelize db:migrate

# App

# generate express app
$ express --view=ejs backend

# generate react app
$ yarn create react-app frontend .

# run backend dev server at port:8080
$ yarn run dev

# run production build at port:8080
$ yarn start

# run frontend dev server at port:3000
$ cd frontend && yarn run start

# build static assets (frontend)
$ yarn build

# format code
$ yarn prettier

# lint code
$ yarn eslint

```
