<?php

namespace App\Console\Commands;

use App\Jobs\ProcessArticleJob;
use App\Models\Source;
use App\Services\NewsFetchers\NewsFetcherFactory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FetchArticlesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fetch:articles {--source= : Fetch from specific source}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch articles from all active news sources';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting article fetch process...');

        $sources = $this->getSources();

        if ($sources->isEmpty()) {
            $this->warn('No active sources found.');

            return;
        }

        $totalArticles = 0;

        foreach ($sources as $source) {
            $this->info("Fetching articles from: {$source->name}");

            $fetcher = NewsFetcherFactory::create($source);
            if (! $fetcher) {
                $this->error("Failed to create fetcher for: {$source->name}");

                continue;
            }

            try {
                $articles = $fetcher->fetchArticles();
                $this->info('Found '.count($articles)." articles from {$source->name}");

                foreach ($articles as $articleData) {
                    ProcessArticleJob::dispatch($articleData, $source->id);
                    $totalArticles++;
                }

            } catch (\Exception $e) {
                $this->error("Error fetching from {$source->name}: {$e->getMessage()}");
                Log::error("Fetch error for {$source->name}", [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        $this->info("Queued {$totalArticles} articles for processing.");
    }

    protected function getSources()
    {
        $query = Source::where('is_active', true);

        if ($sourceSlug = $this->option('source')) {
            $query->where('api_slug', $sourceSlug);
        }

        return $query->get();
    }
}
