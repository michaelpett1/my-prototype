<template>
    <div class="grid grid-cols-3 gap-4 max-md:grid-cols-3 max-[480px]:grid-cols-1">
        <a
            v-for="card in categories"
            :key="card.id"
            :href="'#' + card.id"
            class="no-underline text-inherit rounded-lg overflow-hidden transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:no-underline"
        >
            <div
                class="w-full h-[120px] max-md:h-[90px] max-[480px]:h-[120px] rounded-lg bg-cover bg-center"
                :style="{ backgroundImage: `url('${card.image}')` }"
            ></div>
            <div class="flex items-center justify-center gap-1 text-sm font-semibold text-gdc-black py-2 text-center">
                {{ card.label }}
                <svg class="w-3.5 h-3.5 text-gdc-deep-grey" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </div>
        </a>
    </div>
</template>

<script>
export default {
    name: 'CategoryCards',
    props: {
        categories: {
            type: Array,
            required: true,
        },
    },
};
</script>
