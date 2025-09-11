import React, { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { preferencesApi } from '../services/api'
import LoadingState from '../components/LoadingState'
import { useToast } from '../contexts/ToastContext'
import { useCategories, useSources } from '../hooks/useTaxonomies'
import type { Source, Category } from '../types'

const Preferences: React.FC = () => {
  const [preferences, setPreferences] = useState({
    preferred_sources: [] as number[],
    preferred_categories: [] as number[],
    preferred_authors: [] as number[],
  })

  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const { data: userPreferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: () => preferencesApi.getPreferences(),
  })

  // Ensure local UI state always reflects server state when revisiting the page
  useEffect(() => {
    if (userPreferences) {
      setPreferences({
        preferred_sources: userPreferences.preferred_sources || [],
        preferred_categories: userPreferences.preferred_categories || [],
        preferred_authors: userPreferences.preferred_authors || [],
      })
    }
  }, [userPreferences])

  const { data: sources, isLoading: sourcesLoading } = useSources()

  const { data: categories, isLoading: categoriesLoading } = useCategories()

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: typeof preferences) => preferencesApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      showToast('success', 'Preferences Saved', 'Your preferences have been updated successfully.')
    },
    onError: () => {
      showToast('error', 'Save Failed', 'Failed to save your preferences. Please try again.')
    },
  })

  const handleSourceToggle = (sourceId: number) => {
    setPreferences(prev => ({
      ...prev,
      preferred_sources: prev.preferred_sources.includes(sourceId)
        ? prev.preferred_sources.filter(id => id !== sourceId)
        : [...prev.preferred_sources, sourceId]
    }))
  }

  const handleCategoryToggle = (categoryId: number) => {
    setPreferences(prev => ({
      ...prev,
      preferred_categories: prev.preferred_categories.includes(categoryId)
        ? prev.preferred_categories.filter(id => id !== categoryId)
        : [...prev.preferred_categories, categoryId]
    }))
  }

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences)
  }

  if (preferencesLoading || sourcesLoading || categoriesLoading) return <LoadingState message="Loading preferences..." />

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Preferences</h1>
        <p className="mt-2 text-gray-600">
          Customize your news feed by selecting your preferred sources and categories
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-8">
          {/* Sources */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preferred Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(sources as Source[] | undefined)?.map((source) => (
                <label
                  key={source.id}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={preferences.preferred_sources.includes(source.id)}
                    onChange={() => handleSourceToggle(source.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {source.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preferred Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(categories as Category[] | undefined)?.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={preferences.preferred_categories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={updatePreferencesMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
            >
              {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Preferences
