"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { profileService } from "@/services/auth.service";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/schemas/profile";
import { formatDateTime, getErrorMessage } from "@/utils";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function ProfilePage() {
  const { data: session, update } = useSession();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileService.getProfile(),
  });

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { email: "", password: "" },
  });

  const profile = profileQuery.data;

  useEffect(() => {
    if (profile) {
      form.reset({ email: profile.email, password: "" });
    }
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileInput) => {
      const payload: Partial<{ email: string; password: string }> = {};
      if (data.email) payload.email = data.email;
      if (data.password) payload.password = data.password;
      return profileService.updateProfile(payload);
    },
    onSuccess: async (updated) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      if (session?.user && updated.email !== session.user.email) {
        await update({ user: { ...session.user, email: updated.email } });
      }
      toast.success("Profile updated");
      form.reset({ email: updated.email, password: "" });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage your account information"
      />

      {profileQuery.isLoading ? (
        <GlassCard className="p-6">
          <TableSkeleton rows={4} />
        </GlassCard>
      ) : profile ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15">
                <User className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold">
                  {profile.email}
                </h3>
                <p className="text-small text-muted-foreground">
                  {profile.role} · {profile.organization.name}
                </p>
              </div>
            </div>
            <div className="space-y-3 text-small">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Organization</span>
                <span>{profile.organization.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Member since</span>
                <span>{formatDateTime(profile.createdAt)}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-heading font-semibold mb-4">Update account</h3>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  updateMutation.mutate(data),
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Leave blank to keep current"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  Save changes
                </Button>
              </form>
            </Form>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}
