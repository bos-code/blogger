import { useState } from "react";
import { usePosts } from "../hooks/usePosts";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useRenameCategory,
} from "../hooks/useCategories";
import { motion } from "framer-motion";
import PremiumSpinner, { CompactSpinner } from "../components/PremiumSpinner";
import PageHeader from "../components/ui/PageHeader";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import {
  showSuccess,
  showError,
  showConfirm,
  showCustom,
} from "../utils/sweetalert";
import type { BlogPost } from "../types";

export default function Categories(): React.ReactElement {
  const { data: posts = [], isLoading: postsLoading } = usePosts();
  const { data: storedCategories = [], isLoading: categoriesLoading } =
    useCategories();
  const createCategory = useCreateCategory();
  const renameCategory = useRenameCategory();
  const deleteCategory = useDeleteCategory();
  const isLoading = postsLoading || categoriesLoading;
  const isMutating =
    createCategory.isPending || renameCategory.isPending || deleteCategory.isPending;
  const [newCategory, setNewCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Saved categories plus any legacy names that only exist on posts.
  const categories = Array.from(
    new Set([
      ...storedCategories.map((category) => category.name),
      ...posts
        .map((post: BlogPost) => post.category)
        .filter((cat): cat is string => Boolean(cat)),
    ])
  ).sort((a, b) => a.localeCompare(b));

  const findStored = (name: string) =>
    storedCategories.find((category) => category.name === name) ?? null;

  // Filter categories
  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count posts per category
  const getCategoryCount = (category: string): number => {
    return posts.filter((post: BlogPost) => post.category === category).length;
  };

  const hasCategory = (name: string): boolean =>
    categories.some((cat) => cat.toLowerCase() === name.toLowerCase());

  const handleAddCategory = async (): Promise<void> => {
    const name = newCategory.trim();
    if (!name) {
      showError("Invalid Category", "Please enter a category name.");
      return;
    }

    if (name.length > 40) {
      showError("Name Too Long", "Category names can be at most 40 characters.");
      return;
    }

    if (hasCategory(name)) {
      showError("Category Exists", "This category already exists.");
      return;
    }

    try {
      await createCategory.mutateAsync(name);
      setNewCategory("");
      showSuccess("Category Added", `"${name}" is now available in the editor.`);
    } catch {
      showError("Failed", "Could not add the category. Please try again.");
    }
  };

  const handleRenameCategory = async (oldCategory: string): Promise<void> => {
    const result = await showCustom({
      title: "Rename category",
      input: "text",
      inputValue: oldCategory,
      inputAttributes: { maxlength: "40", "aria-label": "New category name" },
      showCancelButton: true,
      confirmButtonText: "Rename",
      inputValidator: (value) => {
        const trimmed = String(value ?? "").trim();
        if (!trimmed) return "Please enter a name.";
        if (trimmed !== oldCategory && hasCategory(trimmed)) {
          return "A category with this name already exists.";
        }
        return null;
      },
    });
    const newName = String(result.value ?? "").trim();
    if (!result.isConfirmed || !newName || newName === oldCategory) return;

    try {
      await renameCategory.mutateAsync({
        category: findStored(oldCategory),
        oldName: oldCategory,
        newName,
        posts,
      });
      showSuccess(
        "Category Renamed",
        `"${oldCategory}" has been renamed to "${newName}".`
      );
    } catch {
      showError("Failed", "Could not rename category. Please try again.");
    }
  };

  const handleDeleteCategory = (category: string): void => {
    const count = getCategoryCount(category);

    showConfirm(
      "Delete Category",
      count > 0
        ? `"${category}" will be removed from ${count} post(s). Continue?`
        : `Delete "${category}"?`,
      {
        confirmText: "Delete",
        cancelText: "Cancel",
        confirmColor: "error",
        onConfirm: async () => {
          try {
            await deleteCategory.mutateAsync({
              category: findStored(category),
              name: category,
              posts,
            });
            showSuccess("Category Deleted", `"${category}" has been deleted.`);
          } catch {
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
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Categories"
        description={`${categories.length} categories · writers pick from this list in the editor`}
      />

      {/* Add Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface"
      >
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="input flex items-center gap-2 flex-1">
              <TagIcon className="w-4 h-4" />
              <input
                type="text"
                placeholder="Enter new category name..."
                aria-label="New category name"
                maxLength={40}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleAddCategory();
                  }
                }}
                className="grow"
              />
            </label>
            <button
              className="btn btn-primary gap-2"
              onClick={() => void handleAddCategory()}
              disabled={createCategory.isPending}
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
        className="surface"
      >
        <div className="card-body p-4">
          <label className="input flex items-center gap-2">
            <MagnifyingGlassIcon className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search categories..."
              aria-label="Search categories"
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
        className="surface"
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
                    className="rounded-xl border border-base-300 bg-base-200/50"
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
                          onClick={() => void handleRenameCategory(category)}
                          disabled={isMutating}
                        >
                          {isMutating ? (
                            <CompactSpinner size="sm" variant="primary" />
                          ) : (
                            "Rename"
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          aria-label={`Delete ${category}`}
                          onClick={() => handleDeleteCategory(category)}
                          disabled={isMutating}
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
