import { createApp } from 'vue';

// Import Vue Components
import SiteHeader from './components/SiteHeader.vue';
import SiteFooter from './components/SiteFooter.vue';
import CategoryCards from './components/CategoryCards.vue';
import FeaturedVideoPlayer from './components/FeaturedVideoPlayer.vue';
import ArticleCarousel from './components/ArticleCarousel.vue';

// Create Vue App
const app = createApp({});

// Register Components Globally
app.component('site-header', SiteHeader);
app.component('site-footer', SiteFooter);
app.component('category-cards', CategoryCards);
app.component('featured-video-player', FeaturedVideoPlayer);
app.component('article-carousel', ArticleCarousel);

// Mount the App
app.mount('#app');
