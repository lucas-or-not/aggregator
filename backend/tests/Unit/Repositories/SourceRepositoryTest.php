<?php

namespace Tests\Unit\Repositories;

use App\Models\Source;
use App\Repositories\SourceRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SourceRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private SourceRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new SourceRepository;
    }

    public function test_get_active_sources_returns_only_active_sources()
    {
        // Arrange
        Source::factory()->create(['name' => 'Active Source 1', 'is_active' => true]);
        Source::factory()->create(['name' => 'Active Source 2', 'is_active' => true]);
        Source::factory()->create(['name' => 'Inactive Source', 'is_active' => false]);

        // Act
        $result = $this->repository->getActiveSources();

        // Assert
        $this->assertCount(2, $result);
        $result->each(function ($source) {
            $this->assertTrue($source->is_active);
        });
    }

    public function test_get_active_sources_returns_empty_collection_when_no_active_sources()
    {
        // Arrange
        Source::factory()->create(['is_active' => false]);
        Source::factory()->create(['is_active' => false]);

        // Act
        $result = $this->repository->getActiveSources();

        // Assert
        $this->assertCount(0, $result);
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $result);
    }

    public function test_get_active_sources_returns_empty_collection_when_no_sources()
    {
        // Act
        $result = $this->repository->getActiveSources();

        // Assert
        $this->assertCount(0, $result);
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $result);
    }
}
