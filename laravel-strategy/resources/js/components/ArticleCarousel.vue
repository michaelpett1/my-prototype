<template>
    <div class="py-8 scroll-mt-16" :class="{ 'border-t border-gdc-grey': !first }">
        <!-- Section Header -->
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-[23px] font-bold leading-8 text-gdc-black">{{ title }}</h2>
            <div class="flex gap-2">
                <button
                    class="w-8 h-8 border border-gdc-grey rounded-full bg-gdc-white cursor-pointer flex items-center justify-center transition-all duration-200 text-gdc-deep-grey hover:border-gdc-blue hover:text-gdc-blue"
                    aria-label="Previous"
                    @click="scroll(-1)"
                >
                    <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
                <button
                    class="w-8 h-8 border border-gdc-grey rounded-full bg-gdc-white cursor-pointer flex items-center justify-center transition-all duration-200 text-gdc-deep-grey hover:border-gdc-blue hover:text-gdc-blue"
                    aria-label="Next"
                    @click="scroll(1)"
                >
                    <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <polyline points="9 6 15 12 9 18"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Cards Carousel -->
        <div
            ref="carousel"
            class="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 hide-scrollbar"
        >
            <a
                v-for="article in articles"
                :key="article.url"
                :href="article.url"
                class="min-w-[220px] flex-1 snap-start cursor-pointer no-underline text-inherit hover:no-underline group"
            >
                <div
                    class="w-full h-40 rounded-lg overflow-hidden mb-2 bg-cover bg-center"
                    :style="{ backgroundImage: `url('${article.image}')` }"
                ></div>
                <div class="text-sm font-semibold leading-5 text-gdc-black transition-colors duration-200 group-hover:text-gdc-blue">
                    {{ article.title }}
                </div>
            </a>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ArticleCarousel',
    props: {
        title: {
            type: String,
            required: true,
        },
        articles: {
            type: Array,
            required: true,
        },
        first: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        scroll(direction) {
            const carousel = this.$refs.carousel;
            if (!carousel) return;
            const scrollAmount = carousel.offsetWidth * 0.75;
            carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
        },
    },
};
</script>
