<template>
    <footer class="bg-gdc-white text-gdc-black border-t border-[#d8d8d8]">
        <!-- 3-Column Links -->
        <div class="py-[30px] border-b border-[#d8d8d8]">
            <div class="max-w-[1140px] mx-auto px-6 flex flex-wrap">
                <div
                    v-for="col in footerColumns"
                    :key="col.title"
                    class="w-1/3 px-4 max-lg:w-1/2 max-md:w-full max-md:pb-6"
                >
                    <h5 class="text-lg font-semibold text-gdc-black bg-[#f7f7f7] rounded-[10px] p-2.5 mb-4">
                        {{ col.title }}
                    </h5>
                    <ul class="flex flex-col gap-0">
                        <li v-for="link in col.links" :key="link.href" class="pb-2.5">
                            <a
                                :href="link.href"
                                class="text-[13px] font-normal text-gdc-blue no-underline leading-5 transition-colors duration-200 hover:text-gdc-blue-hover hover:underline"
                            >
                                {{ link.label }}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Social Icons + Disclaimer -->
        <div class="pt-[30px]">
            <div class="max-w-[1140px] mx-auto px-6 flex flex-wrap items-start">
                <!-- Social Icons -->
                <div class="flex flex-wrap gap-2.5 w-[28%] pr-4 max-lg:w-full max-lg:mb-6">
                    <a
                        v-for="social in socialLinks"
                        :key="social.href"
                        :href="social.href"
                        class="inline-flex items-center justify-center w-8 h-8 no-underline transition-opacity duration-200 rounded overflow-hidden hover:opacity-70 hover:no-underline"
                        :aria-label="social.label"
                    >
                        <img :src="social.icon" :alt="social.alt" width="32" height="32" class="w-8 h-8 block">
                    </a>
                </div>

                <!-- Disclaimer -->
                <div class="flex-1 text-base font-normal text-gdc-deep-grey leading-6">
                    <p class="mb-3">DISCLAIMER: Online Wagering is illegal in some Jurisdictions. It is your responsibility to check your local regulations before playing online. GDC Media Ltd takes no responsibility for your actions.</p>
                    <p class="mb-3">&copy; 2011-2026 GDC Media Limited. All Rights Reserved. Gambling.com is a registered trademark of GDC Media Limited.</p>
                    <p class="mb-3">
                        <a href="https://www.gambling.com/terms" class="text-base text-gdc-deep-grey no-underline font-normal hover:underline hover:text-gdc-black">Terms and Conditions</a>
                        &nbsp;&nbsp;|&nbsp;&nbsp;
                        <a href="https://www.gambling.com/privacy-policy" class="text-base text-gdc-deep-grey no-underline font-normal hover:underline hover:text-gdc-black">Privacy and Cookies Policy</a>
                    </p>
                    <p>Gambling can be addictive. Please play Responsibly.</p>
                </div>
            </div>
        </div>

        <!-- Country Flags -->
        <div class="pt-5">
            <div class="max-w-[1140px] mx-auto px-6 flex flex-wrap gap-3 items-center justify-center">
                <a
                    v-for="flag in countryFlags"
                    :key="flag.href"
                    :href="flag.href"
                    class="inline-flex no-underline transition-opacity duration-200 hover:opacity-70"
                >
                    <img
                        class="w-[29px] h-[29px] rounded-full object-cover block"
                        :src="flag.icon"
                        :alt="flag.alt"
                        width="29"
                        height="29"
                    >
                </a>
            </div>
        </div>

        <!-- Certification Badges -->
        <div class="py-5 pb-[30px]">
            <div class="max-w-[1140px] mx-auto px-6 flex flex-wrap justify-center items-center gap-6">
                <img
                    v-for="badge in badges"
                    :key="badge.src"
                    :src="badge.src"
                    :alt="badge.alt"
                    :height="badge.height"
                    class="w-auto"
                    :style="{ height: badge.height + 'px' }"
                >
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'SiteFooter',
    data() {
        return {
            footerColumns: [
                {
                    title: 'Popular Pages',
                    links: [
                        { label: 'Online Casinos', href: 'https://www.gambling.com/online-casinos' },
                        { label: 'Online Betting', href: 'https://www.gambling.com/online-betting' },
                        { label: 'Online Slots', href: 'https://www.gambling.com/online-casinos/slots' },
                        { label: 'Bingo Sites', href: 'https://www.gambling.com/online-casinos/bingo' },
                        { label: 'New Casino Sites', href: 'https://www.gambling.com/online-casinos/new' },
                        { label: 'Poker Sites', href: 'https://www.gambling.com/poker' },
                        { label: 'Reviews', href: 'https://www.gambling.com/reviews' },
                        { label: 'Free Games', href: 'https://www.gambling.com/free-games' },
                    ],
                },
                {
                    title: 'Quick Links',
                    links: [
                        { label: 'Casino Bonuses', href: 'https://www.gambling.com/online-casinos/bonuses' },
                        { label: 'Online Blackjack', href: 'https://www.gambling.com/online-casinos/blackjack' },
                        { label: 'Online Roulette', href: 'https://www.gambling.com/online-casinos/roulette' },
                        { label: 'Best Payout Casino', href: 'https://www.gambling.com/online-casinos/best-payout' },
                        { label: 'Fast Withdrawal Casino', href: 'https://www.gambling.com/online-casinos/fast-withdrawal' },
                        { label: 'Free Spins No Deposit', href: 'https://www.gambling.com/online-casinos/free-spins' },
                        { label: 'Guides', href: 'https://www.gambling.com/guides' },
                        { label: 'News', href: 'https://www.gambling.com/news' },
                    ],
                },
                {
                    title: 'Support',
                    links: [
                        { label: 'About Us', href: 'https://www.gambling.com/about-us' },
                        { label: 'Authors', href: 'https://www.gambling.com/authors' },
                        { label: 'Editorial Guidelines', href: 'https://www.gambling.com/editorial-guidelines' },
                        { label: 'Contact Us', href: 'https://www.gambling.com/contact' },
                        { label: 'Corporate', href: 'https://www.gambling.com/corporate' },
                        { label: 'Responsible Gambling', href: 'https://www.gambling.com/responsible-gambling' },
                        { label: 'Sitemap', href: 'https://www.gambling.com/sitemap' },
                        { label: 'Rewards Terms and Conditions', href: 'https://www.gambling.com/rewards-terms' },
                    ],
                },
            ],
            socialLinks: [
                { href: 'https://x.com/gamblingcom', icon: 'https://objects.kaxmedia.com/auto/o/163105/6d2bef2635.svg', alt: 'X', label: 'Gambling.com on X' },
                { href: 'https://www.youtube.com/@GamblingComGroup', icon: 'https://objects.kaxmedia.com/auto/o/207713/dd9365d09a.svg', alt: 'YouTube', label: 'Gambling.com on YouTube' },
                { href: 'https://www.facebook.com/gamblingcom', icon: 'https://objects.kaxmedia.com/auto/o/163103/abf741e7a2.svg', alt: 'Facebook', label: 'Gambling.com on Facebook' },
                { href: 'https://www.instagram.com/gambling.com_official', icon: 'https://objects.kaxmedia.com/auto/o/163104/3ccb615a01.svg', alt: 'Instagram', label: 'Gambling.com on Instagram' },
                { href: 'https://www.tiktok.com/@gambling.com', icon: 'https://objects.kaxmedia.com/auto/o/207712/fdc1e4a62c.svg', alt: 'TikTok', label: 'Gambling.com on TikTok' },
                { href: 'https://twitter.com/gambling_group', icon: 'https://objects.kaxmedia.com/auto/o/163105/6d2bef2635.svg', alt: 'X Corporate', label: 'Gambling.com Corporate on X' },
            ],
            countryFlags: [
                { href: 'https://www.gambling.com/uk/guides', icon: 'https://objects.kaxmedia.com/auto/o/31168/01797ff082.svg', alt: 'United Kingdom' },
                { href: 'https://www.gambling.com/au', icon: 'https://objects.kaxmedia.com/auto/o/31174/6503ffd2da.svg', alt: 'Australia' },
                { href: 'https://www.gambling.com/at/strategie', icon: 'https://objects.kaxmedia.com/auto/o/105838/0e088ffbc2.svg', alt: 'Austria' },
                { href: 'https://www.gambling.com/be/strategie', icon: 'https://objects.kaxmedia.com/auto/o/150621/315f92da18.svg', alt: 'Belgium' },
                { href: 'https://www.gambling.com/be/fr/strategie', icon: 'https://objects.kaxmedia.com/auto/o/228906/482ba03dde.svg', alt: 'Belgium FR' },
                { href: 'https://www.gambling.com/br/estrategia', icon: 'https://objects.kaxmedia.com/auto/o/150610/cc07d617b6.svg', alt: 'Brazil' },
                { href: 'https://www.gambling.com/ca/strategy', icon: 'https://objects.kaxmedia.com/auto/o/31173/1dfb1fd413.svg', alt: 'Canada' },
                { href: 'https://www.gambling.com/ca/fr/strategie', icon: 'https://objects.kaxmedia.com/auto/o/164919/1c81e47a86.svg', alt: 'Canada FR' },
                { href: 'https://www.gambling.com/dk/strategi', icon: 'https://objects.kaxmedia.com/auto/o/39797/55038f4a0d.png', alt: 'Denmark' },
                { href: 'https://www.gambling.com/de/strategie', icon: 'https://objects.kaxmedia.com/auto/o/31180/50ebfcf79b.svg', alt: 'Germany' },
                { href: 'https://www.gambling.com/gr/strategy', icon: 'https://objects.kaxmedia.com/auto/o/105836/eba59012f6.svg', alt: 'Greece' },
                { href: 'https://www.gambling.com/in/strategy', icon: 'https://objects.kaxmedia.com/auto/o/105839/07a23616c1.svg', alt: 'India' },
                { href: 'https://www.gambling.com/ie/strategy', icon: 'https://objects.kaxmedia.com/auto/o/31172/289a7c5659.svg', alt: 'Ireland' },
                { href: 'https://www.gambling.com/it/strategia', icon: 'https://objects.kaxmedia.com/auto/o/31184/7a0dc044a9.svg', alt: 'Italy' },
                { href: 'https://www.gambling.com/mx/estrategias', icon: 'https://objects.kaxmedia.com/auto/o/150612/d42de529e8.svg', alt: 'Mexico' },
                { href: 'https://www.gambling.com/nl/strategie', icon: 'https://objects.kaxmedia.com/auto/o/105837/99d1fe9eb5.svg', alt: 'Netherlands' },
                { href: 'https://www.gambling.com/nz/strategy', icon: 'https://objects.kaxmedia.com/auto/o/31177/3dabbb82ad.svg', alt: 'New Zealand' },
                { href: 'https://www.gambling.com/no/strategi', icon: 'https://objects.kaxmedia.com/auto/o/31182/98b205880f.svg', alt: 'Norway' },
                { href: 'https://www.gambling.com/pe/estrategias', icon: 'https://objects.kaxmedia.com/auto/o/150699/e134106936.svg', alt: 'Peru' },
                { href: 'https://www.gambling.com/ro/strategie', icon: 'https://objects.kaxmedia.com/auto/o/150700/24bb1aa999.svg', alt: 'Romania' },
                { href: 'https://www.gambling.com/es/estrategias', icon: 'https://objects.kaxmedia.com/auto/o/150623/5ea20dcd90.svg', alt: 'Spain' },
                { href: 'https://www.gambling.com/se/strategi', icon: 'https://objects.kaxmedia.com/auto/o/31183/98165493bc.svg', alt: 'Sweden' },
                { href: 'https://www.gambling.com/us/strategy', icon: 'https://objects.kaxmedia.com/auto/o/31206/1d224877ce.svg', alt: 'United States' },
            ],
            badges: [
                { src: 'https://objects.kaxmedia.com/auto/o/163122/a668aabbbd.svg', alt: 'GAMB | Nasdaq Listed', height: 40 },
                { src: 'https://objects.kaxmedia.com/auto/o/163119/d9f4d5eb90.svg', alt: 'GamStop', height: 48 },
                { src: 'https://objects.kaxmedia.com/auto/o/163118/df5e1b2ddd.svg', alt: 'GamCare', height: 51 },
                { src: 'https://objects.kaxmedia.com/auto/o/209377/e0932ff1ed.svg', alt: 'GambleAware', height: 21 },
                { src: 'https://objects.kaxmedia.com/auto/o/163106/6830429ae0.svg', alt: '18+', height: 51 },
                { src: 'https://objects.kaxmedia.com/auto/o/163115/4c822cd29c.svg', alt: 'eCOGRA', height: 51 },
                { src: 'https://objects.kaxmedia.com/auto/o/163120/4564d6de5f.svg', alt: 'Gambling.com Group', height: 40 },
                { src: 'https://objects.kaxmedia.com/auto/o/163127/26fee6df5b.svg', alt: 'GPWA Approved Portal', height: 40 },
            ],
        };
    },
};
</script>
