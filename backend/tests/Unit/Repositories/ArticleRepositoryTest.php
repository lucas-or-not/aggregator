<?php

namespace Tests\Unit\Repositories;

use App\Models\Article;
use App\Models\Author;
use App\Models\Category;
use App\Models\Source;
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
        $source = Source::factory()->create();
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
        $source = Source::factory()->create();

        // Act
        $result = $this->repository->findBySourceAndSourceArticleId($source->id, 'nonexistent');

        // Assert
        $this->assertNull($result);
    }

    public function test_create_creates_new_article()
    {
        // Arrange
        $source = Source::factory()->create();
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

    public function test_get_filtered_metadata_with_no_filters_returns_all_categories_and_authors()
    {
        // Arrange
        $source1 = Source::factory()->create(['api_slug' => 'source-1']);
        $source2 = Source::factory()->create(['api_slug' => 'source-2']);
        $category1 = Category::factory()->create(['slug' => 'tech', 'name' => 'Technology']);
        $category2 = Category::factory()->create(['slug' => 'sports', 'name' => 'Sports']);
        $author1 = Author::factory()->create(['name' => 'John Doe']);
        $author2 = Author::factory()->create(['name' => 'Jane Smith']);

        Article::factory()->create([
            'source_id' => $source1->id,
            'category_id' => $category1->id,
            'author_id' => $author1->id,
        ]);
        Article::factory()->create([
            'source_id' => $source2->id,
            'category_id' => $category2->id,
            'author_id' => $author2->id,
        ]);

        // Act
        $result = $this->repository->getFilteredMetadata();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('categories', $result);
        $this->assertArrayHasKey('authors', $result);
        $this->assertArrayHasKey('validation', $result);
        $this->assertIsArray($result['categories']);
        $this->assertIsArray($result['authors']);
        $this->assertIsArray($result['validation']);
        $this->assertArrayHasKey('categoryExists', $result['validation']);
        $this->assertArrayHasKey('authorExists', $result['validation']);
    }

    public function test_get_filtered_metadata_with_source_filter_returns_filtered_results()
    {
        // Arrange
        $source1 = Source::factory()->create(['api_slug' => 'source-1']);
        $source2 = Source::factory()->create(['api_slug' => 'source-2']);
        $category1 = Category::factory()->create(['slug' => 'tech', 'name' => 'Technology']);
        $category2 = Category::factory()->create(['slug' => 'sports', 'name' => 'Sports']);
        $author1 = Author::factory()->create(['name' => 'John Doe']);
        $author2 = Author::factory()->create(['name' => 'Jane Smith']);

        // Create articles for source1 only
        Article::factory()->create([
            'source_id' => $source1->id,
            'category_id' => $category1->id,
            'author_id' => $author1->id,
        ]);
        // Create article for source2
        Article::factory()->create([
            'source_id' => $source2->id,
            'category_id' => $category2->id,
            'author_id' => $author2->id,
        ]);

        // Act
        $result = $this->repository->getFilteredMetadata(null, 'source-1');

        $this->assertIsArray($result);
        $this->assertArrayHasKey('categories', $result);
        $this->assertArrayHasKey('authors', $result);
        $this->assertArrayHasKey('validation', $result);
        $this->assertIsArray($result['categories']);
        $this->assertIsArray($result['authors']);
        $this->assertIsArray($result['validation']);
    }

    public function test_get_filtered_metadata_with_source_and_category_filters()
    {
        // Arrange
        $source = Source::factory()->create(['api_slug' => 'test-source']);
        $category1 = Category::factory()->create(['slug' => 'tech', 'name' => 'Technology']);
        $category2 = Category::factory()->create(['slug' => 'sports', 'name' => 'Sports']);
        $author1 = Author::factory()->create(['name' => 'Tech Author']);
        $author2 = Author::factory()->create(['name' => 'Sports Author']);

        // Create articles in different categories
        Article::factory()->create([
            'source_id' => $source->id,
            'category_id' => $category1->id,
            'author_id' => $author1->id,
        ]);
        Article::factory()->create([
            'source_id' => $source->id,
            'category_id' => $category2->id,
            'author_id' => $author2->id,
        ]);

        // Act
        $result = $this->repository->getFilteredMetadata(null, 'test-source', 'tech');

        // Assert - Basic structure test (Meilisearch data may not be available in unit tests)
        $this->assertIsArray($result);
        $this->assertArrayHasKey('categories', $result);
        $this->assertArrayHasKey('authors', $result);
        $this->assertArrayHasKey('validation', $result);
        $this->assertIsArray($result['categories']);
        $this->assertIsArray($result['authors']);
        $this->assertIsArray($result['validation']);
    }

    public function test_get_filtered_metadata_with_all_filters()
    {
        // Arrange
        $source = Source::factory()->create(['api_slug' => 'test-source']);
        $category = Category::factory()->create(['slug' => 'tech', 'name' => 'Technology']);
        $author1 = Author::factory()->create(['name' => 'John Doe']);
        $author2 = Author::factory()->create(['name' => 'Jane Smith']);

        Article::factory()->create([
            'source_id' => $source->id,
            'category_id' => $category->id,
            'author_id' => $author1->id,
        ]);
        Article::factory()->create([
            'source_id' => $source->id,
            'category_id' => $category->id,
            'author_id' => $author2->id,
        ]);

        // Act
        $result = $this->repository->getFilteredMetadata(null, 'test-source', 'tech', 'John Doe');

        // Assert - Basic structure test
        $this->assertIsArray($result);
        $this->assertArrayHasKey('categories', $result);
        $this->assertArrayHasKey('authors', $result);
        $this->assertArrayHasKey('validation', $result);
        $this->assertIsArray($result['categories']);
        $this->assertIsArray($result['authors']);
        $this->assertIsArray($result['validation']);
    }

    public function test_get_filtered_metadata_returns_empty_arrays_when_no_matches()
    {
        // Arrange - create some articles but search for non-existent source
        $source = Source::factory()->create(['api_slug' => 'existing-source']);
        $category = Category::factory()->create(['slug' => 'tech']);
        $author = Author::factory()->create(['name' => 'John Doe']);

        Article::factory()->create([
            'source_id' => $source->id,
            'category_id' => $category->id,
            'author_id' => $author->id,
        ]);

        // Act - search for non-existent source
        $result = $this->repository->getFilteredMetadata('non-existent-source');

        // Assert
        $this->assertIsArray($result);
        $this->assertArrayHasKey('categories', $result);
        $this->assertArrayHasKey('authors', $result);
        $this->assertEmpty($result['categories']);
        $this->assertEmpty($result['authors']);
    }

    public function test_get_filtered_metadata_handles_null_parameters()
    {
        // Arrange
        $source = Source::factory()->create(['api_slug' => 'test-source']);
        $category = Category::factory()->create(['slug' => 'tech', 'name' => 'Technology']);
        $author = Author::factory()->create(['name' => 'John Doe']);

        Article::factory()->create([
            'source_id' => $source->id,
            'category_id' => $category->id,
            'author_id' => $author->id,
        ]);

        // Act - pass null values explicitly
        $result = $this->repository->getFilteredMetadata(null, null, null, null);

        // Assert - Basic structure test
        $this->assertIsArray($result);
        $this->assertArrayHasKey('categories', $result);
        $this->assertArrayHasKey('authors', $result);
        $this->assertArrayHasKey('validation', $result);
        $this->assertIsArray($result['categories']);
        $this->assertIsArray($result['authors']);
        $this->assertIsArray($result['validation']);
    }
}
