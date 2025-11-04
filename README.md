# Tasks API

Run the API and database, then open the documentation.

## Requirements

* Docker
* Docker Compose

## Start with Docker

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Start the development server through docker-compose:

   ```bash
   bun run dev
   ```

## Start Locally (Without Docker)

1. Copy and modify the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Start the development server:

   ```bash
   bun run dev
   ```

4. Apply migrations:

  ``` bash
  bun run migrate
  ```