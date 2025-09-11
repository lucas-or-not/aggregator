<?php

namespace Tests\Unit\Repositories;

use App\Models\Author;
use App\Repositories\AuthorRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private AuthorRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new AuthorRepository;
    }

    public function test_get_all_ordered_returns_authors_ordered_by_name()
    {
        // Arrange
        Author::factory()->create(['name' => 'John Smith']);
        Author::factory()->create(['name' => 'Alice Johnson']);
        Author::factory()->create(['name' => 'Bob Wilson']);

        // Act
        $result = $this->repository->getAllOrdered();

        // Assert
        $this->assertCount(3, $result);
        $this->assertEquals('Alice Johnson', $result->first()->name);
        $this->assertEquals('Bob Wilson', $result->get(1)->name);
        $this->assertEquals('John Smith', $result->last()->name);
    }

    public function test_get_all_ordered_returns_empty_collection_when_no_authors()
    {
        // Act
        $result = $this->repository->getAllOrdered();

        // Assert
        $this->assertCount(0, $result);
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $result);
    }
}
