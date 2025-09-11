<?php

namespace App\Http\Controllers\Api;

use App\Actions\Articles\SaveArticle;
use App\Http\Controllers\Controller;
use App\Models\Article;
use Exception;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;

class SaveArticleController extends Controller
{
    public function __invoke(Request $request, Article $article, SaveArticle $saveArticle)
    {
        try {
            $result = $saveArticle->execute($article);

            return response()->json($result);
        } catch (HttpResponseException $e) {
            throw $e; // Re-throw HTTP exceptions to maintain proper status codes
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to save article',
            ], 500);
        }
    }
}
