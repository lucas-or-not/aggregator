<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Source;
use Illuminate\Database\Seeder;

class NewsAggregatorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create categories
        $categories = [
            'Technology',
            'Business',
            'Health',
            'Science',
            'Sports',
            'Entertainment',
            'Politics',
            'World',
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => strtolower($category)],
                ['name' => $category]
            );
        }

        // Create news sources for multiple categories
        $categories = ['technology', 'business', 'science', 'sports', 'entertainment'];

        // NewsAPI - supports multiple categories
        Source::firstOrCreate(
            ['api_slug' => 'newsapi'],
            [
                'name' => 'NewsAPI',
                'api_slug' => 'newsapi',
                'is_active' => true,
                'config' => [
                    'categories' => $categories,
                    'language' => 'en',
                    'days' => 30,
                ],
            ]
        );

        // The Guardian - single source for all sections
        Source::firstOrCreate(
            ['api_slug' => 'guardian'],
            [
                'name' => 'The Guardian',
                'api_slug' => 'guardian',
                'is_active' => true,
                'config' => [
                    'sections' => $categories,
                ],
            ]
        );

        // BBC RSS sources removed - using main API sources instead

        // NY Times - single source for all sections
        Source::firstOrCreate(
            ['api_slug' => 'nytimes'],
            [
                'name' => 'The New York Times',
                'api_slug' => 'nytimes',
                'is_active' => true,
                'config' => [
                    'sections' => ['home', 'technology', 'business', 'science', 'sports', 'arts', 'world', 'politics'],
                    'period' => 7, // For most popular API (1, 7, or 30 days)
                ],
            ]
        );
    }
}
