# TCG Server - One Piece TCG Detection Extension Backend Service

## Overview

This is an **Extension Backend Service (EBS)** for a Twitch extension that provides **Real-Time One Piece Trading Card Game Detection**. The extension allows live Twitch viewers to click on cards they see on screen and opens an overlay displaying detailed card information.

### Key Features

- Complete database of 3,200+ One Piece TCG cards
- Advanced search and filtering capabilities
- Pagination support for efficient data retrieval
- OpenAPI documentation
- Type-safe API with Zod validation

---

## Tech Stack

| Category      | Technology                              |
| ------------- | --------------------------------------- |
| Runtime       | [Bun](https://bun.sh)                   |
| Framework     | [Elysia.js](https://elysiajs.com) v1.4  |
| Database      | PostgreSQL 17                           |
| ORM           | [Drizzle ORM](https://orm.drizzle.team) |
| Validation    | [Zod](https://zod.dev)                  |
| Documentation | OpenAPI/Swagger                         |
| Testing       | Bun:test + Elysia Eden                  |
| Language      | TypeScript                              |

---

## Project Structure

```
tcg-server/
├── src/
│   ├── index.ts              # Application entry point
│   ├── db/
│   │   ├── index.ts          # Database client initialization
│   │   ├── schema.ts         # Drizzle ORM schema definitions
│   │   └── migrations/       # Auto-generated migrations
│   ├── routers/
│   │   ├── index.ts          # Router composition
│   │   └── cards/
│   │       ├── router.ts     # Route definitions
│   │       ├── handler.ts    # Business logic controller
│   │       └── validators.ts # Request validation schemas
│   ├── types/
│   │   ├── card.ts           # Card types and enums
│   │   └── index.ts          # Type exports
│   └── utils/
│       └── pagination.ts     # Pagination helpers
├── scripts/
│   ├── fetch-cards.ts        # External API card fetching
│   └── seed.ts               # Database seeding
├── tests/
│   └── index.test.ts         # API test suite
├── data/
│   ├── all-cards.json        # Complete card dataset
│   └── pages/                # Paginated card data (32 pages)
├── docker-compose.yml        # Docker services
├── drizzle.config.ts         # Drizzle configuration
└── package.json
```

---

## API Endpoints

### Base URL: `http://localhost:3000`

### Welcome

```http
GET /welcome
```

Returns a welcome message.

### List Cards

```http
GET /api/cards
```

**Query Parameters:**

| Parameter | Type   | Default | Description                                                              |
| --------- | ------ | ------- | ------------------------------------------------------------------------ |
| `page`    | number | 1       | Current page                                                             |
| `limit`   | number | 20      | Items per page (max: 100)                                                |
| `name`    | string | -       | Filter by card name (case-insensitive)                                   |
| `type`    | string | -       | Filter by type: `LEADER`, `CHARACTER`, `EVENT`, `STAGE`                  |
| `color`   | string | -       | Filter by card color                                                     |
| `rarity`  | string | -       | Filter by rarity: `L`, `C`, `UC`, `R`, `SR`, `SEC`, `SP CARD`, `P`, `TR` |

**Response:**

```json
{
  "page": 1,
  "limit": 20,
  "total": 3200,
  "totalPages": 160,
  "data": [...]
}
```

### Get Card by ID

```http
GET /api/cards/:id
```

**Response:** Card object or 404 if not found.

---

## Database Schema

### Sets Table

| Column | Type         | Constraints                 |
| ------ | ------------ | --------------------------- |
| id     | integer      | PRIMARY KEY, auto-increment |
| name   | varchar(255) | UNIQUE, NOT NULL            |

### Cards Table

| Column    | Type         | Description                     |
| --------- | ------------ | ------------------------------- |
| id        | varchar(50)  | PRIMARY KEY                     |
| code      | varchar(50)  | Card code identifier            |
| rarity    | varchar(20)  | Rarity level                    |
| type      | enum         | LEADER, CHARACTER, EVENT, STAGE |
| name      | varchar(255) | Card name                       |
| images    | jsonb        | `{ small: url, large: url }`    |
| cost      | integer      | Play cost                       |
| attribute | jsonb        | `{ name: string, image: url }`  |
| power     | integer      | Card power                      |
| counter   | varchar(10)  | Counter value                   |
| color     | varchar(50)  | Card color                      |
| family    | varchar(500) | Card family/tribe               |
| ability   | text         | Ability description             |
| trigger   | text         | Trigger effect                  |
| set_id    | integer      | FK to sets.id                   |
| notes     | jsonb        | Array of notes                  |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- [Docker](https://www.docker.com/) (for PostgreSQL)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tcg-server
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:

   ```env
   DATABASE_URL=postgres://tcg:tcg_password@localhost:5432/tcg_onepiece
   TCG_API_KEY=your_api_key_here
   TWITCH_EXTENSION_SECRET_KEY=your_extension_secret
   ```

4. **Start the database**

   ```bash
   docker-compose up -d
   ```

5. **Run migrations**

   ```bash
   bun run db:migrate
   ```

6. **Seed the database**

   ```bash
   bun run seed
   ```

7. **Start the server**
   ```bash
   bun run dev
   ```

The server will be available at `http://localhost:3000`.

---

## Development Commands

| Command               | Description                      |
| --------------------- | -------------------------------- |
| `bun run dev`         | Start dev server with hot reload |
| `bun run db:generate` | Generate migration files         |
| `bun run db:migrate`  | Run migrations                   |
| `bun run db:push`     | Push schema to database          |
| `bun run db:studio`   | Open Drizzle Studio GUI          |
| `bun run fetch-cards` | Fetch cards from external API    |
| `bun run seed`        | Seed database with cards         |
| `bun run test`        | Run test suite                   |

## Card Data

### Types

- `LEADER` - Leader cards
- `CHARACTER` - Character cards
- `EVENT` - Event cards
- `STAGE` - Stage cards

### Rarities

- `L` - Leader
- `C` - Common
- `UC` - Uncommon
- `R` - Rare
- `SR` - Super Rare
- `SEC` - Secret Rare
- `SP CARD` - Special Card
- `P` - Promo
- `TR` - Treasure Rare

### Colors

Single colors: Red, Blue, Green, Purple, Black, Yellow

Dual colors: Red/Blue, Red/Green, Red/Purple, Red/Black, Red/Yellow, Blue/Green, Blue/Purple, Blue/Black, Blue/Yellow, Green/Purple, Green/Black, Green/Yellow, Purple/Black, Purple/Yellow, Black/Yellow

---

## Testing

The project includes a comprehensive test suite with 23 test cases covering:

- Pagination (default, custom, max limits, edge cases)
- Filtering (by name, type, color, rarity)
- Combined filters
- Response structure validation
- Error handling (404, invalid inputs)

Run tests:

```bash
bun run test
```

---

## Twitch Extension Integration

This EBS is designed to work with a Twitch extension frontend. All `/api/*` routes are protected with JWT authentication.

### Authentication

The extension frontend sends JWT tokens in the Authorization header:

```http
Authorization: Bearer <twitch_jwt_token>
```

**JWT Payload Structure:**

```typescript
{
  exp: number;              // Expiration timestamp
  opaque_user_id: string;   // Session-based user ID
  user_id?: string;         // Twitch user ID (if identity linked)
  channel_id: string;       // Channel ID where extension runs
  role: "broadcaster" | "moderator" | "viewer" | "external";
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token:
  ```json
  { "error": "Missing or invalid authorization token" }
  ```

### Environment Setup

The `TWITCH_EXTENSION_SECRET_KEY` can be:

- **Production**: Base64-encoded secret from Twitch Extension Manager (44 chars)
- **Development**: Plain text secret for testing

### Development Token Endpoint

For testing, a development endpoint generates valid tokens:

```http
GET /dev/token
```

Returns:

```json
{ "token": "eyJhbGciOiJIUzI1NiI..." }
```

> Note: This endpoint is disabled when `NODE_ENV=production`

---

## License

[Add your license here]
