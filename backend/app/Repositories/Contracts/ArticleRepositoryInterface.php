<?php

namespace App\Repositories\Contracts;

use App\Models\Article;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

interface ArticleRepositoryInterface
{
    /**
     * Find an article by ID with relationships
     */
    public function findWithRelations(int $id): ?Article;

    /**
     * Search articles with filters and pagination
     */
    public function search(Request $request): LengthAwarePaginator;

    /**
     * Get saved articles for a user
     */
    public function getSavedArticlesForUser(int $userId, int $perPage = 20): LengthAwarePaginator;

    /**
     * Check if user has saved an article
     */
    public function isArticleSavedByUser(int $articleId, int $userId): bool;

    /**
     * Save an article for a user
     */
    public function saveArticleForUser(int $articleId, int $userId): void;

    /**
     * Unsave an article for a user
     */
    public function unsaveArticleForUser(int $articleId, int $userId): void;
}
