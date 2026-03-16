import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface ContentOption {
  id: string;
  title: string;
  slug: string;
}

interface WatchParty {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
  content_id: string;
  content?: { title: string };
}

const WatchPartyManager = () => {
  const { user } = useAuth();
  const [parties, setParties] = useState<WatchParty[]>([]);
  const [contentOptions, setContentOptions] = useState<ContentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content_id: "", date: "", time: "" });

  const fetchData = async () => {
    setLoading(true);
    const [{ data: partiesData }, { data: contentData }] = await Promise.all([
      supabase
        .from("watch_parties")
        .select("id, title, scheduled_at, status, content_id, content(title)")
        .order("scheduled_at", { ascending: false })
        .limit(50),
      supabase.from("content").select("id, title, slug").order("title"),
    ]);
    setParties((partiesData as any) || []);
    setContentOptions(contentData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content_id || !form.date || !form.time) {
      toast.error("All fields are required");
      return;
    }
    setSaving(true);
    const scheduled_at = new Date(`${form.date}T${form.time}`).toISOString();

    const { error } = await supabase.from("watch_parties").insert({
      title: form.title.trim(),
      content_id: form.content_id,
      scheduled_at,
      created_by: user!.id,
    });

    if (error) toast.error("Failed to create watch party");
    else {
      toast.success("Watch party scheduled!");
      fetchData();
    }
    setSaving(false);
    setDialogOpen(false);
    setForm({ title: "", content_id: "", date: "", time: "" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("watch_parties").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Watch party removed");
      setParties((prev) => prev.filter((p) => p.id !== id));
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-display text-foreground">Watch Parties</h2>
          <p className="text-sm text-muted-foreground">Schedule synchronized viewing events</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Schedule Party
        </Button>
      </div>

      {parties.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground">No watch parties scheduled yet.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-card hover:bg-card">
                <TableHead>Event</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parties.map((p) => (
                <TableRow key={p.id} className="group">
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="text-muted-foreground">{p.content?.title || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(p.scheduled_at), "MMM d, yyyy")}
                      <Clock className="h-3.5 w-3.5 ml-2" />
                      {format(new Date(p.scheduled_at), "h:mm a")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={new Date(p.scheduled_at) > new Date() ? "secondary" : "outline"}>
                      {new Date(p.scheduled_at) > new Date() ? "Upcoming" : "Past"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Schedule Watch Party</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Event Title *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Friday Night Premiere"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Content *</label>
              <Select value={form.content_id} onValueChange={(v) => setForm((f) => ({ ...f, content_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select content" /></SelectTrigger>
                <SelectContent>
                  {contentOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Date *</label>
                <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Time *</label>
                <Input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WatchPartyManager;
