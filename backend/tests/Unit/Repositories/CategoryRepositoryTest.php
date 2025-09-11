<?php

namespace Tests\Unit\Repositories;

use App\Models\Category;
use App\Repositories\CategoryRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private CategoryRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new CategoryRepository;
    }

    public function test_get_all_ordered_returns_categories_ordered_by_name()
    {
        // Arrange
        Category::factory()->create(['name' => 'Technology']);
        Category::factory()->create(['name' => 'Business']);
        Category::factory()->create(['name' => 'Sports']);

        // Act
        $result = $this->repository->getAllOrdered();

        // Assert
        $this->assertCount(3, $result);
        $this->assertEquals('Business', $result->first()->name);
        $this->assertEquals('Sports', $result->get(1)->name);
        $this->assertEquals('Technology', $result->last()->name);
    }

    public function test_get_all_ordered_returns_empty_collection_when_no_categories()
    {
        // Act
        $result = $this->repository->getAllOrdered();

        // Assert
        $this->assertCount(0, $result);
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $result);
    }
}
