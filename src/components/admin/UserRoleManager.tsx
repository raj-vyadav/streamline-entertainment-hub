import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Shield, ShieldOff, Loader2, Users } from "lucide-react";

interface UserResult {
  id: string;
  email: string;
  roles: string[];
}

const UserRoleManager = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "grant" | "revoke";
    user: UserResult | null;
  }>({ open: false, action: "grant", user: null });

  const callManageAdmin = async (body: Record<string, string>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("manage-admin", {
      body,
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.error) throw new Error(res.error.message);
    return res.data;
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const data = await callManageAdmin({ action: "search", email: search.trim() });
      setUsers(data.users || []);
      if ((data.users || []).length === 0) toast.info("No users found");
    } catch {
      toast.error("Failed to search users");
    }
    setSearching(false);
  };

  const handleAction = async () => {
    const { action, user } = confirmDialog;
    if (!user) return;
    setActionLoading(user.id);
    setConfirmDialog({ open: false, action: "grant", user: null });
    try {
      await callManageAdmin({ action, user_id: user.id });
      toast.success(action === "grant" ? "Admin role granted" : "Admin role revoked");
      // Refresh
      await handleSearch();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
    setActionLoading(null);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={searching}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Search for users by email to manage roles</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-card hover:bg-card">
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isAdmin = u.roles.includes("admin");
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell>
                      {u.roles.length > 0 ? (
                        u.roles.map((r) => (
                          <Badge key={r} variant="secondary" className="mr-1">
                            {r}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No roles</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {actionLoading === u.id ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                      ) : isAdmin ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive gap-1"
                          onClick={() =>
                            setConfirmDialog({ open: true, action: "revoke", user: u })
                          }
                        >
                          <ShieldOff className="h-4 w-4" />
                          Revoke Admin
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary gap-1"
                          onClick={() =>
                            setConfirmDialog({ open: true, action: "grant", user: u })
                          }
                        >
                          <Shield className="h-4 w-4" />
                          Make Admin
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "grant" ? "Grant Admin Role" : "Revoke Admin Role"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            {confirmDialog.action === "grant"
              ? `Make ${confirmDialog.user?.email} an admin? They will have full content management access.`
              : `Remove admin access from ${confirmDialog.user?.email}?`}
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDialog({ open: false, action: "grant", user: null })}>
              Cancel
            </Button>
            <Button
              variant={confirmDialog.action === "revoke" ? "destructive" : "default"}
              onClick={handleAction}
            >
              {confirmDialog.action === "grant" ? "Grant Admin" : "Revoke Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserRoleManager;
