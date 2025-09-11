<?php

namespace App\Http\Controllers\Api;

use App\Actions\Articles\UnsaveArticle;
use App\Http\Controllers\Controller;
use App\Models\Article;
use Exception;
use Illuminate\Http\Request;

class UnsaveArticleController extends Controller
{
    public function __invoke(Request $request, Article $article, UnsaveArticle $unsaveArticle)
    {
        try {
            $result = $unsaveArticle->execute($article);

            return response()->json($result);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to unsave article',
            ], 500);
        }
    }
}
