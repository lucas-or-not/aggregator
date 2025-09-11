<?php

namespace App\Jobs;

use App\Models\Article;
use App\Models\Author;
use App\Models\Category;
use App\Models\Source;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProcessArticleJob implements ShouldQueue
{
    use Queueable;

    protected array $articleData;

    protected int $sourceId;

    /**
     * Create a new job instance.
     */
    public function __construct(array $articleData, int $sourceId)
    {
        $this->articleData = $articleData;
        $this->sourceId = $sourceId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            DB::transaction(function () {
                $this->processArticle();
            });
        } catch (\Exception $e) {
            Log::error("Failed to process article: {$e->getMessage()}", [
                'article_data' => $this->articleData,
                'source_id' => $this->sourceId,
            ]);
            throw $e;
        }
    }

    protected function processArticle(): void
    {
        $source = Source::findOrFail($this->sourceId);

        // Check if article already exists
        $existingArticle = Article::where('source_id', $this->sourceId)
            ->where('source_article_id', $this->articleData['source_article_id'])
            ->first();

        if ($existingArticle) {
            Log::info('Article already exists, skipping', [
                'source_id' => $this->sourceId,
                'source_article_id' => $this->articleData['source_article_id'],
            ]);

            return;
        }

        // Find or create author
        $author = null;
        if (! empty($this->articleData['author'])) {
            $author = Author::firstOrCreate(
                ['canonical_name' => Str::slug($this->articleData['author'])],
                ['name' => $this->articleData['author']]
            );
        }

        // Find or create category
        $category = null;
        if (! empty($this->articleData['category'])) {
            $category = Category::firstOrCreate(
                ['slug' => Str::slug($this->articleData['category'])],
                ['name' => $this->articleData['category']]
            );
        }

        // Create article
        $article = Article::create([
            'source_id' => $this->sourceId,
            'source_article_id' => $this->articleData['source_article_id'],
            'title' => $this->articleData['title'],
            'slug' => Str::slug($this->articleData['title']),
            'excerpt' => $this->articleData['excerpt'],
            'content' => $this->sanitizeContent($this->articleData['content']),
            'url' => $this->articleData['url'],
            'image_url' => $this->articleData['image_url'],
            'author_id' => $author?->id,
            'category_id' => $category?->id,
            'published_at' => $this->articleData['published_at'],
            'scraped_at' => now(),
            'raw_payload' => $this->articleData['raw_payload'],
        ]);

        Log::info('Article processed successfully', [
            'article_id' => $article->id,
            'title' => $article->title,
        ]);
    }

    protected function sanitizeContent(string $content): string
    {
        // Basic HTML sanitization
        $content = strip_tags($content, '<p><br><strong><em><ul><ol><li><a><h1><h2><h3><h4><h5><h6>');

        // Remove any remaining script tags
        $content = preg_replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi', '', $content);

        return trim($content);
    }
}
