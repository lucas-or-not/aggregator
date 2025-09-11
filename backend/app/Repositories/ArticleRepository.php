<?php

namespace App\Repositories;

use App\Models\Article;
use App\Repositories\Contracts\ArticleRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
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

        // Use Meilisearch for all article listing and search
        $articles = Article::search($searchQuery, function ($meiliSearch, string $searchQuery, array $options) use ($request) {
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

            if (! empty($filters)) {
                $options['filter'] = implode(' AND ', $filters);
            }

            // Sort by published date descending (newest first)
            $options['sort'] = ['published_at_ts:desc'];

            return $meiliSearch->search($searchQuery, $options);
        })->paginate($perPage);

        // Load relationships for the articles
        $articles->getCollection()->load(['source', 'author', 'category']);

        // Add is_saved attribute for authenticated users
        if (Auth::check()) {
            $user = Auth::user();
            $savedArticleIds = $user->savedArticles()->pluck('article_id')->toArray();

            $articles->getCollection()->transform(function ($article) use ($savedArticleIds) {
                $article->is_saved = in_array($article->id, $savedArticleIds);

                return $article;
            });
        } else {
            $articles->getCollection()->transform(function ($article) {
                $article->is_saved = false;

                return $article;
            });
        }

        return $articles;
    }

    public function getSavedArticlesForUser(int $userId, int $perPage = 20): LengthAwarePaginator
    {
        $user = \App\Models\User::findOrFail($userId);

        return $user->savedArticles()
            ->with(['source', 'author', 'category'])
            ->orderBy('user_saved_articles.saved_at', 'desc')
            ->paginate($perPage);
    }

    public function isArticleSavedByUser(int $articleId, int $userId): bool
    {
        $user = \App\Models\User::findOrFail($userId);

        return $user->savedArticles()->where('article_id', $articleId)->exists();
    }

    public function saveArticleForUser(int $articleId, int $userId): void
    {
        $user = \App\Models\User::findOrFail($userId);

        if (! $user->savedArticles()->where('article_id', $articleId)->exists()) {
            $user->savedArticles()->attach($articleId, ['saved_at' => now()]);
        }
    }

    public function unsaveArticleForUser(int $articleId, int $userId): void
    {
        $user = \App\Models\User::findOrFail($userId);
        $user->savedArticles()->detach($articleId);
    }
}
