<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface AuthorRepositoryInterface
{
    /**
     * Get all authors ordered by name
     */
    public function getAllOrdered(): Collection;
}
