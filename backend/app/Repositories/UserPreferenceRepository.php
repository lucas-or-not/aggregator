<?php

namespace App\Repositories;

use App\Models\Article;
use App\Models\UserPreference;
use App\Repositories\Contracts\UserPreferenceRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class UserPreferenceRepository implements UserPreferenceRepositoryInterface
{
    public function getByUserId(int $userId): ?UserPreference
    {
        return UserPreference::where('user_id', $userId)->first();
    }

    public function create(array $data): UserPreference
    {
        return UserPreference::create([
            'user_id' => $data['user_id'],
            'preferred_sources' => $data['preferred_sources'] ?? [],
            'preferred_categories' => $data['preferred_categories'] ?? [],
            'preferred_authors' => $data['preferred_authors'] ?? [],
        ]);
    }

    public function update(int $userId, array $data): UserPreference
    {
        $preferences = $this->getByUserId($userId);

        if (! $preferences) {
            return $this->create(array_merge($data, ['user_id' => $userId]));
        }

        $preferences->update([
            'preferred_sources' => $data['preferred_sources'] ?? $preferences->preferred_sources,
            'preferred_categories' => $data['preferred_categories'] ?? $preferences->preferred_categories,
            'preferred_authors' => $data['preferred_authors'] ?? $preferences->preferred_authors,
        ]);

        return $preferences->fresh();
    }

    public function getPersonalizedFeed(int $userId, int $perPage = 20): LengthAwarePaginator
    {
        $preferences = $this->getByUserId($userId);

        $query = Article::with(['source', 'author', 'category'])
            ->leftJoin('user_saved_articles', function ($join) use ($userId) {
                $join->on('articles.id', '=', 'user_saved_articles.article_id')
                     ->where('user_saved_articles.user_id', '=', $userId);
            })
            ->select('articles.*', 'user_saved_articles.id as saved_id');

        // Apply user preferences
        if ($preferences) {
            if (! empty($preferences->preferred_sources)) {
                $query->whereIn('articles.source_id', $preferences->preferred_sources);
            }

            if (! empty($preferences->preferred_categories)) {
                $query->whereIn('articles.category_id', $preferences->preferred_categories);
            }

            if (! empty($preferences->preferred_authors)) {
                $query->whereIn('articles.author_id', $preferences->preferred_authors);
            }
        }

        // Order by published date
        $query->orderBy('articles.published_at', 'desc');

        $articles = $query->paginate($perPage);

        // Add is_saved attribute based on the JOIN result
        $articles->getCollection()->transform(function ($article) {
            $article->is_saved = !is_null($article->saved_id);
            unset($article->saved_id);
            return $article;
        });

        return $articles;
    }

    public function delete(int $userId): bool
    {
        $preferences = $this->getByUserId($userId);

        if (! $preferences) {
            return false;
        }

        return $preferences->delete();
    }
}
