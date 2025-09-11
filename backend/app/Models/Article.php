<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Laravel\Scout\Searchable;

class Article extends Model
{
    use HasFactory, Searchable;

    protected $fillable = [
        'source_id',
        'source_article_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'url',
        'image_url',
        'author_id',
        'category_id',
        'published_at',
        'scraped_at',
        'raw_payload',
        'language',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'scraped_at' => 'datetime',
        'raw_payload' => 'array',
    ];

    public function source(): BelongsTo
    {
        return $this->belongsTo(Source::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function savedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_saved_articles')
            ->withPivot('saved_at')
            ->withTimestamps();
    }

    public function toSearchableArray(): array
    {
        return [
            // Identifiers
            'id' => $this->id,

            // Display fields
            'title' => $this->title,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'url' => $this->url,
            'image_url' => $this->image_url,
            'language' => $this->language,

            // Complete relationship objects for frontend
            'source' => $this->source ? [
                'id' => $this->source->id,
                'name' => $this->source->name,
                'api_slug' => $this->source->api_slug,
                'url' => $this->source->url,
            ] : null,
            'author' => $this->author ? [
                'id' => $this->author->id,
                'name' => $this->author->name,
                'canonical_name' => $this->author->canonical_name,
            ] : null,
            'category' => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null,

            // Flattened relation fields for search / filtering
            'source_name' => $this->source?->name,
            'source_slug' => $this->source?->api_slug,
            'author_name' => $this->author?->name,
            'author_canonical_name' => $this->author?->canonical_name,
            'category_name' => $this->category?->name,
            'category_slug' => $this->category?->slug,

            // Dates (string for display + numeric for filters / sort)
            'published_at' => $this->published_at?->toISOString(),
            'published_at_ts' => optional($this->published_at)->timestamp,
        ];
    }
}
