<?php

namespace App\Repositories;

use App\Models\Article;
use App\Repositories\Contracts\ArticleRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ArticleRepository implements ArticleRepositoryInterface
{
    public function findWithRelations(int $id): ?Article
    {
        return Article::with(['source', 'author', 'category'])->find($id);
    }

    public function search(Request $request): LengthAwarePaginator
    {
        $perPage = $request->get('per_page', 20);
        $searchQuery = $request->get('q', '') ?? '';

        $articles = Article::search($searchQuery, function ($meiliSearch, string $searchQuery, array $options) use ($request) {
            $filters = $this->buildSearchFilters($request);

            if (! empty($filters)) {
                $options['filter'] = implode(' AND ', $filters);
            }

            $options['sort'] = ['published_at_ts:desc'];

            return $meiliSearch->search($searchQuery, $options);
        })->paginate($perPage);

        $this->loadMissingAndSavedStatus($articles);

        return $articles;
    }

    public function getSavedArticlesForUser(int $userId, int $perPage = 20): LengthAwarePaginator
    {
        $user = User::findOrFail($userId);

        return $user->savedArticles()
            ->with(['source', 'author', 'category'])
            ->orderBy('user_saved_articles.saved_at', 'desc')
            ->paginate($perPage);
    }

    public function isArticleSavedByUser(int $articleId, int $userId): bool
    {
        $user = User::findOrFail($userId);

        return $user->savedArticles()->where('article_id', $articleId)->exists();
    }

    public function saveArticleForUser(int $articleId, int $userId): void
    {
        $user = User::findOrFail($userId);

        if (! $user->savedArticles()->where('article_id', $articleId)->exists()) {
            $user->savedArticles()->attach($articleId, ['saved_at' => now()]);
        }
    }

    public function unsaveArticleForUser(int $articleId, int $userId): void
    {
        $user = User::findOrFail($userId);
        $user->savedArticles()->detach($articleId);
    }

    public function findBySourceAndSourceArticleId(int $sourceId, string $sourceArticleId): ?Article
    {
        return Article::where('source_id', $sourceId)
            ->where('source_article_id', $sourceArticleId)
            ->first();
    }

    public function create(array $data): Article
    {
        return Article::create($data);
    }

    public function getFilteredMetadata(?string $searchQuery = null, ?string $sourceSlug = null, ?string $categorySlug = null, ?string $authorName = null): array
    {
        $searchQuery = $searchQuery ?? '';
        
        // Build base filters (source only)
        $baseFilters = [];
        if ($sourceSlug) {
            $baseFilters[] = 'source_slug = "' . $sourceSlug . '"';
        }
        
        // For categories: include source and author filters, but not category
        $categoryFilters = $baseFilters;
        if ($authorName) {
            $categoryFilters[] = 'author_name = "' . $authorName . '"';
        }
        
        // For authors: include source and category filters, but not author
        $authorFilters = $baseFilters;
        if ($categorySlug) {
            $authorFilters[] = 'category_slug = "' . $categorySlug . '"';
        }
        
        // Get category and author facets
        $categoryResults = $this->searchWithFilters($searchQuery, $categoryFilters, ['category_slug', 'category_name']);
        $authorResults = $this->searchWithFilters($searchQuery, $authorFilters, ['author_name']);
        
        $categoryFacetDistribution = $categoryResults->raw()['facetDistribution'] ?? [];
        $authorFacetDistribution = $authorResults->raw()['facetDistribution'] ?? [];
        
        return [
            'categories' => $this->extractCategories($categoryFacetDistribution),
            'authors' => $this->extractAuthors($authorFacetDistribution),
            'validation' => $this->validateFilters($searchQuery, $sourceSlug, $categorySlug, $authorName),
        ];
    }
    
    private function validateFilters(?string $searchQuery, ?string $sourceSlug, ?string $categorySlug, ?string $authorName): array
    {
        $validation = [
            'categoryExists' => true,
            'authorExists' => true,
        ];
        
        // Check if category exists for current filters
        if ($categorySlug && ($sourceSlug || $authorName)) {
            $validation['categoryExists'] = $this->categoryExistsForFilters($searchQuery, $sourceSlug, $categorySlug, $authorName);
        }
        
        // Check if author exists for current filters  
        if ($authorName && ($sourceSlug || $categorySlug)) {
            $validation['authorExists'] = $this->authorExistsForFilters($searchQuery, $sourceSlug, $categorySlug, $authorName);
        }
        
        return $validation;
    }
    
    private function categoryExistsForFilters(?string $searchQuery, ?string $sourceSlug, string $categorySlug, ?string $authorName): bool
    {
        $filters = $this->buildFilterArray([
            'category_slug' => $categorySlug,
            'source_slug' => $sourceSlug,
            'author_name' => $authorName,
        ]);
        
        return $this->existsWithFilters($searchQuery, $filters);
    }
    
    private function authorExistsForFilters(?string $searchQuery, ?string $sourceSlug, ?string $categorySlug, string $authorName): bool
    {
        $filters = $this->buildFilterArray([
            'author_name' => $authorName,
            'source_slug' => $sourceSlug,
            'category_slug' => $categorySlug,
        ]);
        
        return $this->existsWithFilters($searchQuery, $filters);
    }
    
    private function extractCategories(array $facetDistribution): array
    {
        $categories = [];
        
        if (isset($facetDistribution['category_slug'])) {
            foreach ($facetDistribution['category_slug'] as $slug => $count) {
                if ($count > 0 && $slug) {
                    // Get category name from a sample article
                    $sampleArticle = $this->searchWithFilters('', ['category_slug = "' . $slug . '"'], [], 1)->first();
                    
                    if ($sampleArticle && $sampleArticle->category) {
                        $categories[] = [
                            'value' => $slug,
                            'label' => $sampleArticle->category->name,
                            'count' => $count,
                        ];
                    }
                }
            }
        }
        
        usort($categories, fn($a, $b) => strcmp($a['label'], $b['label']));
        return $categories;
    }
    
    private function extractAuthors(array $facetDistribution): array
    {
        $authors = [];
        
        if (isset($facetDistribution['author_name'])) {
            foreach ($facetDistribution['author_name'] as $name => $count) {
                if ($count > 0 && $name) {
                    $authors[] = [
                        'value' => $name,
                        'label' => $name,
                        'count' => $count,
                    ];
                }
            }
        }
        
        usort($authors, fn($a, $b) => strcmp($a['label'], $b['label']));
        return $authors;
    }

    /**
     * Build search filters from request parameters
     */
    private function buildSearchFilters(Request $request): array
    {
        $filters = [];

        // Handle source filtering
        if ($request->filled('source')) {
            $filters[] = 'source_slug = "'.$request->source.'"';
        }

        // Handle category filtering
        if ($request->filled('category')) {
            $filters[] = 'category_slug = "'.$request->category.'"';
        }

        // Handle author filtering
        if ($request->filled('author')) {
            $filters[] = 'author_name = "'.$request->author.'"';
        }

        // Handle date range filtering
        if ($request->filled('date_from') || $request->filled('date_to')) {
            $fromTs = $request->filled('date_from') ? strtotime($request->date_from.' 00:00:00') : null;
            $toTs = $request->filled('date_to') ? strtotime($request->date_to.' 23:59:59') : null;

            if ($fromTs && $toTs && $fromTs > $toTs) {
                // Swap if user provided reversed range
                [$fromTs, $toTs] = [$toTs, $fromTs];
            }

            if ($fromTs) {
                $filters[] = 'published_at_ts >= '.$fromTs;
            }

            if ($toTs) {
                $filters[] = 'published_at_ts <= '.$toTs;
            }
        }

        return $filters;
    }

    /**
     * Add saved status to articles collection
     */
    private function loadMissingAndSavedStatus(LengthAwarePaginator $articles): void
    {
        $articles->getCollection()->load(['source', 'author', 'category']);

        $savedArticleIds = [];
        $user = Auth::guard('sanctum')->user();

        if ($user) {
            $savedArticleIds = $user
                ->savedArticles()
                ->pluck('article_id')
                ->all();
        }

        $savedLookup = array_flip($savedArticleIds);

        $articles->getCollection()->transform(function ($article) use ($savedLookup) {
            $article->is_saved = isset($savedLookup[$article->id]);
            return $article;
        });
    }


    /**
     * Perform search with filters and facets
     */
    private function searchWithFilters(string $searchQuery, array $filters, array $facets = [], int $limit = 0)
    {
        return Article::search($searchQuery, function ($meiliSearch, string $searchQuery, array $options) use ($filters, $facets, $limit) {
            if (!empty($filters)) {
                $options['filter'] = implode(' AND ', $filters);
            }
            
            if (!empty($facets)) {
                $options['facets'] = $facets;
            }
            
            $options['limit'] = $limit;
            
            return $meiliSearch->search($searchQuery, $options);
        });
    }

    /**
     * Build filter array from key-value pairs, excluding null values
     */
    private function buildFilterArray(array $filterData): array
    {
        $filters = [];
        
        foreach ($filterData as $field => $value) {
            if ($value !== null) {
                $filters[] = $field . ' = "' . $value . '"';
            }
        }
        
        return $filters;
    }

    /**
     * Check if any articles exist with the given filters
     */
    private function existsWithFilters(?string $searchQuery, array $filters): bool
    {
        $results = $this->searchWithFilters($searchQuery ?? '', $filters, [], 1);
        return $results->get()->count() > 0;
    }
}
