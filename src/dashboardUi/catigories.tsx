import { useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../hooks/useCategories";
import { usePosts } from "../hooks/usePosts";
import { motion } from "framer-motion";
import PremiumSpinner, { CompactSpinner } from "../components/PremiumSpinner";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { showDeleteConfirm, showSuccess } from "../utils/sweetalert";
import type { Category } from "../hooks/useCategories";

export default function Categories(): React.ReactElement {
  const { data: categories = [], isLoading } = useCategories();
  const { data: posts = [] } = usePosts();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Calculate post count for each category
  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    postCount: posts.filter((p) => p.category === cat.name).length,
  }));

  // Filter categories
  const filteredCategories = categoriesWithCounts.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (category?: Category): void => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          data: formData,
        });
      } else {
        await createCategory.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDelete = (category: Category): void => {
    const postCount = posts.filter((p) => p.category === category.name).length;
    if (postCount > 0) {
      showSuccess(
        "Cannot Delete",
        `This category is used by ${postCount} post(s). Please reassign those posts before deleting.`
      );
      return;
    }

    showDeleteConfirm(
      category.name,
      () => {
        deleteCategory.mutate(category.id);
        showSuccess("Category Deleted", "The category has been deleted successfully!");
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <PremiumSpinner size="lg" variant="primary" text="Loading categories..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-base-content">Manage Categories</h1>
          <p className="text-base-content/70 mt-1">
            {filteredCategories.length} of {categories.length} categories
          </p>
        </div>
        <button
          className="btn btn-primary gap-2"
          onClick={() => handleOpenModal()}
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-100 shadow-lg"
      >
        <div className="card-body p-4">
          <label className="input input-bordered flex items-center gap-2">
            <MagnifyingGlassIcon className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="grow"
            />
          </label>
        </div>
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-base-content/70 text-lg">
              {searchQuery ? "No categories match your search" : "No categories yet"}
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="card-body">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TagIcon className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-base-content">
                      {category.name}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleOpenModal(category)}
                      title="Edit Category"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(category)}
                      title="Delete Category"
                      disabled={deleteCategory.isPending}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {category.description && (
                  <p className="text-base-content/70 text-sm mb-3">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-base-300">
                  <span className="text-sm text-base-content/70">
                    {category.postCount || 0} post
                    {(category.postCount || 0) !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingCategory ? "Edit Category" : "Create New Category"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Category Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Technology, Health, Lifestyle"
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Description (Optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this category..."
                  rows={3}
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    createCategory.isPending || updateCategory.isPending
                  }
                >
                  {createCategory.isPending || updateCategory.isPending ? (
                    <>
                      <CompactSpinner size="sm" variant="primary" />
                      <span>Saving...</span>
                    </>
                  ) : editingCategory ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
        </div>
      )}
    </div>
  );
}
