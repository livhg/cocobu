# API Documentation

## Overview

The CocoBu API is a RESTful API built with NestJS that provides endpoints for expense tracking and split book management.

**Base URL**: `http://localhost:4000/api` (development)

**Swagger UI**: `http://localhost:4000/api/docs`

## Authentication

The API uses **JWT-based authentication**. Users claim a shareable user ID to start a session—no email delivery or password required.

### Flow

1. **Submit User ID**: `POST /auth/login` with `{ "userId": "bujiro" }`
2. **Session Created**: The server creates (or reuses) the user record, then issues a 7-day HTTP-only cookie.
3. **Shared Access**: Anyone who logs in with the same user ID will see the same books and entries.

### Development Mode

For quick testing in development:

```bash
# Direct login without validation middleware
GET /auth/dev-login?userId=demo
```

This bypasses additional checks and immediately establishes a session for the provided user ID.

## Endpoints

### Authentication

#### POST /auth/login

Claim a user ID and start a session.

**Request Body**:
```json
{
  "userId": "bujiro"
}
```

**Response** (200):
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "bujiro",
    "name": "bujiro",
    "createdAt": "2025-10-15T10:30:00.000Z",
    "updatedAt": "2025-10-29T14:25:00.000Z"
  }
}
```

**Side Effect**: Sets `session` HTTP-only cookie

---

#### GET /auth/verify (removed)

This endpoint belonged to the legacy email login flow and no longer exists. Requests now return `404 Not Found`.

#### GET /auth/dev-login

Development-only direct login (bypasses validation guard).

**Query Parameters**:
- `userId` (required): User ID to log in as

**Response** (200):
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "dev-user",
    "name": "Alice"
  }
}
```

**Note**: Only available when `NODE_ENV !== 'production'`

---

#### POST /auth/logout

Logout current user.

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

**Side Effect**: Clears `session` cookie

---

### Users

All user endpoints require authentication.

#### GET /users/me

Get current user profile.

**Headers**:
```
Cookie: session=eyJhbGc...
```

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "alice",
  "name": "Alice",
  "createdAt": "2025-10-15T10:30:00.000Z",
  "updatedAt": "2025-10-15T10:30:00.000Z"
}
```

---

#### PATCH /users/me

Update current user profile.

**Request Body**:
```json
{
  "name": "Alice Johnson"
}
```

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "alice",
  "name": "Alice Johnson",
  "createdAt": "2025-10-15T10:30:00.000Z",
  "updatedAt": "2025-10-29T14:25:00.000Z"
}
```

---

### Books

All book endpoints require authentication.

#### GET /books

List all books where current user is a member.

**Response** (200):
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "type": "personal",
    "name": "My Personal Expenses",
    "currency": "TWD",
    "ownerId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-10-15T10:30:00.000Z",
    "updatedAt": "2025-10-15T10:30:00.000Z",
    "memberships": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "role": "owner",
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Alice",
          "userId": "alice"
        }
      }
    ]
  }
]
```

---

#### GET /books/:id

Get a specific book by ID.

**Parameters**:
- `id`: Book UUID

**Response** (200):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "type": "split",
  "name": "Summer Trip 2025",
  "currency": "TWD",
  "ownerId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-10-15T10:30:00.000Z",
  "updatedAt": "2025-10-15T10:30:00.000Z",
  "memberships": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "role": "owner",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Alice",
        "userId": "alice"
      }
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440003",
      "role": "writer",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Bob",
        "userId": "bob"
      }
    }
  ]
}
```

**Response** (404):
```json
{
  "statusCode": 404,
  "message": "Book not found",
  "error": "Not Found"
}
```

**Response** (403):
```json
{
  "statusCode": 403,
  "message": "You do not have access to this book",
  "error": "Forbidden"
}
```

---

#### POST /books

Create a new book.

**Request Body**:
```json
{
  "name": "New Book",
  "type": "personal",
  "currency": "TWD"
}
```

**Field Validation**:
- `name`: Required, 1-100 characters
- `type`: Required, one of: `personal`, `split`
- `currency`: Optional, 3-letter ISO code (default: `TWD`)

**Response** (201):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440005",
  "type": "personal",
  "name": "New Book",
  "currency": "TWD",
  "ownerId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-10-29T14:30:00.000Z",
  "updatedAt": "2025-10-29T14:30:00.000Z",
  "memberships": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440010",
      "role": "owner",
      "userId": "550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}
```

**Note**: Creates a membership automatically with `owner` role for the creator.

---

#### DELETE /books/:id

Delete a book (owner only).

**Parameters**:
- `id`: Book UUID

**Response** (200):
```json
{
  "message": "Book deleted successfully"
}
```

**Response** (403):
```json
{
  "statusCode": 403,
  "message": "Only the owner can delete this book",
  "error": "Forbidden"
}
```

---

## Error Handling

### Standard Error Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created
- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Data Types

### BookType

```typescript
enum BookType {
  personal = 'personal',  // Personal expense book (single user)
  split = 'split'         // Split book (multiple users with allocations)
}
```

### MembershipRole

```typescript
enum MembershipRole {
  owner = 'owner',     // Full control, can delete book
  admin = 'admin',     // Can manage members and settings
  writer = 'writer',   // Can create/edit entries
  reader = 'reader'    // Can only view
}
```

### SplitMode

```typescript
enum SplitMode {
  ratio = 'ratio',     // Split by percentage (0-100)
  shares = 'shares',   // Split by equal shares (1, 2, 3...)
  exact = 'exact'      // Split by exact amounts
}
```

## Pagination

Currently not implemented. All list endpoints return full results.

**Future Enhancement**: Add query parameters for pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

## Filtering & Sorting

Currently not implemented for list endpoints.

**Future Enhancement**: Add query parameters:
- `sort`: Field to sort by
- `order`: `asc` or `desc`
- `filter`: JSON filter criteria

## Development Tips

### Testing with curl

```bash
# Login (claim user ID)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo"}' \
  -c cookies.txt

# Get user profile
curl http://localhost:4000/api/users/me \
  -b cookies.txt

# List books
curl http://localhost:4000/api/books \
  -b cookies.txt

# Create book
curl -X POST http://localhost:4000/api/books \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Test Book","type":"personal","currency":"TWD"}'
```

### Testing with Postman

1. Import OpenAPI spec from `/api/docs-json`
2. Set environment variable `baseUrl` = `http://localhost:4000`
3. Use the `/auth/login` (or `/auth/dev-login`) endpoint with a user ID to get a session cookie
4. Postman will automatically include cookies in subsequent requests

## Known Limitations

1. **No pagination**: All list endpoints return full results
2. **No file uploads**: Receipt images not yet supported
3. **No entry management**: Entry CRUD endpoints not yet implemented
4. **No settlement calculation**: Settlement algorithm pending
5. **Basic validation**: Some edge cases not handled
6. **English only errors**: Error messages not localized

## Security Considerations

- ✅ HTTP-only cookies prevent XSS attacks
- ✅ CORS configured for specific frontend origin
- ✅ Request throttling limits bursts
- ✅ JWT tokens have expiration
- ✅ Passwords not stored (passwordless auth)
- ✅ Database queries parameterized (SQL injection protection)
- ✅ Input validation with class-validator
- ⚠️ HTTPS required in production (not enforced in development)

## Further Reading

- [Swagger UI](http://localhost:4000/api/docs) - Interactive API explorer
- [Prisma Schema](../packages/database/prisma/schema.prisma) - Database schema
- [E2E Testing Guide](./E2E_TESTING.md) - End-to-end testing procedures
