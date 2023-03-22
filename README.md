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
# create db using the created user and grant privileges
$ psql postgres -U user
$ CREATE DATABSE db;
$ GRANT CONNECT ON DATABASE db TO user;
$ GRANT ALL PRIVILEGES ON DATABASE db TO user;

# Sequelize

# Initialize sequelize project
$ sequelize init
# create models and migrations with sequelize-cli
$ sequelize model:generate --name ModelName --attributes name:string,username:string,password:string
```
