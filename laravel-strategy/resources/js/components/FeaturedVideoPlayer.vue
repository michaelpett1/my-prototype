<template>
    <div>
        <div class="section-header flex items-center justify-between mb-6">
            <h2 class="text-[23px] font-bold leading-8 text-gdc-black">Featured Videos</h2>
        </div>

        <div class="grid grid-cols-[1fr_340px] gap-6 max-lg:grid-cols-1">
            <!-- Main Player -->
            <div class="main-player-wrap">
                <div
                    class="rounded-lg overflow-hidden relative cursor-pointer"
                    :class="{ 'aspect-video': true }"
                    @click="playMainVideo"
                >
                    <!-- Thumbnail Background -->
                    <div
                        v-if="!isPlaying"
                        class="w-full h-full bg-cover bg-center"
                        :style="{ backgroundImage: `url('${currentVideo.thumb}')` }"
                    ></div>

                    <!-- Play Button -->
                    <div
                        v-if="!isPlaying"
                        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/90 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110"
                    >
                        <svg class="w-6 h-6 fill-gdc-black ml-[3px]" viewBox="0 0 24 24">
                            <polygon points="5,3 19,12 5,21"/>
                        </svg>
                    </div>

                    <!-- Duration Badge -->
                    <span
                        v-if="!isPlaying"
                        class="absolute bottom-3 left-3 bg-black/75 text-gdc-white text-xs font-semibold px-2 py-0.5 rounded"
                    >
                        {{ currentVideo.duration }}
                    </span>

                    <!-- YouTube Iframe -->
                    <iframe
                        v-if="isPlaying"
                        :src="`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1&rel=0`"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        :title="currentVideo.title"
                        class="absolute top-0 left-0 w-full h-full border-none rounded-lg"
                    ></iframe>
                </div>

                <!-- Video Info -->
                <div class="mt-2">
                    <div class="text-base font-semibold leading-snug text-gdc-black">{{ currentVideo.title }}</div>
                    <div class="text-[13px] text-gdc-deep-grey mt-0.5">{{ currentVideo.meta }}</div>
                </div>
            </div>

            <!-- Sidebar Videos -->
            <div class="flex flex-col gap-2 max-lg:flex-row max-lg:overflow-x-auto max-lg:gap-4">
                <a
                    v-for="(video, index) in sidebarVideos"
                    :key="video.videoId"
                    href="#"
                    class="flex gap-2 p-2 rounded-md cursor-pointer transition-colors duration-200 no-underline text-inherit hover:bg-gray-50 hover:no-underline max-lg:min-w-[280px] max-lg:shrink-0"
                    :class="{ 'bg-blue-50 outline outline-2 outline-gdc-blue -outline-offset-2': activeIndex === index }"
                    @click.prevent="selectVideo(video, index)"
                >
                    <!-- Thumbnail -->
                    <div
                        class="w-[120px] h-[68px] rounded-md shrink-0 relative overflow-hidden bg-cover bg-center"
                        :style="{ backgroundImage: `url('${video.thumb}')` }"
                    >
                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-red-600/90 rounded-full flex items-center justify-center">
                            <svg class="w-3 h-3 fill-gdc-white ml-[1px]" viewBox="0 0 24 24">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <span class="absolute bottom-1 right-1 bg-black/75 text-gdc-white text-[10px] font-semibold px-1.5 py-px rounded-sm">
                            {{ video.duration }}
                        </span>
                    </div>

                    <!-- Info -->
                    <div class="flex-1 flex flex-col justify-center">
                        <div class="text-[13px] font-semibold leading-[17px] text-gdc-black">{{ video.title }}</div>
                        <div class="text-xs text-gdc-deep-grey mt-1">{{ video.meta }}</div>
                    </div>
                </a>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'FeaturedVideoPlayer',
    props: {
        mainVideo: {
            type: Object,
            required: true,
        },
        sidebarVideos: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            currentVideo: { ...this.mainVideo },
            isPlaying: false,
            activeIndex: null,
        };
    },
    methods: {
        playMainVideo() {
            if (this.isPlaying) return;
            this.isPlaying = true;
        },
        selectVideo(video, index) {
            this.isPlaying = false;
            this.activeIndex = index;

            this.$nextTick(() => {
                this.currentVideo = { ...video };
                this.$nextTick(() => {
                    this.isPlaying = true;
                });
            });
        },
    },
};
</script>
