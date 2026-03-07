import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Film,
  Tv,
  Sparkles,
  ArrowLeft,
  Search,
  Video,
  Loader2,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import UserRoleManager from "@/components/admin/UserRoleManager";
import FileUpload from "@/components/admin/FileUpload";

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  genre: string | null;
  type: string;
  year: number | null;
  duration: string | null;
  rating: number | null;
  image: string | null;
  video_url: string | null;
  is_ai_powered: boolean | null;
  tags: string[] | null;
  created_at: string;
}

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  genre: "",
  type: "movie",
  year: new Date().getFullYear(),
  duration: "",
  rating: 0,
  image: "",
  video_url: "",
  is_ai_powered: false,
  tags: "",
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  const [content, setContent] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/");
        toast.error("Access denied. Admin privileges required.");
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchContent();
  }, [isAdmin]);

  const fetchContent = async () => {
    setLoadingContent(true);
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load content");
    } else {
      setContent(data || []);
    }
    setLoadingContent(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      description: item.description || "",
      genre: item.genre || "",
      type: item.type,
      year: item.year || new Date().getFullYear(),
      duration: item.duration || "",
      rating: item.rating || 0,
      image: item.image || "",
      video_url: item.video_url || "",
      is_ai_powered: item.is_ai_powered || false,
      tags: (item.tags || []).join(", "),
    });
    setDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const { error } = await supabase.from("content").delete().eq("id", deletingId);
    if (error) {
      toast.error("Failed to delete content");
    } else {
      toast.success("Content deleted");
      setContent((prev) => prev.filter((c) => c.id !== deletingId));
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      genre: form.genre.trim() || null,
      type: form.type,
      year: form.year,
      duration: form.duration.trim() || null,
      rating: form.rating,
      image: form.image.trim() || null,
      video_url: form.video_url.trim() || null,
      is_ai_powered: form.is_ai_powered,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (editingId) {
      const { error } = await supabase.from("content").update(payload).eq("id", editingId);
      if (error) {
        toast.error("Failed to update content");
      } else {
        toast.success("Content updated");
        fetchContent();
      }
    } else {
      const { error } = await supabase.from("content").insert(payload);
      if (error) {
        toast.error("Failed to create content");
      } else {
        toast.success("Content created");
        fetchContent();
      }
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const filtered = content.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.genre || "").toLowerCase().includes(search.toLowerCase())
  );

  const typeIcon = (type: string) => {
    if (type === "series") return <Tv className="h-4 w-4" />;
    if (type === "interactive") return <Sparkles className="h-4 w-4" />;
    return <Film className="h-4 w-4" />;
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold font-display">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage your platform</p>
            </div>
          </div>
          {activeTab === "content" && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Content
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="content" className="gap-2">
              <Film className="h-4 w-4" /> Content
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" /> Users & Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", count: content.length, color: "text-primary" },
            { label: "Movies", count: content.filter((c) => c.type === "movie").length, color: "text-primary" },
            { label: "Series", count: content.filter((c) => c.type === "series").length, color: "text-accent" },
            { label: "Interactive", count: content.filter((c) => c.type === "interactive").length, color: "text-destructive" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        {loadingContent ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No content found</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-card hover:bg-card">
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} className="group">
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        {typeIcon(item.type)}
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.genre || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{item.year || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{item.rating ?? "—"}</TableCell>
                    <TableCell>
                      {item.video_url ? (
                        <Badge variant="outline" className="text-primary border-primary/30">
                          Has URL
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => confirmDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
          </TabsContent>

          <TabsContent value="users">
            <UserRoleManager />
          </TabsContent>
        </Tabs>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingId ? "Edit Content" : "Add New Content"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Title *</label>
                <Input
                  value={form.title}
                  onChange={(e) => {
                    setForm((f) => ({
                      ...f,
                      title: e.target.value,
                      slug: editingId ? f.slug : generateSlug(e.target.value),
                    }));
                  }}
                  placeholder="Movie title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Slug *</label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="movie-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Content description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Type</label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="movie">Movie</SelectItem>
                    <SelectItem value="series">Series</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Genre</label>
                <Input
                  value={form.genre}
                  onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
                  placeholder="Sci-Fi"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Year</label>
                <Input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Duration</label>
                <Input
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  placeholder="1h 42m"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Rating (0-10)</label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={form.rating}
                  onChange={(e) => setForm((f) => ({ ...f, rating: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_ai_powered}
                    onChange={(e) => setForm((f) => ({ ...f, is_ai_powered: e.target.checked }))}
                    className="accent-primary"
                  />
                  <span className="text-sm">AI-Powered</span>
                </label>
              </div>
            </div>

            <FileUpload
              value={form.image}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
              accept="image/*"
              label="Thumbnail Image"
              folder="thumbnails"
              icon="image"
            />

            <FileUpload
              value={form.video_url}
              onChange={(url) => setForm((f) => ({ ...f, video_url: url }))}
              accept="video/*"
              label="Video File"
              folder="videos"
              icon="video"
            />

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Tags (comma-separated)</label>
              <Input
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="Thriller, Action, Sci-Fi"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Delete Content</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
