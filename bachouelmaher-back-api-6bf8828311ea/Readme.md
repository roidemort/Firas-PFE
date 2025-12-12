## Setup

1. Clone the repository: `back-api`
2. `cd back-api`
3. Copy the `.env.example` file to `.env` and update the necessary variables: `cp .env.example .env`
4. Install the dependencies: `npm install` or `npm`
5. Run the migrations: `npm run typeorm`
6. Boot the server: `npm dev`
7. Access the REST api on the url `http://localhost:3000` or the port you specified in `.env`

## Tools and Technologies Used
- NodeJS
- TypeScript
- MySQL
- TypeORM
- Class Validator
- JWT

## Available scripts

- `typeorm`: Runs the TypeORM CLI with the `data-source.ts` file.
- `migration:show`: Shows all the executed migrations.
- `migration:create`: Creates a new migration. You need to provide a name for the migration. Example: `yarn migration:create create_users_table`.
- `migration:run`: Runs all pending migrations.
- `migration:revert`: Reverts the last executed migration.