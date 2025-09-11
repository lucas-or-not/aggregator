<?php

namespace Tests\Unit\Actions\Articles;

use App\Actions\Articles\ShowArticle;
use App\Models\Article;
use App\Models\User;
use App\Repositories\Contracts\ArticleRepositoryInterface;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Mockery;
use Tests\TestCase;

class ShowArticleTest extends TestCase
{
    private $articleRepository;

    private ShowArticle $action;

    private $request;

    protected function setUp(): void
    {
        parent::setUp();
        $this->articleRepository = Mockery::mock(ArticleRepositoryInterface::class);
        $this->request = Mockery::mock(Request::class);
        $this->action = new ShowArticle($this->articleRepository);
        Log::shouldReceive('error')->byDefault();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_execute_returns_success_with_article_and_saved_status()
    {
        // Arrange
        $articleId = 1;
        $userId = 123;
        $article = new Article;
        $article->id = $articleId;
        $article->title = 'Test Article';
        $article->content = 'Test content';

        $user = new User;
        $user->id = $userId;
        $this->request
            ->shouldReceive('user')
            ->once()
            ->andReturn($user);

        $this->articleRepository
            ->shouldReceive('findWithRelations')
            ->with($articleId, ['source', 'author', 'category'])
            ->once()
            ->andReturn($article);

        $this->articleRepository
            ->shouldReceive('isArticleSavedByUser')
            ->with($articleId, $userId)
            ->once()
            ->andReturn(true);

        // Act
        $result = $this->action->execute($this->request, $articleId);

        // Assert
        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('data', $result);
        $this->assertEquals($article, $result['data']['article']);
        $this->assertTrue($result['data']['is_saved']);
    }

    public function test_execute_returns_success_with_article_not_saved()
    {
        // Arrange
        $articleId = 1;
        $userId = 123;
        $article = new Article;
        $article->id = $articleId;
        $article->title = 'Test Article';
        $article->content = 'Test content';

        $user = new User;
        $user->id = $userId;
        $this->request
            ->shouldReceive('user')
            ->once()
            ->andReturn($user);

        $this->articleRepository
            ->shouldReceive('findWithRelations')
            ->with($articleId, ['source', 'author', 'category'])
            ->once()
            ->andReturn($article);

        $this->articleRepository
            ->shouldReceive('isArticleSavedByUser')
            ->with($articleId, $userId)
            ->once()
            ->andReturn(false);

        // Act
        $result = $this->action->execute($this->request, $articleId);

        // Assert
        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('data', $result);
        $this->assertEquals($article, $result['data']['article']);
        $this->assertFalse($result['data']['is_saved']);
    }

    public function test_execute_returns_error_when_article_not_found()
    {
        // Arrange
        $articleId = 999;
        $userId = 123;

        $this->articleRepository
            ->shouldReceive('findWithRelations')
            ->with($articleId, ['source', 'author', 'category'])
            ->once()
            ->andReturn(null);

        // user() should not be called when article is not found
        $this->request
            ->shouldReceive('user')
            ->never();

        // Act
        $result = $this->action->execute($this->request, $articleId);

        // Assert
        $this->assertFalse($result['success']);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Article not found', $result['error']);
    }

    public function test_execute_handles_repository_exception()
    {
        // Arrange
        $articleId = 1;
        $userId = 123;

        $this->articleRepository
            ->shouldReceive('findWithRelations')
            ->with($articleId, ['source', 'author', 'category'])
            ->once()
            ->andThrow(new Exception('Database connection failed'));

        // user() should not be called when repository throws exception
        $this->request
            ->shouldReceive('user')
            ->never();

        // Act
        $result = $this->action->execute($this->request, $articleId);

        // Assert
        $this->assertFalse($result['success']);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Failed to retrieve article', $result['error']);
    }

    public function test_execute_logs_error_on_exception()
    {
        // Arrange
        $articleId = 1;
        $userId = 123;
        $exception = new Exception('Database error');

        $this->articleRepository
            ->shouldReceive('findWithRelations')
            ->with($articleId, ['source', 'author', 'category'])
            ->once()
            ->andThrow($exception);

        // user() should not be called when repository throws exception
        $this->request
            ->shouldReceive('user')
            ->never();

        // Mock the Log facade
        \Log::shouldReceive('error')
            ->once()
            ->with('Failed to show article', [
                'article_id' => $articleId,
                'error' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);

        // Act
        $result = $this->action->execute($this->request, $articleId);

        // Assert
        $this->assertFalse($result['success']);
    }
}
