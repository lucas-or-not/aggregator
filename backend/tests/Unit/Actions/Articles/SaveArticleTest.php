<?php

namespace Tests\Unit\Actions\Articles;

use App\Actions\Articles\SaveArticle;
use App\Models\Article;
use App\Repositories\Contracts\ArticleRepositoryInterface;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;
use Mockery;
use Tests\TestCase;

class SaveArticleTest extends TestCase
{
    private $articleRepository;

    private SaveArticle $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->articleRepository = Mockery::mock(ArticleRepositoryInterface::class);
        $this->action = new SaveArticle($this->articleRepository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_execute_saves_article_successfully()
    {
        // Arrange
        $articleId = 1;
        $userId = 123;
        $article = new Article;
        $article->id = $articleId;

        Auth::shouldReceive('id')
            ->once()
            ->andReturn($userId);

        $this->articleRepository
            ->shouldReceive('isArticleSavedByUser')
            ->once()
            ->with($articleId, $userId)
            ->andReturn(false);

        $this->articleRepository
            ->shouldReceive('saveArticleForUser')
            ->once()
            ->with($articleId, $userId);

        // Act
        $result = $this->action->execute($article);

        // Assert
        $this->assertEquals(['message' => 'Article saved successfully'], $result);
    }

    public function test_execute_throws_exception_when_article_already_saved()
    {
        // Arrange
        $articleId = 1;
        $userId = 123;
        $article = new Article;
        $article->id = $articleId;

        Auth::shouldReceive('id')
            ->once()
            ->andReturn($userId);

        $this->articleRepository
            ->shouldReceive('isArticleSavedByUser')
            ->once()
            ->with($articleId, $userId)
            ->andReturn(true);

        $this->articleRepository
            ->shouldReceive('saveArticleForUser')
            ->never();

        // Act & Assert
        $this->expectException(HttpResponseException::class);
        $this->action->execute($article);
    }
}
