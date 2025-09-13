<?php

namespace App\Actions\Metadata;

use App\Repositories\Contracts\ArticleRepositoryInterface;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GetFilteredMetadata
{
    public function __construct(
        private ArticleRepositoryInterface $articleRepository
    ) {}

    public function execute(Request $request): array
    {
        try {
            $searchQuery = $request->get('q');
            $sourceSlug = $request->get('source');
            $categorySlug = $request->get('category');
            $authorName = $request->get('author');
            
            $metadata = $this->articleRepository->getFilteredMetadata(
                $searchQuery,
                $sourceSlug,
                $categorySlug,
                $authorName
            );
            
            return [
                'success' => true,
                'data' => $metadata,
            ];
        } catch (Exception $e) {
            Log::error('Failed to get filtered metadata', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => 'Failed to retrieve filtered metadata',
            ];
        }
    }

}