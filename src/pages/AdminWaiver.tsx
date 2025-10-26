import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  HomeIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useWaivers, useCreateWaiver, useUpdateWaiver, useDeleteWaiver } from '../hooks/useWaivers';

const waiverSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body_markdown: z.string().min(1, 'Waiver content is required'),
  is_active: z.boolean(),
});

type WaiverFormData = z.infer<typeof waiverSchema>;

export const AdminWaiver: React.FC = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [editingWaiver, setEditingWaiver] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const { data: waivers, isLoading, error } = useWaivers();
  const createWaiver = useCreateWaiver();
  const updateWaiver = useUpdateWaiver();
  const deleteWaiver = useDeleteWaiver();

  const form = useForm<WaiverFormData>({
    resolver: zodResolver(waiverSchema),
    defaultValues: {
      title: '',
      body_markdown: '',
      is_active: false,
    },
  });

  const handleBack = () => {
    navigate('/admin');
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingWaiver(null);
    form.reset({
      title: '',
      body_markdown: '',
      is_active: false,
    });
    setFormError(null);
    setFormSuccess(null);
  };

  const handleEdit = (waiverId: string) => {
    const waiver = waivers?.find(w => w.id === waiverId);
    if (waiver) {
      setIsCreating(false);
      setEditingWaiver(waiverId);
      form.reset({
        title: waiver.title,
        body_markdown: waiver.body_markdown,
        is_active: waiver.is_active,
      });
      setFormError(null);
      setFormSuccess(null);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingWaiver(null);
    form.reset({
      title: '',
      body_markdown: '',
      is_active: false,
    });
    setFormError(null);
    setFormSuccess(null);
  };

  const onSubmit = async (data: WaiverFormData) => {
    try {
      setFormError(null);
      setFormSuccess(null);

      if (editingWaiver) {
        await updateWaiver.mutateAsync({
          id: editingWaiver,
          ...data,
        });
        setFormSuccess('Waiver updated successfully!');
      } else {
        await createWaiver.mutateAsync({
          ...data,
          version: 1, // Will be auto-incremented by database
        });
        setFormSuccess('Waiver created successfully!');
      }

      // Reset form after successful submission
      setTimeout(() => {
        handleCancel();
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save waiver';
      setFormError(errorMessage);
    }
  };

  const handleDelete = async (waiverId: string) => {
    if (window.confirm('Are you sure you want to delete this waiver? This action cannot be undone.')) {
      try {
        await deleteWaiver.mutateAsync(waiverId);
        setFormSuccess('Waiver deleted successfully!');
        setTimeout(() => setFormSuccess(null), 3000);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete waiver';
        setFormError(errorMessage);
        setTimeout(() => setFormError(null), 3000);
      }
    }
  };

  const handleSetActive = async (waiverId: string) => {
    try {
      // First, deactivate all waivers
      const updatePromises = waivers?.map(waiver => 
        updateWaiver.mutateAsync({
          id: waiver.id,
          is_active: waiver.id === waiverId,
        })
      ) || [];

      await Promise.all(updatePromises);
      setFormSuccess('Active waiver updated successfully!');
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update active waiver';
      setFormError(errorMessage);
      setTimeout(() => setFormError(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading waivers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading waivers: {error.message}</p>
          <button
            onClick={handleBack}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <HomeIcon className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Waiver Management</h1>
            </div>
            {!isCreating && !editingWaiver && (
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New Waiver
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {formSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800">{formSuccess}</p>
          </div>
        )}

        {formError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{formError}</p>
          </div>
        )}

        {/* Create/Edit Form */}
        {(isCreating || editingWaiver) && (
          <div className="mb-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingWaiver ? 'Edit Waiver' : 'Create New Waiver'}
              </h3>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Waiver Title
                  </label>
                  <div className="mt-1">
                    <input
                      {...form.register('title')}
                      type="text"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter waiver title"
                    />
                  </div>
                  {form.formState.errors.title && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="body_markdown" className="block text-sm font-medium text-gray-700">
                    Waiver Content (Markdown)
                  </label>
                  <div className="mt-1">
                    <textarea
                      {...form.register('body_markdown')}
                      rows={10}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter waiver content in markdown format..."
                    />
                  </div>
                  {form.formState.errors.body_markdown && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.body_markdown.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    {...form.register('is_active')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Set as active waiver
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createWaiver.isPending || updateWaiver.isPending}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {createWaiver.isPending || updateWaiver.isPending ? 'Saving...' : (editingWaiver ? 'Update Waiver' : 'Create Waiver')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Waivers List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Waivers</h3>
            
            {waivers && waivers.length > 0 ? (
              <div className="space-y-4">
                {waivers.map((waiver) => (
                  <div key={waiver.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">{waiver.title}</h4>
                          {waiver.is_active && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Version {waiver.version} • Created {new Date(waiver.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {waiver.body_markdown.substring(0, 200)}...
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setShowPreview(waiver.id)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Preview"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        {!waiver.is_active && (
                          <button
                            onClick={() => handleSetActive(waiver.id)}
                            className="p-2 text-green-400 hover:text-green-600"
                            title="Set as Active"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleEdit(waiver.id)}
                          className="p-2 text-blue-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(waiver.id)}
                          className="p-2 text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No waivers found. Create your first waiver to get started.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {showPreview && waivers && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {waivers.find(w => w.id === showPreview)?.title}
                </h3>
                <button
                  onClick={() => setShowPreview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-2 px-7 pt-6 pb-4">
                <div className="text-sm text-gray-500 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {waivers.find(w => w.id === showPreview)?.body_markdown}
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setShowPreview(null)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
