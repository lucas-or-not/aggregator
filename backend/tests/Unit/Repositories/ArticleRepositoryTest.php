<?php

namespace Tests\Unit\Repositories;

use App\Models\Article;
use App\Models\User;
use App\Repositories\ArticleRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class ArticleRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private ArticleRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new ArticleRepository;
    }

    public function test_find_with_relations_returns_article_with_relationships()
    {
        // Arrange
        $article = Article::factory()->create();

        // Act
        $result = $this->repository->findWithRelations($article->id);

        // Assert
        $this->assertNotNull($result);
        $this->assertEquals($article->id, $result->id);
        $this->assertTrue($result->relationLoaded('source'));
        $this->assertTrue($result->relationLoaded('author'));
        $this->assertTrue($result->relationLoaded('category'));
    }

    public function test_find_with_relations_returns_null_for_nonexistent_article()
    {
        // Act
        $result = $this->repository->findWithRelations(999);

        // Assert
        $this->assertNull($result);
    }

    public function test_search_returns_paginated_results()
    {
        // Arrange
        Article::factory()->count(5)->create();
        $request = new Request(['per_page' => 3]);

        // Act
        $result = $this->repository->search($request);

        // Assert
        $this->assertEquals(3, $result->perPage());
        $this->assertLessThanOrEqual(3, $result->count());
    }

    public function test_get_saved_articles_for_user_returns_paginated_results()
    {
        // Arrange
        $user = User::factory()->create();
        $articles = Article::factory()->count(3)->create();

        // Save articles for user
        foreach ($articles as $article) {
            $user->savedArticles()->attach($article->id, ['saved_at' => now()]);
        }

        // Act
        $result = $this->repository->getSavedArticlesForUser($user->id, 10);

        // Assert
        $this->assertEquals(3, $result->total());
        $this->assertEquals(10, $result->perPage());
    }

    public function test_is_article_saved_by_user_returns_true_when_saved()
    {
        // Arrange
        $user = User::factory()->create();
        $article = Article::factory()->create();
        $user->savedArticles()->attach($article->id, ['saved_at' => now()]);

        // Act
        $result = $this->repository->isArticleSavedByUser($article->id, $user->id);

        // Assert
        $this->assertTrue($result);
    }

    public function test_is_article_saved_by_user_returns_false_when_not_saved()
    {
        // Arrange
        $user = User::factory()->create();
        $article = Article::factory()->create();

        // Act
        $result = $this->repository->isArticleSavedByUser($article->id, $user->id);

        // Assert
        $this->assertFalse($result);
    }

    public function test_save_article_for_user_saves_article()
    {
        // Arrange
        $user = User::factory()->create();
        $article = Article::factory()->create();

        // Act
        $this->repository->saveArticleForUser($article->id, $user->id);

        // Assert
        $this->assertTrue($user->savedArticles()->where('article_id', $article->id)->exists());
    }

    public function test_save_article_for_user_does_not_duplicate_saves()
    {
        // Arrange
        $user = User::factory()->create();
        $article = Article::factory()->create();

        // Act
        $this->repository->saveArticleForUser($article->id, $user->id);
        $this->repository->saveArticleForUser($article->id, $user->id); // Save again

        // Assert
        $this->assertEquals(1, $user->savedArticles()->where('article_id', $article->id)->count());
    }

    public function test_unsave_article_for_user_removes_saved_article()
    {
        // Arrange
        $user = User::factory()->create();
        $article = Article::factory()->create();
        $user->savedArticles()->attach($article->id, ['saved_at' => now()]);

        // Act
        $this->repository->unsaveArticleForUser($article->id, $user->id);

        // Assert
        $this->assertFalse($user->savedArticles()->where('article_id', $article->id)->exists());
    }

    public function test_find_by_source_and_source_article_id_finds_existing_article()
    {
        // Arrange
        $source = \App\Models\Source::factory()->create();
        $article = Article::factory()->create([
            'source_id' => $source->id,
            'source_article_id' => 'test-123'
        ]);

        // Act
        $result = $this->repository->findBySourceAndSourceArticleId($source->id, 'test-123');

        // Assert
        $this->assertNotNull($result);
        $this->assertEquals($article->id, $result->id);
    }

    public function test_find_by_source_and_source_article_id_returns_null_when_not_found()
    {
        // Arrange
        $source = \App\Models\Source::factory()->create();

        // Act
        $result = $this->repository->findBySourceAndSourceArticleId($source->id, 'nonexistent');

        // Assert
        $this->assertNull($result);
    }

    public function test_create_creates_new_article()
    {
        // Arrange
        $source = \App\Models\Source::factory()->create();
        $articleData = [
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Test content',
            'url' => 'https://example.com/test',
            'source_id' => $source->id,
            'source_article_id' => 'test-456',
            'published_at' => now(),
            'scraped_at' => now(),
        ];

        // Act
        $article = $this->repository->create($articleData);

        // Assert
        $this->assertInstanceOf(Article::class, $article);
        $this->assertEquals('Test Article', $article->title);
        $this->assertEquals($source->id, $article->source_id);
        $this->assertDatabaseHas('articles', [
            'title' => 'Test Article',
            'source_id' => $source->id,
            'source_article_id' => 'test-456'
        ]);
    }
}
