# API Documentation - Digital Invitation Mobile

Dokumentasi lengkap API endpoints yang digunakan oleh mobile app.

## Base URL

```
Development: http://192.168.1.100:8000/api/mobile
Production: https://your-domain.com/api/mobile
```

## Authentication

Saat ini API tidak memerlukan authentication karena bersifat public. Rate limiting diterapkan untuk mencegah abuse.

## Rate Limiting

- **Get Invitation**: 60 requests per minute
- **Submit RSVP**: 10 requests per minute
- **Get RSVPs**: 60 requests per minute

## Endpoints

### 1. Get Invitation Details

Mendapatkan detail undangan berdasarkan unique URL.

**Endpoint:** `GET /invitations/{uniqueUrl}`

**Parameters:**
- `uniqueUrl` (string, required): Kode unik undangan

**Response Success (200):**
```json
{
  "success": true,
  "invitation": {
    "id": 1,
    "unique_url": "john-jane-wedding",
    "bride_name": "Jane Doe",
    "bride_father_name": "Mr. Doe",
    "bride_mother_name": "Mrs. Doe",
    "groom_name": "John Smith",
    "groom_father_name": "Mr. Smith",
    "groom_mother_name": "Mrs. Smith",
    "akad_date": "2026-12-25",
    "akad_date_formatted": "2026-12-25 10:00:00",
    "akad_time_start": "10:00:00",
    "akad_time_end": "11:00:00",
    "akad_location": "Masjid Al-Ikhlas",
    "reception_date": "2026-12-25",
    "reception_date_formatted": "2026-12-25 18:00:00",
    "reception_time_start": "18:00:00",
    "reception_time_end": "21:00:00",
    "reception_location": "Grand Ballroom Hotel XYZ",
    "full_address": "Jl. Sudirman No. 123, Jakarta Pusat",
    "latitude": "-6.200000",
    "longitude": "106.816666",
    "google_maps_url": "https://maps.google.com/?q=-6.200000,106.816666",
    "music_url": "http://domain.com/storage/music/song.mp3",
    "galleries": [
      {
        "id": 1,
        "image_path": "galleries/photo1.jpg",
        "image_url": "http://domain.com/storage/galleries/photo1.jpg"
      }
    ],
    "rsvps": [
      {
        "id": 1,
        "name": "Guest Name",
        "message": "Congratulations!",
        "created_at": "2 hours ago"
      }
    ],
    "rsvps_count": 25
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Invitation not found or not published"
}
```

**Example Request:**
```javascript
const response = await fetch('http://domain.com/api/mobile/invitations/john-jane-wedding', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});
const data = await response.json();
```

---

### 2. Submit RSVP

Mengirim ucapan dan doa untuk mempelai.

**Endpoint:** `POST /invitations/{uniqueUrl}/rsvp`

**Parameters:**
- `uniqueUrl` (string, required): Kode unik undangan

**Request Body:**
```json
{
  "name": "Guest Name",
  "message": "Congratulations on your wedding! Wishing you both a lifetime of happiness."
}
```

**Validation Rules:**
- `name`: required, string, max 255 characters
- `message`: required, string, max 500 characters

**Response Success (200):**
```json
{
  "success": true,
  "message": "Terima kasih! Ucapan Anda telah diterima.",
  "rsvp": {
    "id": 26,
    "name": "Guest Name",
    "message": "Congratulations on your wedding! Wishing you both a lifetime of happiness.",
    "created_at": "just now"
  }
}
```

**Response Error (422):**
```json
{
  "message": "The name field is required.",
  "errors": {
    "name": ["The name field is required."],
    "message": ["The message field is required."]
  }
}
```

**Response Error (404):**
```json
{
  "message": "Invitation not found"
}
```

**Response Error (429):**
```json
{
  "message": "Too Many Attempts."
}
```

**Example Request:**
```javascript
const response = await fetch('http://domain.com/api/mobile/invitations/john-jane-wedding/rsvp', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Guest Name',
    message: 'Congratulations!',
  }),
});
const data = await response.json();
```

---

### 3. Get Latest RSVPs

Mendapatkan daftar ucapan terbaru.

**Endpoint:** `GET /invitations/{uniqueUrl}/rsvp`

**Parameters:**
- `uniqueUrl` (string, required): Kode unik undangan
- `last_id` (integer, optional): ID RSVP terakhir untuk pagination

**Query Parameters:**
```
?last_id=10
```

**Response Success (200):**
```json
{
  "success": true,
  "rsvps": [
    {
      "id": 26,
      "name": "Guest Name",
      "message": "Congratulations!",
      "created_at": "just now"
    },
    {
      "id": 25,
      "name": "Another Guest",
      "message": "Best wishes!",
      "created_at": "5 minutes ago"
    }
  ],
  "count": 26
}
```

**Response Error (404):**
```json
{
  "message": "Invitation not found"
}
```

**Example Request:**
```javascript
const response = await fetch('http://domain.com/api/mobile/invitations/john-jane-wedding/rsvp?last_id=0', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});
const data = await response.json();
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 404 | Resource not found |
| 422 | Validation error |
| 429 | Too many requests (rate limit) |
| 500 | Internal server error |

## Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "errors": {
    "field_name": ["Error detail"]
  }
}
```

## Data Types

### Invitation Object
```typescript
interface Invitation {
  id: number;
  unique_url: string;
  bride_name: string;
  bride_father_name: string;
  bride_mother_name: string;
  groom_name: string;
  groom_father_name: string;
  groom_mother_name: string;
  akad_date: string; // YYYY-MM-DD
  akad_date_formatted: string; // YYYY-MM-DD HH:mm:ss
  akad_time_start: string; // HH:mm:ss
  akad_time_end: string; // HH:mm:ss
  akad_location: string;
  reception_date: string; // YYYY-MM-DD
  reception_date_formatted: string; // YYYY-MM-DD HH:mm:ss
  reception_time_start: string; // HH:mm:ss
  reception_time_end: string; // HH:mm:ss
  reception_location: string;
  full_address: string;
  latitude: string;
  longitude: string;
  google_maps_url: string;
  music_url: string | null;
  galleries: Gallery[];
  rsvps: RSVP[];
  rsvps_count: number;
}
```

### Gallery Object
```typescript
interface Gallery {
  id: number;
  image_path: string;
  image_url: string;
}
```

### RSVP Object
```typescript
interface RSVP {
  id: number;
  name: string;
  message: string;
  created_at: string; // Human readable (e.g., "2 hours ago")
}
```

## Testing with cURL

### Get Invitation
```bash
curl -X GET "http://domain.com/api/mobile/invitations/john-jane-wedding" \
  -H "Accept: application/json"
```

### Submit RSVP
```bash
curl -X POST "http://domain.com/api/mobile/invitations/john-jane-wedding/rsvp" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","message":"Congratulations!"}'
```

### Get RSVPs
```bash
curl -X GET "http://domain.com/api/mobile/invitations/john-jane-wedding/rsvp?last_id=0" \
  -H "Accept: application/json"
```

## Testing with Postman

1. Import collection dari file `postman_collection.json` (jika ada)
2. Set environment variable `base_url` = `http://domain.com/api/mobile`
3. Set environment variable `unique_url` = kode undangan Anda
4. Run requests

## Notes

1. **CORS**: Pastikan CORS sudah dikonfigurasi di backend
2. **HTTPS**: Gunakan HTTPS di production
3. **Rate Limiting**: Implementasikan exponential backoff jika hit rate limit
4. **Caching**: Cache response invitation untuk mengurangi API calls
5. **Error Handling**: Selalu handle semua possible error codes
6. **Timeout**: Set timeout 10 detik untuk semua requests
7. **Retry**: Implement retry logic untuk network errors

## Changelog

### Version 1.0.0 (2026-05-06)
- Initial API release
- Get invitation endpoint
- Submit RSVP endpoint
- Get RSVPs endpoint

---

**Last Updated**: 2026-05-06  
**API Version**: 1.0.0
