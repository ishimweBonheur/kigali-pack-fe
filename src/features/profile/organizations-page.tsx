"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, UserPlus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { organizationsService } from "@/services/organizations.service";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { formatDateTime, getErrorMessage } from "@/utils";
import { toast } from "sonner";

export function OrganizationsPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [memberPage, setMemberPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("DEVELOPER");
  const queryClient = useQueryClient();

  const orgsQuery = useQuery({
    queryKey: ["organizations"],
    queryFn: () => organizationsService.list(),
  });

  const orgs = orgsQuery.data ?? [];
  const activeOrgId = selectedOrgId ?? orgs[0]?.id ?? null;

  const membersQuery = useQuery({
    queryKey: ["org-members", activeOrgId, memberPage],
    queryFn: () =>
      organizationsService.listMembers(activeOrgId!, {
        page: memberPage,
        limit: DEFAULT_PAGE_SIZE,
      }),
    enabled: !!activeOrgId,
  });

  const addMemberMutation = useMutation({
    mutationFn: (input: { email: string; role: string }) =>
      organizationsService.addMember(activeOrgId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-members"] });
      setDialogOpen(false);
      setNewEmail("");
      toast.success("Member added");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      organizationsService.removeMember(activeOrgId!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-members"] });
      toast.success("Member removed");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const members = membersQuery.data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Manage teams and member access"
        actions={
          activeOrgId && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                <UserPlus className="h-4 w-4" />
                Add member
              </DialogTrigger>
              <DialogContent className="glass-card border-border">
                <DialogHeader>
                  <DialogTitle>Add team member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <Select
                    value={newRole}
                    onValueChange={(v) => v && setNewRole(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEVELOPER">Developer</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="ORG_OWNER">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    className="w-full"
                    onClick={() =>
                      addMemberMutation.mutate({
                        email: newEmail,
                        role: newRole,
                      })
                    }
                    disabled={!newEmail || addMemberMutation.isPending}
                  >
                    Add member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-0 overflow-hidden lg:col-span-1">
          <div className="p-4 border-b border-border font-medium text-small">
            Your organizations
          </div>
          {orgsQuery.isLoading ? (
            <div className="p-4"><TableSkeleton rows={2} /></div>
          ) : orgs.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No organizations"
              description="Your organizations will appear here"
            />
          ) : (
            <div className="divide-y divide-border">
              {orgs.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => setSelectedOrgId(org.id)}
                  className={`w-full text-left p-4 transition-colors hover:bg-hover ${
                    activeOrgId === org.id ? "bg-accent/10" : ""
                  }`}
                >
                  <p className="font-medium">{org.name}</p>
                  <p className="text-small text-muted-foreground">{org.slug}</p>
                </button>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-0 overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-border font-medium">
            Members
          </div>
          {!activeOrgId ? (
            <p className="p-6 text-muted-foreground text-small">
              Select an organization
            </p>
          ) : membersQuery.isLoading ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : members.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No members"
              description="Add team members to collaborate"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id} className="border-border">
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell className="text-small text-muted-foreground">
                      {formatDateTime(member.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeMemberMutation.mutate(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="px-6 pb-4">
            <PaginationControls
              pagination={membersQuery.data?.pagination}
              onPageChange={setMemberPage}
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
