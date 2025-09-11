<?php

namespace App\Actions\Articles;

use App\Models\Article;
use App\Repositories\Contracts\ArticleRepositoryInterface;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class SaveArticle
{
    public function __construct(
        private ArticleRepositoryInterface $articleRepository
    ) {}

    public function execute(Article $article): array
    {
        $userId = Auth::id();

        if ($this->articleRepository->isArticleSavedByUser($article->id, $userId)) {
            throw new HttpResponseException(
                response()->json(['message' => 'Article already saved'], 400)
            );
        }

        $this->articleRepository->saveArticleForUser($article->id, $userId);

        return ['message' => 'Article saved successfully'];
    }
}
