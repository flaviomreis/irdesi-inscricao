# Local dev database

## Database and user creation

```sh
sudo -u postgre psql
create database dev_database;
alter database dev_database owner to dev_user;
create user dev_user with encrypted password 'dev_password';
grant all privileges on database dev_database to dev_user;

```

    font: (https://medium.com/coding-blocks/creating-user-database-and-adding-access-on-postgresql-8bfcd2f4a91e)

## Service authorization

    Replace `peer` by `md5` in `pg_hba.conf` file:

```conf
local   all             all                                     peer
```
