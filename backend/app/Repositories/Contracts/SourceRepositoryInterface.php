<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface SourceRepositoryInterface
{
    /**
     * Get all active sources
     */
    public function getActiveSources(): Collection;
}
