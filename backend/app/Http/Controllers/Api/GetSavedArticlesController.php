<?php

namespace App\Http\Controllers\Api;

use App\Actions\Articles\GetSavedArticles;
use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class GetSavedArticlesController extends Controller
{
    public function __invoke(Request $request, GetSavedArticles $getSavedArticles)
    {
        try {
            $articles = $getSavedArticles->execute($request);

            return response()->json($articles);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve saved articles',
            ], 500);
        }
    }
}
