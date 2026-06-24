"use client";

import { Moon, Sun, Bell, Shield, Building2, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/providers/theme-provider";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [webhookNotifs, setWebhookNotifs] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure your dashboard preferences and security"
      />

      <div className="space-y-6 max-w-2xl">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {theme === "dark" ? (
              <Moon className="h-5 w-5 text-accent" />
            ) : (
              <Sun className="h-5 w-5 text-accent" />
            )}
            <h3 className="font-heading font-semibold">Theme</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark mode</p>
              <p className="text-small text-muted-foreground">
                Use dark theme across the dashboard
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? "Switch to light" : "Switch to dark"}
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-accent" />
            <h3 className="font-heading font-semibold">Account</h3>
          </div>
          <div className="space-y-3 text-small">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{session?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span>{session?.user?.role}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-5 w-5 text-accent" />
            <h3 className="font-heading font-semibold">Organization</h3>
          </div>
          <p className="text-small text-muted-foreground">
            Organization ID:{" "}
            <code className="font-mono">{session?.user?.organizationId}</code>
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-accent" />
            <h3 className="font-heading font-semibold">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifs">Email notifications</Label>
              <Switch
                id="email-notifs"
                checked={emailNotifs}
                onCheckedChange={setEmailNotifs}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="webhook-notifs">Webhook failure alerts</Label>
              <Switch
                id="webhook-notifs"
                checked={webhookNotifs}
                onCheckedChange={setWebhookNotifs}
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-accent" />
            <h3 className="font-heading font-semibold">Security</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-factor authentication</p>
              <p className="text-small text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
          </div>
          <Separator className="my-4" />
          <p className="text-small text-muted-foreground">
            Keyboard shortcuts: ⌘D overview, ⌘K keys, ⌘A analytics, ⌘P
            payments, ⌘W webhooks, ⌘B billing, ⌘O organizations, ⌘S settings
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
