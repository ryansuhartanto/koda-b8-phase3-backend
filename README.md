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

## Assumptions

### Anonymous shortening

`POST /urls` works without a token. Anonymous links are stored with `owner NULL`: they
never appear in `GET /urls` and cannot be edited or deleted, since every management route
filters by `owner`. There is no claim flow. Custom paths require an account (401).

### Codes are addresses, not rows

There is no `code` column. The row id is enciphered by a 50-bit Feistel network (8 rounds,
SipHash-1-3 round function, round keys from `LINK_KEY` via HKDF) and rendered as 10
Crockford's Base32 characters. Bijective, so a code decodes back to an id: no lookup
table, no collision retry, no enumerable sequential ids. Rekeying would repoint every
issued code, so `src/services/urls.js` pins a fingerprint of the key in `UrlConfigs` on
boot and refuses to start if it changes.

### Dedup by `urlHash`, per owner

Shortening the same url twice returns the existing row. Sameness is `sha256` of the url
after RFC 3986 6.2.2 syntax-based normalization (`src/lib/uri.js`). Being syntactic,
`?a=1&b=2` and `?b=2&a=1` differ. The bucket is `(urlHash, owner)`, anonymous included, so
two accounts shortening one link get separate codes.

### Delete by code

`DELETE /urls/{code}` takes the public code. `locate()` decodes it: a valid generated code
resolves to an id, anything else matches a custom path. The `WHERE` always carries
`owner`, and missing and not-yours both answer 404.

### Slug constraints

| Constraint          | Discharged by                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| QR-friendly charset | `ALLOWED` in `src/lib/custom.js`                                                                   |
| Crockford leniency  | `decode()` folds hyphens, case, `O`→`0`, `I`/`L`→`1`                                               |
| Reserved paths      | the `reserved` array on `POST`/`PATCH /urls`, matched case-insensitively against the first segment |
| Not code-shaped     | `reject()` runs `decode()` and refuses anything that parses as a generated code                    |

The charset is QR alphanumeric mode minus space, plus `a-z`, so a lowercase custom path
pushes its QR into byte mode.

Reserved paths are per request, not hardcoded: the API does not know which routes the
frontend in front of it owns. The shipped frontend sends no list, so nothing is reserved
today.

## License

[MIT](LICENSE)
