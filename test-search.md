# Citizen Search API Test Examples

## Test the Enhanced Search Functionality

### 1. Get All Citizens (Basic)

```bash
GET /citizens
```

### 2. General Search (searches across multiple fields)

```bash
GET /citizens?search=Ahmet
GET /citizens?search=Istanbul
GET /citizens?search=123456
```

### 3. Specific Name Filter

```bash
GET /citizens?name=Ahmet
GET /citizens?name=Yilmaz
```

### 4. Parent Name Filters

```bash
GET /citizens?mother_name=Fatma
GET /citizens?father_name=Mehmet
```

### 5. Date of Birth Range Filter

```bash
GET /citizens?birth_date_from=1985-01-01&birth_date_to=1995-12-31
GET /citizens?birth_date_from=1990-01-01
GET /citizens?birth_date_to=1995-12-31
```

### 6. Location Filters

```bash
GET /citizens?birth_city=Istanbul
GET /citizens?address_city=Ankara
```

### 7. Gender Filter

```bash
GET /citizens?gender=E
GET /citizens?gender=K
```

### 8. Combined Filters

```bash
GET /citizens?name=Ahmet&birth_city=Istanbul&gender=E
GET /citizens?mother_name=Fatma&birth_date_from=1985-01-01&birth_date_to=1995-12-31
```

### 9. Pagination with Filters

```bash
GET /citizens?page=1&limit=5&birth_city=Istanbul
GET /citizens?page=2&limit=10&gender=K&search=Istanbul
```

### 10. Advanced Search Endpoint

```bash
GET /citizens/advanced-search?name=Ahmet&mother_name=Fatma&birth_city=Istanbul
```

### 11. Simple Search Endpoint

```bash
GET /citizens/search?query=Ahmet
GET /citizens/search?query=Istanbul&page=1&limit=5
```

## Expected Response Format

```json
{
  "citizens": [
    {
      "uid": "1",
      "national_identifier": "12345678901",
      "first": "Ahmet",
      "last": "Yilmaz",
      "mother_first": "Fatma",
      "father_first": "Mehmet",
      "gender": "E",
      "birth_city": "Istanbul",
      "date_of_birth": "1990-01-01",
      "id_registration_city": "Istanbul",
      "id_registration_district": "Kadikoy",
      "address_city": "Istanbul",
      "address_district": "Besiktas",
      "address_neighborhood": "Levent",
      "street_address": "Buyukdere Caddesi No:123",
      "door_or_entrance_number": "5"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "filters": {
    "name": "Ahmet"
  },
  "message": "Found 1 citizen(s)"
}
```

## Frontend Filter Mapping

| Frontend Filter   | Backend Parameter | Description                       |
| ----------------- | ----------------- | --------------------------------- |
| `search`          | `search`          | General search across all fields  |
| `name`            | `name`            | Searches both first and last name |
| `mother_name`     | `mother_name`     | Mother's first name               |
| `father_name`     | `father_name`     | Father's first name               |
| `birth_date_from` | `birth_date_from` | Birth date range start            |
| `birth_date_to`   | `birth_date_to`   | Birth date range end              |
| `birth_city`      | `birth_city`      | Birth city exact match            |
| `gender`          | `gender`          | Gender (E/K)                      |
| `address_city`    | `address_city`    | Current address city              |

## Notes

- All text searches are case-insensitive using `iLike`
- Date filters expect ISO format (YYYY-MM-DD)
- Pagination is supported on all endpoints
- Empty or null filters are automatically removed
- The `/search` endpoint requires a `query` parameter
- The `/advanced-search` endpoint accepts individual filter parameters
- The main `/` endpoint supports both general and specific filters
