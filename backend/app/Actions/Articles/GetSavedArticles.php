<?php

namespace App\Actions\Articles;

use App\Repositories\Contracts\ArticleRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GetSavedArticles
{
    public function __construct(
        private ArticleRepositoryInterface $articleRepository
    ) {}

    public function execute(Request $request): LengthAwarePaginator
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $perPage = $request->get('per_page', 20);
        $userId = Auth::id();

        return $this->articleRepository->getSavedArticlesForUser($userId, $perPage);
    }
}
