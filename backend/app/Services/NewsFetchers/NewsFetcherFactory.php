<?php

namespace App\Services\NewsFetchers;

use App\Models\Source;
use Illuminate\Support\Facades\Log;

class NewsFetcherFactory
{
    protected static array $fetchers = [
        'newsapi' => NewsAPIFetcher::class,
        'guardian' => GuardianFetcher::class,
        'nytimes' => NYTimesFetcher::class,
        // Add more fetchers here as we implement them
    ];

    public static function create(Source $source): ?NewsFetcherInterface
    {
        $slug = $source->api_slug;

        // Check for exact match first
        if (isset(self::$fetchers[$slug])) {
            $fetcherClass = self::$fetchers[$slug];
        } else {
            // Check for prefix matches for category-specific sources
            $fetcherClass = null;
            foreach (self::$fetchers as $pattern => $class) {
                if (str_starts_with($slug, $pattern)) {
                    $fetcherClass = $class;
                    break;
                }
            }

            if (! $fetcherClass) {
                Log::error("No fetcher found for source slug: {$slug}");

                return null;
            }
        }

        try {
            return new $fetcherClass($source);
        } catch (\Exception $e) {
            Log::error("Failed to create fetcher for {$slug}: {$e->getMessage()}");

            return null;
        }
    }

    public static function registerFetcher(string $slug, string $fetcherClass): void
    {
        self::$fetchers[$slug] = $fetcherClass;
    }
}
