<?php

namespace Tests\Unit\Actions\Articles;

use App\Actions\Articles\UnsaveArticle;
use App\Models\Article;
use App\Repositories\Contracts\ArticleRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Mockery;
use Tests\TestCase;

class UnsaveArticleTest extends TestCase
{
    private $articleRepository;

    private UnsaveArticle $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->articleRepository = Mockery::mock(ArticleRepositoryInterface::class);
        $this->action = new UnsaveArticle($this->articleRepository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_execute_unsaves_article_successfully()
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
            ->shouldReceive('unsaveArticleForUser')
            ->once()
            ->with($articleId, $userId);

        // Act
        $result = $this->action->execute($article);

        // Assert
        $this->assertEquals(['message' => 'Article unsaved successfully'], $result);
    }
}
