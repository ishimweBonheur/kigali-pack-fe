"use client";

import { useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  UserPlus,
  Mail,
  Key,
  Copy,
  Terminal,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Database,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  verifyEmailSchema,
  type RegisterInput,
  type VerifyEmailInput,
} from "@/schemas/auth";
import { authService } from "@/services/auth.service";
import { apiKeysService } from "@/services/api-keys.service";
import { publicService } from "@/services/public.service";
import { ONBOARDING_STORAGE_KEY } from "@/constants";
import { PUBLIC_ROUTES } from "@/constants/public";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CodeBlock } from "@/components/public/code-block";
import { copyToClipboard, getErrorMessage } from "@/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OnboardingState {
  step: number;
  email?: string;
  verified: boolean;
  apiKey?: string;
  firstRequestOk: boolean;
  completed: boolean;
}

const DEFAULT_STATE: OnboardingState = {
  step: 1,
  verified: false,
  firstRequestOk: false,
  completed: false,
};

const STEPS = [
  { num: 1, label: "Create Account", icon: UserPlus },
  { num: 2, label: "Verify Email", icon: Mail },
  { num: 3, label: "Generate Key", icon: Key },
  { num: 4, label: "Copy Key", icon: Copy },
  { num: 5, label: "First Request", icon: Terminal },
  { num: 6, label: "Complete", icon: CheckCircle2 },
];

function loadState(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: OnboardingState) {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
}

export function OnboardingWizard() {
  const { data: session } = useSession();
  const [state, setState] = useState<OnboardingState>(() => loadState());
  const [loading, setLoading] = useState(false);
  const [keyRevealed, setKeyRevealed] = useState(false);
  const [testResponse, setTestResponse] = useState<string>("");
  const [testStatus, setTestStatus] = useState<number | null>(null);

  const updateState = useCallback((patch: Partial<OnboardingState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveState(next);
      return next;
    });
  }, []);

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { organizationName: "", email: "", password: "" },
  });

  const verifyForm = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { token: "" },
  });

  const handleRegister = async (data: RegisterInput) => {
    setLoading(true);
    try {
      await authService.register(data);
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) throw new Error("Auto sign-in failed");
      updateState({ step: 2, email: data.email });
      toast.success("Account created!");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (data: VerifyEmailInput) => {
    setLoading(true);
    try {
      await authService.verifyEmail(data.token);
      updateState({ step: 3, verified: true });
      toast.success("Email verified!");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    setLoading(true);
    try {
      const key = await apiKeysService.create({
        environment: "TEST",
        name: "Onboarding Key",
      });
      updateState({ step: 4, apiKey: key.rawToken });
      toast.success("API key created!");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = async () => {
    if (!state.apiKey) return;
    const ok = await copyToClipboard(state.apiKey);
    if (ok) {
      setKeyRevealed(true);
      toast.success("Copied to clipboard");
      updateState({ step: 5 });
    }
  };

  const handleFirstRequest = async () => {
    if (!state.apiKey) return;
    setLoading(true);
    try {
      const result = await publicService.probeEndpoint(
        "GET",
        "/v1/compliance/nida/mock/1200580064278104",
        state.apiKey,
      );
      setTestStatus(result.status);
      setTestResponse(JSON.stringify(result.data, null, 2));
      if (result.status >= 200 && result.status < 300) {
        updateState({ step: 6, firstRequestOk: true, completed: true });
        toast.success("API connected!");
      } else {
        toast.error(`Request returned ${result.status}`);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const progress = ((state.step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight">
          Get started with Kigali-Pack
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Create your account, verify email, and generate your first API key.
        </p>
      </div>

      {/* Step indicators */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-1 sm:gap-2 justify-between">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className={cn(
                "flex flex-col items-center gap-1 flex-1 min-w-[52px]",
                state.step >= s.num ? "text-accent" : "text-muted-foreground",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border text-xs sm:text-sm",
                  state.step > s.num
                    ? "bg-success/15 border-success text-success"
                    : state.step === s.num
                      ? "bg-accent/15 border-accent"
                      : "border-border",
                )}
              >
                {state.step > s.num ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  s.num
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-center leading-tight hidden xs:block">
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-1.5 mt-4" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="glass-card rounded-2xl p-5 sm:p-8"
        >
          {state.step === 1 && (
            <div>
              <h2 className="font-heading text-xl font-semibold mb-1">
                Step 1 — Create account
              </h2>
              <p className="text-small text-muted-foreground mb-6">
                Register your organization via POST /v1/auth/register
              </p>
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(handleRegister)}
                  className="space-y-4"
                >
                  <FormField
                    control={registerForm.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Rwanda Ltd" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="owner@acme.rw" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Min. 8 characters" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create account
                  </Button>
                </form>
              </Form>
              <p className="mt-4 text-center text-small text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href={`${PUBLIC_ROUTES.login}?callbackUrl=${encodeURIComponent(PUBLIC_ROUTES.getStarted)}`}
                  className="text-accent hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {state.step === 2 && (
            <div>
              <h2 className="font-heading text-xl font-semibold mb-1">
                Step 2 — Verify email
              </h2>
              <p className="text-small text-muted-foreground mb-4">
                POST /v1/auth/verify-email with your verification token.
              </p>
              <Alert className="mb-6">
                <Database className="h-4 w-4" />
                <AlertTitle>Local testing tip</AlertTitle>
                <AlertDescription className="text-small">
                  Find your verification token in the local PostgreSQL{" "}
                  <code className="font-mono">auth_action_tokens</code> table
                  where <code className="font-mono">action = &apos;VERIFY_EMAIL&apos;</code>.
                </AlertDescription>
              </Alert>
              <Form {...verifyForm}>
                <form
                  onSubmit={verifyForm.handleSubmit(handleVerify)}
                  className="space-y-4"
                >
                  <FormField
                    control={verifyForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification token</FormLabel>
                        <FormControl>
                          <Input placeholder="Paste token from database" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    Verify email
                  </Button>
                </form>
              </Form>
            </div>
          )}

          {state.step === 3 && (
            <div>
              <h2 className="font-heading text-xl font-semibold mb-1">
                Step 3 — Generate API key
              </h2>
              <p className="text-small text-muted-foreground mb-6">
                Provision your first TEST key via POST /v1/developer/api-keys
              </p>
              {!session ? (
                <Alert>
                  <AlertTitle>Session required</AlertTitle>
                  <AlertDescription>
                    Please sign in to generate an API key.
                  </AlertDescription>
                </Alert>
              ) : (
                <Button onClick={handleGenerateKey} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                  Generate TEST API key
                </Button>
              )}
            </div>
          )}

          {state.step === 4 && state.apiKey && (
            <div>
              <h2 className="font-heading text-xl font-semibold mb-1">
                Step 4 — Copy API key
              </h2>
              <Alert className="border-destructive/30 bg-destructive/5">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle>Reveal once</AlertTitle>
                <AlertDescription>
                  This key is shown only once. Store it securely before continuing.
                </AlertDescription>
              </Alert>
              <CodeBlock
                code={keyRevealed ? state.apiKey : "••••••••••••••••••••••••••••••••"}
                language="text"
                title="API Key"
              />
              <Button onClick={handleCopyKey} className="w-full mt-4">
                <Copy className="h-4 w-4 mr-2" />
                Copy &amp; continue
              </Button>
            </div>
          )}

          {state.step === 5 && (
            <div>
              <h2 className="font-heading text-xl font-semibold mb-1">
                Step 5 — Send first request
              </h2>
              <p className="text-small text-muted-foreground mb-4">
                Live GET /v1/compliance/nida/mock/1200580064278104 using your new key
              </p>
              <CodeBlock
                code={`GET /v1/compliance/nida/mock/1200580064278104\nAuthorization: Bearer ${state.apiKey?.slice(0, 12)}…`}
                language="bash"
              />
              {testResponse && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        "text-xs font-mono px-2 py-0.5 rounded",
                        testStatus && testStatus < 400
                          ? "bg-success/15 text-success"
                          : "bg-destructive/15 text-destructive",
                      )}
                    >
                      {testStatus}
                    </span>
                  </div>
                  <CodeBlock code={testResponse} language="json" title="Response" />
                </div>
              )}
              <Button
                onClick={handleFirstRequest}
                disabled={loading}
                className="w-full mt-4"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Terminal className="h-4 w-4 mr-2" />}
                Run test request
              </Button>
            </div>
          )}

          {state.step === 6 && (
            <div className="text-center py-4">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-semibold text-success mb-2">
                ✓ API Connected!
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Next: Open Dashboard to view analytics, create webhooks, and start building.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground"
                >
                  Open Dashboard
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
                <Link
                  href="/dashboard/playground"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium hover:bg-hover"
                >
                  API Playground
                </Link>
              </div>
            </div>
          )}

          {state.step > 1 && state.step < 6 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-6"
              onClick={() => updateState({ step: Math.max(1, state.step - 1) })}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
