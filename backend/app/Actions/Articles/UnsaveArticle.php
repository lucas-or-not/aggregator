<?php

namespace App\Actions\Articles;

use App\Models\Article;
use App\Repositories\Contracts\ArticleRepositoryInterface;
use Illuminate\Support\Facades\Auth;

class UnsaveArticle
{
    public function __construct(
        private ArticleRepositoryInterface $articleRepository
    ) {}

    public function execute(Article $article): array
    {
        $userId = Auth::id();

        $this->articleRepository->unsaveArticleForUser($article->id, $userId);

        return ['message' => 'Article unsaved successfully'];
    }
}
