import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Globe, Lock, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CreatePartyDialogProps {
  contentId?: string;
  contentTitle: string;
  children: React.ReactNode;
}

const CreatePartyDialog = ({ contentId, contentTitle, children }: CreatePartyDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(`${contentTitle} Watch Party`);
  const [partyType, setPartyType] = useState<"global" | "local">("global");
  const [creating, setCreating] = useState(false);
  const [createdPartyId, setCreatedPartyId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!user || !contentId || !title.trim()) return;
    setCreating(true);

    const { data, error } = await supabase
      .from("watch_parties")
      .insert({
        title: title.trim(),
        content_id: contentId,
        created_by: user.id,
        scheduled_at: new Date().toISOString(),
        status: "live",
        party_type: partyType,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to create party");
      setCreating(false);
      return;
    }

    // Auto-join creator
    await supabase.from("watch_party_members").insert({
      party_id: data.id,
      user_id: user.id,
    });

    if (partyType === "local") {
      setCreatedPartyId(data.id);
      setCreating(false);
    } else {
      setOpen(false);
      setCreating(false);
      navigate(`/party/${data.id}`);
    }
  };

  const partyLink = createdPartyId
    ? `${window.location.origin}/party/${createdPartyId}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(partyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setCreatedPartyId(null); setTitle(`${contentTitle} Watch Party`); } }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">Create Watch Party</DialogTitle>
        </DialogHeader>

        {createdPartyId ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Your local party is live! Share this link with friends:
            </p>
            <div className="flex gap-2">
              <Input value={partyLink} readOnly className="text-xs" />
              <Button variant="outline" size="icon" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button className="w-full" onClick={() => { setOpen(false); navigate(`/party/${createdPartyId}`); }}>
              Join Party
            </Button>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-foreground">Party Name</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name your party..." />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Party Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPartyType("global")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    partyType === "global"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30 hover:bg-secondary/60"
                  }`}
                >
                  <Globe className={`h-6 w-6 ${partyType === "global" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium text-foreground">Global</span>
                  <span className="text-[10px] text-muted-foreground text-center">Open to everyone with live chat</span>
                </button>
                <button
                  onClick={() => setPartyType("local")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    partyType === "local"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30 hover:bg-secondary/60"
                  }`}
                >
                  <Lock className={`h-6 w-6 ${partyType === "local" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium text-foreground">Local</span>
                  <span className="text-[10px] text-muted-foreground text-center">Private link, invite friends only</span>
                </button>
              </div>
            </div>

            <Button onClick={handleCreate} disabled={creating || !contentId} className="w-full">
              <Users className="h-4 w-4 mr-2" />
              {creating ? "Creating..." : "Create Party"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePartyDialog;
