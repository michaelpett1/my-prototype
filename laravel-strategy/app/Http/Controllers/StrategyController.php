<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StrategyController extends Controller
{
    /**
     * Display the gambling strategy page.
     */
    public function index()
    {
        return view('pages.strategy', [
            'categories'      => $this->getCategories(),
            'mainVideo'       => $this->getMainVideo(),
            'sidebarVideos'   => $this->getSidebarVideos(),
            'casinoStrategy'  => $this->getCasinoStrategy(),
            'casinoGuides'    => $this->getCasinoGuides(),
            'bettingStrategy' => $this->getBettingStrategy(),
            'pokerStrategy'   => $this->getPokerStrategy(),
        ]);
    }

    /**
     * Hero category cards data.
     */
    private function getCategories(): array
    {
        return [
            [
                'id'    => 'casino-strategy',
                'label' => 'Casino Strategy',
                'image' => 'https://objects.kaxmedia.com/auto/o/106986/df49168be0.png',
            ],
            [
                'id'    => 'betting-strategy',
                'label' => 'Betting Strategy',
                'image' => 'https://objects.kaxmedia.com/genesis/betting-odds-strategy.webp',
            ],
            [
                'id'    => 'poker-strategy',
                'label' => 'Poker Strategy',
                'image' => 'https://objects.kaxmedia.com/genesis/how-to-play-stud-poker.webp',
            ],
        ];
    }

    /**
     * Main featured video data.
     */
    private function getMainVideo(): array
    {
        return [
            'videoId'  => 'DFAhFATiWAg',
            'thumb'    => 'https://img.youtube.com/vi/DFAhFATiWAg/maxresdefault.jpg',
            'title'    => 'Does the Martingale System Work? The Surprising Answer',
            'meta'     => '232K views',
            'duration' => '2:37',
        ];
    }

    /**
     * Sidebar featured videos data.
     */
    private function getSidebarVideos(): array
    {
        return [
            [
                'videoId'  => 'VKx2v4LSC5E',
                'thumb'    => 'https://img.youtube.com/vi/VKx2v4LSC5E/maxresdefault.jpg',
                'title'    => "Different Poker Games Explained (Hold'em, Omaha, Stud, Draw)",
                'meta'     => '92K views',
                'duration' => '2:47',
            ],
            [
                'videoId'  => '00pE8gr35ng',
                'thumb'    => 'https://img.youtube.com/vi/00pE8gr35ng/maxresdefault.jpg',
                'title'    => 'When Should You Double Down in Blackjack?',
                'meta'     => '16K views',
                'duration' => '1:59',
            ],
            [
                'videoId'  => 'rLTapLdh6CE',
                'thumb'    => 'https://img.youtube.com/vi/rLTapLdh6CE/maxresdefault.jpg',
                'title'    => "What is a 'Slow Roll' in Poker?",
                'meta'     => '16K views',
                'duration' => '1:47',
            ],
            [
                'videoId'  => '5Qf_17B_J6M',
                'thumb'    => 'https://img.youtube.com/vi/5Qf_17B_J6M/maxresdefault.jpg',
                'title'    => 'Learn How to Play Craps in Under 5 Minutes',
                'meta'     => '16K views',
                'duration' => '4:29',
            ],
            [
                'videoId'  => 'USjba19SVlg',
                'thumb'    => 'https://img.youtube.com/vi/USjba19SVlg/maxresdefault.jpg',
                'title'    => 'Different Types of Poker Rake Explained',
                'meta'     => '16K views',
                'duration' => '2:35',
            ],
        ];
    }

    /**
     * Casino strategy articles data.
     */
    private function getCasinoStrategy(): array
    {
        return [
            [
                'title' => 'Blackjack Strategy: The Ultimate Guide to Online Blackjack',
                'url'   => 'https://www.gambling.com/uk/online-casinos/strategy/blackjack-strategy-the-ultimate-guide-to-online-blackjack-2481500',
                'image' => 'https://objects.kaxmedia.com/auto/o/106986/df49168be0.png',
            ],
            [
                'title' => 'Roulette Strategy: Odds and Payouts',
                'url'   => 'https://www.gambling.com/uk/online-casinos/strategy/roulette-strategy-odds-and-payouts-32400',
                'image' => 'https://objects.kaxmedia.com/auto/o/2038/46e216d6f6.jpeg',
            ],
            [
                'title' => 'Craps Odds Explained',
                'url'   => 'https://www.gambling.com/uk/online-casinos/strategy/craps-odds-explained-28200',
                'image' => 'https://objects.kaxmedia.com/auto/o/2025/985f5da2b8.jpeg',
            ],
            [
                'title' => 'Blackjack Strategy: When to Double Down',
                'url'   => 'https://www.gambling.com/uk/online-casinos/strategy/blackjack-strategy-when-to-double-down-23100',
                'image' => 'https://objects.kaxmedia.com/auto/o/2018/cf58943f9c.jpeg',
            ],
            [
                'title' => 'Card Counting: What It Is and How It Works',
                'url'   => 'https://www.gambling.com/uk/online-casinos/strategy/card-counting-what-it-is-and-how-it-works',
                'image' => 'https://objects.kaxmedia.com/genesis/counting-cards.jpeg',
            ],
            [
                'title' => 'The Martingale System: A Betting Strategy to Avoid',
                'url'   => 'https://www.gambling.com/uk/online-casinos/strategy/the-martingale-system-a-betting-strategy-to-avoid-6200',
                'image' => 'https://objects.kaxmedia.com/auto/o/35407/5415dd9044.png',
            ],
        ];
    }

    /**
     * Casino guides articles data.
     */
    private function getCasinoGuides(): array
    {
        return [
            [
                'title' => 'Five of the Best Casinos in London',
                'url'   => 'https://www.gambling.com/uk/online-casinos/strategy/five-of-the-best-casinos-in-london-26300',
                'image' => 'https://objects.kaxmedia.com/auto/o/2021/34ebcf26e5.png',
            ],
            [
                'title' => '12 Days of Christmas Slots',
                'url'   => 'https://www.gambling.com/uk/online-casinos/strategy/12-days-of-christmas-slots-610600',
                'image' => 'https://objects.kaxmedia.com/genesis/image-feature-main-6257.png',
            ],
            [
                'title' => "A Beginner's Guide to the World of Land Casinos",
                'url'   => 'https://www.gambling.com/uk/online-casinos/strategy/a-beginner-s-guide-to-the-world-of-land-casinos-8500',
                'image' => 'https://objects.kaxmedia.com/auto/o/1943/2954bbc792.jpeg',
            ],
            [
                'title' => 'Top 10 Casinos in the World',
                'url'   => 'https://www.gambling.com/uk/online-casinos/strategy/top-10-casinos-in-the-world-38000',
                'image' => 'https://objects.kaxmedia.com/auto/o/2041/bbc793b034.jpeg',
            ],
            [
                'title' => '10 Casino Games With the Lowest House Edge',
                'url'   => 'https://www.gambling.com/uk/online-casinos/strategy/10-casino-games-with-the-lowest-house-edge-2787900',
                'image' => 'https://objects.kaxmedia.com/auto/o/2006/22ff69cc7a.png',
            ],
            [
                'title' => 'What Is Return to Player?',
                'url'   => 'https://www.gambling.com/uk/online-casinos/strategy/what-is-return-to-player-2092400',
                'image' => 'https://objects.kaxmedia.com/auto/o/79309/d991479932.png',
            ],
        ];
    }

    /**
     * Betting strategy articles data.
     */
    private function getBettingStrategy(): array
    {
        return [
            [
                'title' => 'How do Betting Odds Work?',
                'url'   => 'https://www.gambling.com/strategy/betting/how-odds-work',
                'image' => 'https://objects.kaxmedia.com/genesis/betting-odds-strategy.webp',
            ],
            [
                'title' => 'Best Football Betting Strategies',
                'url'   => 'https://www.gambling.com/strategy/betting/football',
                'image' => 'https://objects.kaxmedia.com/genesis/football-strategy.webp',
            ],
            [
                'title' => 'Horse Racing Betting Strategies',
                'url'   => 'https://www.gambling.com/strategy/betting/horse-racing',
                'image' => 'https://objects.kaxmedia.com/genesis/horse-racing-betting-strategy-guide.webp',
            ],
            [
                'title' => 'Mastering Parlay Betting',
                'url'   => 'https://www.gambling.com/strategy/betting/parlay',
                'image' => 'https://objects.kaxmedia.com/genesis/parlay-betting.webp',
            ],
            [
                'title' => 'Each-Way Betting: How It Works',
                'url'   => 'https://www.gambling.com/strategy/betting/each-way-bet',
                'image' => 'https://objects.kaxmedia.com/genesis/each-way-betting-strategies-guide.webp',
            ],
            [
                'title' => 'Arbitrage Betting Strategy',
                'url'   => 'https://www.gambling.com/strategy/betting/arbitrage',
                'image' => 'https://objects.kaxmedia.com/genesis/arbitrage-betting-strategy.webp',
            ],
        ];
    }

    /**
     * Poker strategy articles data.
     */
    private function getPokerStrategy(): array
    {
        return [
            [
                'title' => 'Poker Basics: Starting Hands',
                'url'   => 'https://www.gambling.com/strategy/online-poker/poker-basics-starting-hands',
                'image' => 'https://objects.kaxmedia.com/genesis/how-to-play-stud-poker.webp',
            ],
            [
                'title' => 'Explaining Pocket Pairs and How to Play Them',
                'url'   => 'https://www.gambling.com/strategy/online-poker/explaining-pocket-pairs-and-how-to-play-them',
                'image' => 'https://objects.kaxmedia.com/genesis/pocket-pairs.jpg',
            ],
            [
                'title' => 'Tips for Bluffing in Poker',
                'url'   => 'https://www.gambling.com/strategy/online-poker/tips-for-bluffing-in-poker',
                'image' => 'https://objects.kaxmedia.com/genesis/bluffing-poster.jpg',
            ],
            [
                'title' => 'Poker Strategy: The Power of Position',
                'url'   => 'https://www.gambling.com/strategy/online-poker/poker-strategy-the-power-of-position',
                'image' => 'https://objects.kaxmedia.com/genesis/money-on-table.jpg',
            ],
            [
                'title' => 'Poker Math: Calculating Pot Odds For Beginners',
                'url'   => 'https://www.gambling.com/strategy/online-poker/poker-math-calculating-texas-hold-em-poker-pot-odds-for-beginners',
                'image' => 'https://objects.kaxmedia.com/genesis/math-calculation.jpg',
            ],
            [
                'title' => 'The Benefits of Effective Poker Bankroll Management',
                'url'   => 'https://www.gambling.com/strategy/online-poker/the-benefits-of-effective-poker-bankroll-management',
                'image' => 'https://objects.kaxmedia.com/genesis/poker-bankroll-management.jpg',
            ],
        ];
    }
}
