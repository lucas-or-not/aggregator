<?php

namespace Tests\Unit\Actions\Articles;

use App\Actions\Articles\GetSavedArticles;
use App\Repositories\Contracts\ArticleRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Mockery;
use Tests\TestCase;

class GetSavedArticlesTest extends TestCase
{
    private $articleRepository;

    private GetSavedArticles $action;

    private $request;

    protected function setUp(): void
    {
        parent::setUp();
        $this->articleRepository = Mockery::mock(ArticleRepositoryInterface::class);
        $this->request = Mockery::mock(Request::class);
        $this->action = new GetSavedArticles($this->articleRepository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_execute_returns_saved_articles_with_default_pagination()
    {
        // Arrange
        $userId = 123;
        $perPage = 20;
        $paginatedArticles = Mockery::mock(LengthAwarePaginator::class);

        $this->request
            ->shouldReceive('validate')
            ->once()
            ->with(['per_page' => 'nullable|integer|min:1|max:100']);

        $this->request
            ->shouldReceive('get')
            ->once()
            ->with('per_page', 20)
            ->andReturn($perPage);

        Auth::shouldReceive('id')
            ->once()
            ->andReturn($userId);

        $this->articleRepository
            ->shouldReceive('getSavedArticlesForUser')
            ->once()
            ->with($userId, $perPage)
            ->andReturn($paginatedArticles);

        // Act
        $result = $this->action->execute($this->request);

        // Assert
        $this->assertSame($paginatedArticles, $result);
    }

    public function test_execute_returns_saved_articles_with_custom_pagination()
    {
        // Arrange
        $userId = 123;
        $perPage = 50;
        $paginatedArticles = Mockery::mock(LengthAwarePaginator::class);

        $this->request
            ->shouldReceive('validate')
            ->once()
            ->with(['per_page' => 'nullable|integer|min:1|max:100']);

        $this->request
            ->shouldReceive('get')
            ->once()
            ->with('per_page', 20)
            ->andReturn($perPage);

        Auth::shouldReceive('id')
            ->once()
            ->andReturn($userId);

        $this->articleRepository
            ->shouldReceive('getSavedArticlesForUser')
            ->once()
            ->with($userId, $perPage)
            ->andReturn($paginatedArticles);

        // Act
        $result = $this->action->execute($this->request);

        // Assert
        $this->assertSame($paginatedArticles, $result);
    }
}
