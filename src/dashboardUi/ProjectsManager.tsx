import { useState, type FormEvent } from "react";
import { BriefcaseIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useDeleteProject, useProjects, useSaveProject, type ProjectInput } from "../hooks/useProjects";
import { useAuthStore } from "../stores/authStore";
import { uploadImageToStorage } from "../services/storageService";
import { FALLBACK_PROJECTS } from "../data/projects";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import TagInput from "../components/ui/TagInput";
import { slugify } from "../utils/posts";
import { showDeleteConfirm, showError, showSuccess } from "../utils/sweetalert";
import type { Project } from "../types";

const EMPTY: ProjectInput = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  imageUrl: "",
  liveUrl: "",
  repoUrl: "",
  tech: [],
  role: "",
  order: 1,
};

function ProjectForm({
  initial,
  onDone,
}: {
  initial: { id?: string; data: ProjectInput };
  onDone: () => void;
}) {
  const user = useAuthStore((state) => state.user);
  const saveProject = useSaveProject();
  const [data, setData] = useState<ProjectInput>(initial.data);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<ProjectInput>) => setData((current) => ({ ...current, ...patch }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!data.title.trim() || !data.summary.trim()) {
      setError("Title and summary are required.");
      return;
    }
    try {
      await saveProject.mutateAsync({
        id: initial.id,
        data: {
          ...data,
          title: data.title.trim(),
          slug: slugify(data.slug || data.title),
          summary: data.summary.trim(),
          description: data.description?.trim() || "",
          imageUrl: data.imageUrl?.trim() || null,
          liveUrl: data.liveUrl?.trim() || null,
          repoUrl: data.repoUrl?.trim() || null,
          role: data.role?.trim() || null,
          order: Number(data.order) || 1,
        },
      });
      showSuccess(initial.id ? "Project updated" : "Project added");
      onDone();
    } catch {
      setError("Couldn't save the project. Check that you're an admin with a verified email.");
    }
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      set({ imageUrl: await uploadImageToStorage(file, { userId: user?.uid, folder: "post-images" }) });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
        <div>
          <label htmlFor="project-title" className="field-label">Title</label>
          <input id="project-title" className="input w-full" value={data.title} onChange={(e) => set({ title: e.target.value })} maxLength={80} required />
        </div>
        <div>
          <label htmlFor="project-order" className="field-label">Order</label>
          <input id="project-order" type="number" min={1} className="input w-full" value={data.order ?? 1} onChange={(e) => set({ order: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <label htmlFor="project-summary" className="field-label">Summary <span className="font-normal text-base-content/55">(shown on the card)</span></label>
        <textarea id="project-summary" className="textarea w-full" rows={2} maxLength={200} value={data.summary} onChange={(e) => set({ summary: e.target.value })} required />
      </div>
      <div>
        <label htmlFor="project-description" className="field-label">Case study <span className="font-normal text-base-content/55">(optional — adds a details page)</span></label>
        <textarea id="project-description" className="textarea w-full" rows={6} value={data.description ?? ""} onChange={(e) => set({ description: e.target.value })} placeholder="The problem, your approach, and the result. Blank lines start new paragraphs." />
      </div>
      <div>
        <label htmlFor="project-role" className="field-label">Your role</label>
        <input id="project-role" className="input w-full" value={data.role ?? ""} onChange={(e) => set({ role: e.target.value })} placeholder="e.g. Front-end developer (solo)" />
      </div>
      <div>
        <label htmlFor="project-tech" className="field-label">Technologies</label>
        <TagInput id="project-tech" value={data.tech ?? []} onChange={(tech) => set({ tech })} max={10} placeholder="Add a technology and press Enter" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="project-live" className="field-label">Live URL</label>
          <input id="project-live" type="url" className="input w-full" value={data.liveUrl ?? ""} onChange={(e) => set({ liveUrl: e.target.value })} placeholder="https://" />
        </div>
        <div>
          <label htmlFor="project-repo" className="field-label">Code URL</label>
          <input id="project-repo" type="url" className="input w-full" value={data.repoUrl ?? ""} onChange={(e) => set({ repoUrl: e.target.value })} placeholder="https://github.com/…" />
        </div>
      </div>
      <div>
        <label htmlFor="project-image" className="field-label">Screenshot</label>
        <div className="flex gap-2">
          <input id="project-image" type="url" className="input flex-1" value={data.imageUrl ?? ""} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="Image URL or upload" />
          <label className="btn btn-ghost border border-base-300">
            {uploading ? <span className="loading loading-spinner loading-xs" /> : "Upload"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => void upload(e.target.files?.[0])} />
          </label>
        </div>
        {data.imageUrl && <img src={data.imageUrl} alt="" className="mt-2 aspect-video w-full rounded-lg border border-base-300 object-cover" />}
      </div>
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={onDone}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saveProject.isPending || uploading}>
          {saveProject.isPending && <span className="loading loading-spinner loading-xs" />}
          Save project
        </button>
      </div>
    </form>
  );
}

/** Admin CRUD for the portfolio projects shown on the home page. */
export default function ProjectsManager(): React.ReactElement {
  const { data } = useProjects();
  const deleteProject = useDeleteProject();
  const saveProject = useSaveProject();
  const [editing, setEditing] = useState<{ id?: string; data: ProjectInput } | null>(null);
  const [importing, setImporting] = useState(false);
  const projects = data?.fromDatabase ? data.projects : [];

  const toInput = (project: Project): ProjectInput => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = project;
    return { ...EMPTY, ...rest };
  };

  const importDefaults = async () => {
    setImporting(true);
    try {
      for (const project of FALLBACK_PROJECTS) {
        // Bundled screenshots are relative asset URLs; store absolute URLs so they keep working.
        const imageUrl = project.imageUrl ? new URL(project.imageUrl, window.location.origin).href : null;
        await saveProject.mutateAsync({ data: { ...toInput(project), imageUrl } });
      }
      showSuccess("Projects imported", "You can now edit them here.");
    } catch {
      showError("Import failed", "Please try again.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Projects shown in the Work section of the home page."
        actions={
          <button type="button" className="btn btn-primary gap-2" onClick={() => setEditing({ data: { ...EMPTY, order: projects.length + 1 } })}>
            <PlusIcon className="h-5 w-5" /> Add project
          </button>
        }
      />

      <div className="surface overflow-hidden">
        {projects.length === 0 ? (
          <EmptyState
            icon={BriefcaseIcon}
            title="No projects saved yet"
            description="The home page is currently showing the built-in project list. Import it to start editing, or add your own."
            action={
              <button type="button" className="btn btn-ghost border border-base-300" onClick={() => void importDefaults()} disabled={importing}>
                {importing && <span className="loading loading-spinner loading-xs" />}
                Import the current {FALLBACK_PROJECTS.length} projects
              </button>
            }
          />
        ) : (
          <ul className="divide-y divide-base-300">
            {projects.map((project) => (
              <li key={project.id} className="flex items-center gap-4 p-4">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt="" className="h-14 w-24 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-14 w-24 shrink-0 rounded-lg bg-base-200" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    <span className="mr-2 text-xs tabular-nums text-base-content/50">#{project.order ?? "–"}</span>
                    {project.title}
                  </p>
                  <p className="truncate text-sm text-base-content/60">{project.summary}</p>
                </div>
                <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label={`Edit ${project.title}`} onClick={() => setEditing({ id: project.id, data: toInput(project) })}>
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square text-error"
                  aria-label={`Delete ${project.title}`}
                  onClick={() =>
                    void showDeleteConfirm(project.title, async () => {
                      try {
                        await deleteProject.mutateAsync(project.id);
                      } catch {
                        showError("Couldn't delete", "Please try again.");
                      }
                    })
                  }
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing?.id ? "Edit project" : "Add project"} size="lg">
        {editing && <ProjectForm initial={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
