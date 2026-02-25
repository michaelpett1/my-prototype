<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Gambling.com')</title>
    <meta name="description" content="@yield('meta_description', 'Gambling.com - Your trusted source for gambling strategy and guides.')">
    <meta property="og:title" content="@yield('og_title', 'Gambling.com')">
    <meta property="og:description" content="@yield('og_description', 'Gambling.com - Your trusted source for gambling strategy and guides.')">
    <meta property="og:type" content="website">
    <link rel="canonical" href="@yield('canonical', 'https://www.gambling.com')">

    {{-- Google Fonts --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700&display=swap" rel="stylesheet">

    {{-- Vite Assets --}}
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <div id="app">
        {{-- Header --}}
        <site-header></site-header>

        {{-- Main Content --}}
        <main>
            @yield('content')
        </main>

        {{-- Footer --}}
        <site-footer></site-footer>
    </div>
</body>
</html>
