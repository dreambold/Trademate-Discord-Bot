# Trademate Website

Trademate bot + the Discord bot.

- Backend and bot code is in `tm-backend/` (TypeScript)
- Bot frontend and dashboard is in `tm-frontend/` (VueJS)
- Database is PostgreSQL, used with Sequelize
- Integrations with third-party APIs: Discord, Stripe, SMTP, PostgreSQL

## Installation

### Production

- Install NodeJS v14
- Build project: `make`
- Copy `.env.example` to `.env`, fill it in (keys correspond to the `Config` interface in `tm-backend/interfaces.d.ts`)
- Run database migrations: `./cli.js db:migrate`
- Start the backend & bot: `./cli.js start`

### Development

- Same steps as for production
- To rebuild the backend only: `make backend`
- To rebuild & watch the frontend: `cd tm-frontend; npm run serve`

## Notes

Logging is done with `bunyan`. It will always output JSON. To pretty-print it when developping, pipe the program output to `bunyan -o short`. Example: `./cli.js start | bunyan -o short`

The software will automatically serve the frontend files, only in their compiled form from `tm-frontend/dist/`.

There are separate `WEB_BASE_URI` and `API_BASE_URI` env variables: when program locally VueJS will serve the front-end on a different port, but it needs to know where the API runs at (and vice versa). In production, `WEB_BASE_URI` and `API_BASE_URI` will be identical.
