# ShortLink API

Express 5 REST API for the ShortLink URL shortener. Postgres via Sequelize 7, JWT auth,
short codes derived with SipHash.

## Setup

```sh
bun install
cp .env.example .env
# fill PGPASSWORD/PGDATABASE, and paste `openssl rand -hex 32` into JWT_SECRET and LINK_KEY
bun run db -- migration run
bun run dev
```

Listens on `API_PORT` (default 3001).

### Environment

| Variable     | Purpose                               |
| ------------ | ------------------------------------- |
| `API_PORT`   | Port to listen on                     |
| `PG*`        | Postgres connection                   |
| `JWT_SECRET` | Signing key for auth tokens           |
| `LINK_KEY`   | SipHash key for short-code generation |

## Scripts

| Script                         | Does                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `bun run dev`                  | Bundle in watch mode and restart the server on success                                 |
| `bun run build`                | Bundle to `dist/index.mjs`                                                             |
| `bun run test`                 | Run tests                                                                              |
| `bun run db`                   | [sqlumz](https://www.npmjs.com/package/sqlumz) CLI, e.g. `bun run db -- migration run` |
| `bun run docs`                 | Regenerate `src/docs/openapi.json` from JSDoc annotations                              |
| `bun run lint` / `bun run fmt` | oxlint (type-aware) / oxfmt                                                            |

## API

Bearer JWT in `Authorization` where required. Bodies accept both `application/json` and
`application/x-www-form-urlencoded`. Every response is `{ success, message, result }`;
failures carry `success: false` and may include per-field errors.

| Method   | Path             | Auth     | Purpose                                                        |
| -------- | ---------------- | -------- | -------------------------------------------------------------- |
| `POST`   | `/auth/register` | none     | Register with `email` + `password`                             |
| `POST`   | `/auth/login`    | none     | Authenticate, returns a JWT                                    |
| `POST`   | `/urls`          | optional | Shorten a url. Anonymous works; with a token the link is owned |
| `GET`    | `/urls`          | required | List owned links, paged (`page`, `limit`, `q`)                 |
| `GET`    | `/urls/{code}`   | none     | Resolve a short code to its target                             |
| `PATCH`  | `/urls/{code}`   | required | Repoint the link at a new url                                  |
| `DELETE` | `/urls/{code}`   | required | Delete the link                                                |

`POST /urls` takes `url`, an optional `custom` code, and an optional `reserved` array of
paths the calling frontend already uses so generated codes never collide with its routes.

The full OpenAPI document lives at `src/docs/openapi.json` and is served as a
[Scalar](https://scalar.com) reference by the running API.

`.http` holds a few ready-made requests for REST-client extensions.

## License

[MIT](LICENSE)
