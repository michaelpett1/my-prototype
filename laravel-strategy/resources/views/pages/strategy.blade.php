@extends('layouts.app')

@section('title', 'Gambling Strategy | Gambling.com')
@section('meta_description', 'Free strategy guides from our expert users. We cover everything you need to know to create a profitable, effective gambling strategy.')
@section('og_title', 'Gambling Strategy | Gambling.com')
@section('og_description', 'Free strategy guides from our expert users. We cover everything you need to know to create a profitable, effective gambling strategy.')
@section('canonical', 'https://www.gambling.com/guides')

@section('content')
    {{-- Hero / Top Section --}}
    <section class="pt-12 pb-4">
        <div class="max-w-[1140px] mx-auto px-6">
            <div>
                <h1 class="text-[29px] font-semibold leading-10 mb-2">Gambling Strategy</h1>
                <p class="text-base leading-relaxed text-gray-500 mb-8">Free strategy guides from our experts</p>

                <category-cards :categories='@json($categories)'></category-cards>
            </div>
        </div>
    </section>

    {{-- Featured Videos --}}
    <section class="py-8 border-t border-gdc-grey scroll-mt-16">
        <div class="max-w-[1140px] mx-auto px-6">
            <featured-video-player
                :main-video='@json($mainVideo)'
                :sidebar-videos='@json($sidebarVideos)'
            ></featured-video-player>
        </div>
    </section>

    {{-- Casino Strategy --}}
    <section id="casino-strategy">
        <div class="max-w-[1140px] mx-auto px-6">
            <article-carousel
                title="Casino Strategy"
                :articles='@json($casinoStrategy)'
                :first="true"
            ></article-carousel>
        </div>
    </section>

    {{-- Casino Guides --}}
    <section>
        <div class="max-w-[1140px] mx-auto px-6">
            <article-carousel
                title="Casino Guides"
                :articles='@json($casinoGuides)'
            ></article-carousel>
        </div>
    </section>

    {{-- Betting Strategy --}}
    <section id="betting-strategy">
        <div class="max-w-[1140px] mx-auto px-6">
            <article-carousel
                title="Betting Strategy"
                :articles='@json($bettingStrategy)'
            ></article-carousel>
        </div>
    </section>

    {{-- Poker Strategy --}}
    <section id="poker-strategy">
        <div class="max-w-[1140px] mx-auto px-6">
            <article-carousel
                title="Poker Strategy"
                :articles='@json($pokerStrategy)'
            ></article-carousel>
        </div>
    </section>
@endsection
