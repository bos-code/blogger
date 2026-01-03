import { useState } from "react";
import { usePosts } from "../hooks/usePosts";
import { useUpdatePost } from "../hooks/usePosts";
import { motion } from "framer-motion";
import PremiumSpinner, { CompactSpinner } from "../components/PremiumSpinner";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { showSuccess, showError, showConfirm } from "../utils/sweetalert";
import type { BlogPost } from "../types";

export default function Categories(): React.ReactElement {
  const { data: posts = [], isLoading } = usePosts();
  const updatePost = useUpdatePost();
  const [newCategory, setNewCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Extract unique categories from posts
  const categories = Array.from(
    new Set(
      posts
        .map((post: BlogPost) => post.category)
        .filter((cat): cat is string => Boolean(cat))
    )
  ).sort();

  // Filter categories
  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count posts per category
  const getCategoryCount = (category: string): number => {
    return posts.filter((post: BlogPost) => post.category === category).length;
  };

  // Get posts by category
  const getPostsByCategory = (category: string): BlogPost[] => {
    return posts.filter((post: BlogPost) => post.category === category);
  };

  const handleAddCategory = (): void => {
    if (!newCategory.trim()) {
      showError("Invalid Category", "Please enter a category name.");
      return;
    }

    if (categories.includes(newCategory.trim())) {
      showError("Category Exists", "This category already exists.");
      return;
    }

    setNewCategory("");
    showSuccess("Category Added", "You can now assign this category to posts.");
  };

  const handleRenameCategory = (oldCategory: string): void => {
    const newName = prompt(`Rename "${oldCategory}" to:`, oldCategory);
    if (!newName || !newName.trim() || newName === oldCategory) return;

    if (categories.includes(newName.trim())) {
      showError("Category Exists", "A category with this name already exists.");
      return;
    }

    // Update all posts with this category
    const postsToUpdate = getPostsByCategory(oldCategory);
    
    showConfirm(
      "Rename Category",
      `This will update ${postsToUpdate.length} post(s). Continue?`,
      {
        confirmText: "Rename",
        cancelText: "Cancel",
        confirmColor: "primary",
        onConfirm: async () => {
          try {
            await Promise.all(
              postsToUpdate.map((post) =>
                updatePost.mutateAsync({
                  id: post.id,
                  data: { category: newName.trim() },
                })
              )
            );
            showSuccess(
              "Category Renamed",
              `"${oldCategory}" has been renamed to "${newName.trim()}".`
            );
          } catch (error) {
            showError("Failed", "Could not rename category. Please try again.");
          }
        },
      }
    );
  };

  const handleDeleteCategory = (category: string): void => {
    const postsWithCategory = getPostsByCategory(category);
    
    showConfirm(
      "Delete Category",
      `This will remove the category from ${postsWithCategory.length} post(s). Continue?`,
      {
        confirmText: "Delete",
        cancelText: "Cancel",
        confirmColor: "error",
        onConfirm: async () => {
          try {
            // Remove category from all posts
            await Promise.all(
              postsWithCategory.map((post) =>
                updatePost.mutateAsync({
                  id: post.id,
                  data: { category: "" },
                })
              )
            );
            showSuccess(
              "Category Deleted",
              `"${category}" has been removed from all posts.`
            );
          } catch (error) {
            showError("Failed", "Could not delete category. Please try again.");
          }
        },
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
            {filteredCategories.length} categories
          </p>
        </div>
      </motion.div>

      {/* Add Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-100 shadow-lg"
      >
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="input input-bordered flex items-center gap-2 flex-1">
              <TagIcon className="w-4 h-4" />
              <input
                type="text"
                placeholder="Enter new category name..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                className="grow"
              />
            </label>
            <button
              className="btn btn-primary gap-2"
              onClick={handleAddCategory}
            >
              <PlusIcon className="w-5 h-5" />
              Add Category
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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

      {/* Categories List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card bg-base-100 shadow-xl"
      >
        <div className="card-body">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base-content/70 text-lg">
                {searchQuery
                  ? "No categories match your search"
                  : "No categories yet. Create your first category!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => {
                const count = getCategoryCount(category);
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-base-content">
                          {category}
                        </h3>
                        <div className="badge badge-primary badge-lg">
                          {count} {count === 1 ? "post" : "posts"}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          className="btn btn-sm btn-primary flex-1"
                          onClick={() => handleRenameCategory(category)}
                          disabled={updatePost.isPending}
                        >
                          {updatePost.isPending ? (
                            <CompactSpinner size="sm" variant="primary" />
                          ) : (
                            "Rename"
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDeleteCategory(category)}
                          disabled={updatePost.isPending}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
