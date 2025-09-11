<?php

namespace App\Repositories;

use App\Models\Source;
use App\Repositories\Contracts\SourceRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SourceRepository implements SourceRepositoryInterface
{
    public function getActiveSources(): Collection
    {
        return Source::where('is_active', true)->get();
    }
}
