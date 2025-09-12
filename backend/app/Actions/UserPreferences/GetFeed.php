<?php

namespace App\Actions\UserPreferences;

use App\Repositories\Contracts\UserPreferenceRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class GetFeed
{
    public function __construct(
        private UserPreferenceRepositoryInterface $userPreferenceRepository
    ) {}

    public function execute(Request $request): LengthAwarePaginator
    {
        $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
        ]);

        $userId = Auth::id();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 10);

        return $this->userPreferenceRepository->getPersonalizedFeed($userId, $perPage);
    }
}
