<template>
    <header class="bg-gdc-white shadow-[0px_1px_5px_-2px_#4e4e4e] sticky top-0 z-[100]">
        <div class="max-w-[1140px] mx-auto px-6 flex items-center justify-between h-14">
            <!-- Logo -->
            <a href="https://www.gambling.com" class="flex items-center shrink-0 no-underline" aria-label="Gambling.com home">
                <img
                    src="https://objects.kaxmedia.com/auto/o/105557/8fbf0fa9e7.svg"
                    alt="gambling.com"
                    width="124"
                    height="42"
                    class="h-[42px] w-auto"
                >
            </a>

            <!-- Primary Navigation -->
            <nav class="hidden lg:flex items-center gap-0" aria-label="Primary navigation">
                <a
                    v-for="item in navItems"
                    :key="item.href"
                    :href="item.href"
                    :aria-current="item.current ? 'page' : undefined"
                    class="text-base font-medium text-gdc-black no-underline pl-4 whitespace-nowrap leading-[56px] h-14 flex items-center transition-colors duration-200 hover:text-gdc-blue hover:no-underline"
                >
                    {{ item.label }}
                </a>
            </nav>

            <!-- Header Actions -->
            <div class="flex items-center gap-3">
                <!-- Sign Up -->
                <a
                    href="https://www.gambling.com/sign-up"
                    class="inline-flex items-center gap-1.5 text-base font-medium text-gdc-black no-underline whitespace-nowrap cursor-pointer hover:underline"
                    aria-label="Sign up"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="shrink-0">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M20.2282 20.7349C22.5503 18.5466 24 15.4426 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 15.4426 1.44967 18.5466 3.77185 20.7349C5.92015 22.7593 8.81518 24 12 24C15.1848 24 18.0799 22.7593 20.2282 20.7349ZM4.794 19.1536C6.48568 17.0434 9.08505 15.6923 12 15.6923C14.9149 15.6923 17.5143 17.0434 19.206 19.1536C17.3665 21.0065 14.8172 22.1538 12 22.1538C9.18277 22.1538 6.63351 21.0065 4.794 19.1536ZM16.6154 8.30769C16.6154 10.8567 14.549 12.9231 12 12.9231C9.45099 12.9231 7.38462 10.8567 7.38462 8.30769C7.38462 5.75869 9.45099 3.69231 12 3.69231C14.549 3.69231 16.6154 5.75869 16.6154 8.30769Z" fill="black"/>
                    </svg>
                    Sign&nbsp;Up
                </a>

                <!-- GX Region Selector -->
                <div
                    class="inline-flex items-center cursor-pointer no-underline hover:opacity-70"
                    aria-label="Select region"
                    role="button"
                    tabindex="0"
                >
                    <div
                        class="w-[30px] h-[54px] shrink-0 bg-center bg-no-repeat"
                        style="background-image: url('https://objects.kaxmedia.com/auto/o/263246/a8d6548e5d.svg'); background-size: 26px;"
                    ></div>
                    <div class="flex items-center gap-2 text-base font-medium text-gdc-black whitespace-nowrap">
                        GX
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="10" viewBox="0 0 17 10" fill="none" class="shrink-0">
                            <path d="M16 1L8.5 8.5L0.999999 1" stroke="black" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>

                <!-- Search -->
                <button class="bg-transparent border-none cursor-pointer p-0 text-gdc-black flex items-center" aria-label="Search">
                    <img src="https://objects.kaxmedia.com/auto/o/139752/7900ca8f22.svg" alt="" width="20" height="25" class="w-5 h-[25px]">
                </button>
            </div>
        </div>
    </header>
</template>

<script>
export default {
    name: 'SiteHeader',
    data() {
        return {
            navItems: [
                { label: 'Reviews', href: 'https://www.gambling.com/reviews', current: false },
                { label: 'Casino', href: 'https://www.gambling.com/online-casinos', current: false },
                { label: 'Betting', href: 'https://www.gambling.com/online-betting', current: false },
                { label: 'Free Games', href: 'https://www.gambling.com/free-games', current: false },
                { label: 'Guides', href: 'https://www.gambling.com/guides', current: true },
                { label: 'News', href: 'https://www.gambling.com/news', current: false },
                { label: 'Inside Gambling.com', href: 'https://www.gambling.com/inside', current: false },
            ],
        };
    },
};
</script>
