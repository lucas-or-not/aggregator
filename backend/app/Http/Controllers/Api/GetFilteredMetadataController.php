<?php

namespace App\Http\Controllers\Api;

use App\Actions\Metadata\GetFilteredMetadata;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GetFilteredMetadataController extends Controller
{
    public function __invoke(Request $request, GetFilteredMetadata $getFilteredMetadata)
    {
        $result = $getFilteredMetadata->execute($request);

        if (!$result['success']) {
            return response()->json($result, 500);
        }

        return response()->json($result);
    }
}