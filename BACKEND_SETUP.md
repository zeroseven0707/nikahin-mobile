# Setup Backend untuk Mobile App

Panduan untuk mengkonfigurasi backend Laravel agar dapat diakses oleh mobile app.

## 1. Update Routes

Tambahkan routes berikut di `routes/web.php` atau buat file baru `routes/api.php`:

```php
// routes/web.php atau routes/api.php

use App\Http\Controllers\RsvpController;
use App\Http\Controllers\PublicInvitationController;

// Public invitation route (sudah ada, pastikan mengembalikan JSON untuk mobile)
Route::get('/i/{uniqueUrl}', [PublicInvitationController::class, 'show'])
    ->middleware('throttle:60,1')
    ->name('public.invitation');

// RSVP routes untuk mobile app
Route::post('/i/{uniqueUrl}/rsvp', [RsvpController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('public.rsvp.store');

Route::get('/i/{uniqueUrl}/rsvp/latest', [RsvpController::class, 'latest'])
    ->middleware('throttle:60,1')
    ->name('public.rsvp.latest');
```

## 2. Update PublicInvitationController

Modifikasi controller untuk mengembalikan JSON response untuk mobile app:

```php
// app/Http/Controllers/PublicInvitationController.php

public function show(string $uniqueUrl, Request $request)
{
    $invitation = Invitation::where('unique_url', $uniqueUrl)
        ->where('status', 'published')
        ->with(['template', 'galleries', 'guests', 'rsvps'])
        ->first();

    if (!$invitation) {
        if ($request->wantsJson()) {
            return response()->json(['error' => 'Invitation not found'], 404);
        }
        abort(404);
    }

    // Track the view
    $this->viewTracker->trackView($invitation, $request);

    // Jika request dari mobile app (JSON)
    if ($request->wantsJson() || $request->header('Accept') === 'application/json') {
        return response()->json([
            'success' => true,
            'invitation' => [
                'id' => $invitation->id,
                'unique_url' => $invitation->unique_url,
                'bride_name' => $invitation->bride_name,
                'bride_father_name' => $invitation->bride_father_name,
                'bride_mother_name' => $invitation->bride_mother_name,
                'groom_name' => $invitation->groom_name,
                'groom_father_name' => $invitation->groom_father_name,
                'groom_mother_name' => $invitation->groom_mother_name,
                'akad_date' => $invitation->akad_date->format('Y-m-d'),
                'akad_date_formatted' => $invitation->akad_date->format('Y-m-d') . ' ' . $invitation->akad_time_start,
                'akad_time_start' => $invitation->akad_time_start,
                'akad_time_end' => $invitation->akad_time_end,
                'akad_location' => $invitation->akad_location,
                'reception_date' => $invitation->reception_date->format('Y-m-d'),
                'reception_date_formatted' => $invitation->reception_date->format('Y-m-d') . ' ' . $invitation->reception_time_start,
                'reception_time_start' => $invitation->reception_time_start,
                'reception_time_end' => $invitation->reception_time_end,
                'reception_location' => $invitation->reception_location,
                'full_address' => $invitation->full_address,
                'latitude' => $invitation->latitude,
                'longitude' => $invitation->longitude,
                'google_maps_url' => $invitation->google_maps_url,
                'music_url' => $invitation->music_path ? Storage::disk('public')->url($invitation->music_path) : null,
                'galleries' => $invitation->galleries->map(function($gallery) {
                    return [
                        'id' => $gallery->id,
                        'image_path' => $gallery->image_path,
                        'image_url' => Storage::disk('public')->url($gallery->image_path),
                    ];
                }),
                'rsvps' => $invitation->rsvps()->latest()->take(10)->get()->map(function($rsvp) {
                    return [
                        'id' => $rsvp->id,
                        'name' => $rsvp->name,
                        'message' => $rsvp->message,
                        'created_at' => $rsvp->created_at->diffForHumans(),
                    ];
                }),
                'rsvps_count' => $invitation->rsvps()->count(),
            ]
        ]);
    }

    // Jika request dari web browser (existing code)
    $akadDateTime = $invitation->akad_date->format('Y-m-d') . ' ' . $invitation->akad_time_start;
    $receptionDateTime = $invitation->reception_date->format('Y-m-d') . ' ' . $invitation->reception_time_start;

    $data = [
        'invitation' => $invitation,
        'bride_name' => $invitation->bride_name,
        // ... existing code
    ];

    $renderedTemplate = $this->templateService->renderTemplate($invitation->template, $data);

    return view('public.invitation', [
        'invitation' => $invitation,
        'renderedTemplate' => $renderedTemplate,
    ]);
}
```

## 3. Update RsvpController

Pastikan controller sudah mengembalikan JSON response (sudah ada di code):

```php
// app/Http/Controllers/RsvpController.php

public function store(Request $request, $uniqueUrl)
{
    $invitation = Invitation::where('unique_url', $uniqueUrl)
        ->where('status', 'published')
        ->firstOrFail();

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'message' => 'required|string|max:500',
    ]);

    $rsvp = $invitation->rsvps()->create($validated);

    // Return JSON for mobile app
    return response()->json([
        'success' => true,
        'message' => 'Terima kasih! Ucapan Anda telah diterima.',
        'rsvp' => [
            'id' => $rsvp->id,
            'name' => $rsvp->name,
            'message' => $rsvp->message,
            'created_at' => $rsvp->created_at->diffForHumans(),
        ]
    ]);
}

public function latest(Request $request, $uniqueUrl)
{
    $invitation = Invitation::where('unique_url', $uniqueUrl)
        ->where('status', 'published')
        ->firstOrFail();

    $lastId = $request->input('last_id', 0);

    $rsvps = $invitation->rsvps()
        ->when($lastId > 0, function($query) use ($lastId) {
            return $query->where('id', '>', $lastId);
        })
        ->latest()
        ->take(10)
        ->get()
        ->map(function($rsvp) {
            return [
                'id' => $rsvp->id,
                'name' => $rsvp->name,
                'message' => $rsvp->message,
                'created_at' => $rsvp->created_at->diffForHumans(),
            ];
        });

    return response()->json([
        'success' => true,
        'rsvps' => $rsvps,
        'count' => $invitation->rsvps()->count(),
    ]);
}
```

## 4. Enable CORS

Install Laravel CORS package (jika belum):

```bash
composer require fruitcake/laravel-cors
```

Update `config/cors.php`:

```php
return [
    'paths' => ['api/*', 'i/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // Untuk development, ganti dengan domain spesifik di production
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

Tambahkan middleware di `app/Http/Kernel.php`:

```php
protected $middleware = [
    // ...
    \Fruitcake\Cors\HandleCors::class,
];
```

## 5. Storage Link

Pastikan storage link sudah dibuat untuk akses file:

```bash
php artisan storage:link
```

## 6. Environment Variables

Update `.env` untuk production:

```env
APP_URL=https://your-domain.com
FILESYSTEM_DISK=public

# CORS (optional, untuk production)
CORS_ALLOWED_ORIGINS=https://your-mobile-app-domain.com
```

## 7. Testing API

Test API menggunakan Postman atau curl:

### Get Invitation
```bash
curl -X GET "http://your-domain.com/i/unique-url-here" \
  -H "Accept: application/json"
```

### Submit RSVP
```bash
curl -X POST "http://your-domain.com/i/unique-url-here/rsvp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"John Doe","message":"Congratulations!"}'
```

### Get Latest RSVPs
```bash
curl -X GET "http://your-domain.com/i/unique-url-here/rsvp/latest?last_id=0" \
  -H "Accept: application/json"
```

## 8. Security Considerations

1. **Rate Limiting**: Sudah diterapkan di routes
2. **Input Validation**: Sudah ada di controller
3. **HTTPS**: Gunakan HTTPS di production
4. **CORS**: Batasi allowed origins di production
5. **API Token** (Optional): Tambahkan API token untuk keamanan ekstra

## 9. Deployment

Untuk production:

1. Set `APP_ENV=production` di `.env`
2. Run `php artisan config:cache`
3. Run `php artisan route:cache`
4. Run `php artisan view:cache`
5. Pastikan menggunakan HTTPS
6. Update CORS allowed origins dengan domain spesifik

## 10. Troubleshooting

### Issue: CORS Error
**Solution**: Pastikan CORS middleware sudah diaktifkan dan configured dengan benar

### Issue: 404 Not Found
**Solution**: Jalankan `php artisan route:clear` dan `php artisan route:cache`

### Issue: Image tidak muncul
**Solution**: Pastikan storage link sudah dibuat dengan `php artisan storage:link`

### Issue: Rate Limit Error
**Solution**: Sesuaikan rate limit di routes atau clear cache dengan `php artisan cache:clear`
