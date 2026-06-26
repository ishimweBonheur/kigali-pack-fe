"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  Loader2,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/schemas/auth";
import { authService, profileService } from "@/services/auth.service";
import { apiKeysService } from "@/services/api-keys.service";
import { publicService } from "@/services/public.service";
import {
  ONBOARDING_STORAGE_KEY,
  API_KEY_STORAGE_KEY,
  API_PUBLIC_URL,
} from "@/constants";
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
import { PublicPageShell } from "@/components/public/public-page-shell";

interface OnboardingState {
  step: number;
  email?: string;
  verified: boolean;
  apiKey?: string;
  keyCopied: boolean;
  firstRequestOk: boolean;
  completed: boolean;
}

const DEFAULT_STATE: OnboardingState = {
  step: 1,
  verified: false,
  keyCopied: false,
  firstRequestOk: false,
  completed: false,
};

const STEPS = [
  { num: 1, label: "Register", icon: UserPlus },
  { num: 2, label: "Verify Email", icon: Mail },
  { num: 3, label: "Generate Key", icon: Key },
  { num: 4, label: "Copy Key", icon: Copy },
  { num: 5, label: "Test Request", icon: Terminal },
  { num: 6, label: "Dashboard", icon: CheckCircle2 },
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

function maxAllowedStep(state: OnboardingState): number {
  if (!state.email) return 1;
  if (!state.verified) return 2;
  if (!state.apiKey) return 3;
  if (!state.keyCopied) return 4;
  if (!state.firstRequestOk) return 5;
  return 6;
}

export function OnboardingWizard() {
  const { data: session, status: sessionStatus } = useSession();
  const [state, setState] = useState<OnboardingState>(() => loadState());
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [keyRevealed, setKeyRevealed] = useState(false);
  const [testResponse, setTestResponse] = useState("");
  const [testStatus, setTestStatus] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateState = useCallback((patch: Partial<OnboardingState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      const capped = Math.min(next.step, maxAllowedStep(next));
      next.step = capped;
      saveState(next);
      return next;
    });
  }, []);

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { organizationName: "", email: "", password: "" },
  });

  const refreshVerificationStatus = useCallback(async () => {
    if (!session) return false;
    setCheckingStatus(true);
    try {
      const status = await authService.getVerificationStatus();
      if (status.emailVerified) {
        updateState({ verified: true, step: 3 });
        toast.success("Email verified!");
        return true;
      }
      return false;
    } catch {
      try {
        const profile = await profileService.getProfile();
        if (profile.emailVerified) {
          updateState({ verified: true, step: 3 });
          toast.success("Email verified!");
          return true;
        }
      } catch {
        /* ignore */
      }
      return false;
    } finally {
      setCheckingStatus(false);
    }
  }, [session, updateState]);

  useEffect(() => {
    if (sessionStatus !== "authenticated" || state.verified || state.step < 2) {
      return;
    }

    pollRef.current = setInterval(() => {
      void refreshVerificationStatus();
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [
    sessionStatus,
    state.verified,
    state.step,
    refreshVerificationStatus,
  ]);

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
      updateState({ step: 2, email: data.email, verified: false });
      toast.success("Account created! Check your inbox for a verification email.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const result = await authService.resendVerificationEmail();
      if (result.verificationEmailSent) {
        toast.success("Verification email sent.");
      } else {
        toast.error(
          "Could not send email. SMTP may not be configured on the server.",
        );
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setResending(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!state.verified) {
      toast.error("Verify your email before generating an API key.");
      return;
    }
    setLoading(true);
    try {
      const key = await apiKeysService.create({
        environment: "TEST",
        name: "Onboarding Key",
      });
      localStorage.setItem(API_KEY_STORAGE_KEY, key.rawToken);
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
      localStorage.setItem(API_KEY_STORAGE_KEY, state.apiKey);
      toast.success("Copied to clipboard");
      updateState({ step: 5, keyCopied: true });
    }
  };

  const handleFirstRequest = async () => {
    if (!state.apiKey) return;
    setLoading(true);
    try {
      const result = await publicService.probeEndpoint(
        "GET",
        "/v1/locations/root-provinces",
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

  const goBack = () => {
    updateState({ step: Math.max(1, state.step - 1) });
  };

  const progress = ((state.step - 1) / (STEPS.length - 1)) * 100;
  const allowedMax = maxAllowedStep(state);

  return (
    <PublicPageShell className="py-8 sm:py-16">
      <div className="mx-auto w-full max-w-4xl">
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight">
          Get started with Kigali-Pack
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Register, verify your email, generate an API key, and send your first request.
        </p>
      </div>

      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-1 sm:gap-2 justify-between">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className={cn(
                "flex flex-col items-center gap-1 flex-1 min-w-[52px]",
                state.step >= s.num ? "text-accent" : "text-muted-foreground",
                s.num > allowedMax && "opacity-40",
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
                Step 1 — Register
              </h2>
              <p className="text-small text-muted-foreground mb-6">
                Create your organization and owner account.
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
              <Alert className="mb-6 border-accent/30 bg-accent/5">
                <Mail className="h-4 w-4" />
                <AlertTitle>Verification email sent</AlertTitle>
                <AlertDescription className="text-small">
                  We sent a verification link to{" "}
                  <strong>{state.email ?? session?.user?.email ?? "your email"}</strong>.
                  Click the link in the email to continue. The link expires in 20 minutes.
                </AlertDescription>
              </Alert>

              {state.verified ? (
                <Alert className="mb-6 border-success/30 bg-success/5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertTitle>Email verified</AlertTitle>
                  <AlertDescription>
                    You can now generate your API key.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  <p className="text-small text-muted-foreground">
                    Waiting for verification… this page checks automatically every few seconds.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => void refreshVerificationStatus()}
                      disabled={checkingStatus || !session}
                      className="flex-1"
                    >
                      {checkingStatus ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Check status
                    </Button>
                    <Button
                      onClick={() => void handleResend()}
                      disabled={resending || !session}
                      className="flex-1"
                    >
                      {resending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      Resend email
                    </Button>
                  </div>
                  {!session && (
                    <p className="text-small text-muted-foreground">
                      Sign in to resend or check verification status.
                    </p>
                  )}
                </div>
              )}

              {state.verified && (
                <Button
                  className="w-full mt-4"
                  onClick={() => updateState({ step: 3 })}
                >
                  Continue to Generate API Key
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          )}

          {state.step === 3 && (
            <div>
              <h2 className="font-heading text-xl font-semibold mb-1">
                Step 3 — Generate API key
              </h2>
              <p className="text-small text-muted-foreground mb-6">
                Provision your first TEST key. You must verify email before this step.
              </p>
              {!state.verified && (
                <Alert className="mb-4">
                  <AlertTitle>Email verification required</AlertTitle>
                  <AlertDescription>
                    Complete Step 2 before generating keys.
                  </AlertDescription>
                </Alert>
              )}
              {!session ? (
                <Alert>
                  <AlertTitle>Session required</AlertTitle>
                  <AlertDescription>
                    Please sign in to generate an API key.
                  </AlertDescription>
                </Alert>
              ) : (
                <Button
                  onClick={() => void handleGenerateKey()}
                  disabled={loading || !state.verified}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
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
              <Alert className="border-destructive/30 bg-destructive/5 mb-4">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle>Store securely</AlertTitle>
                <AlertDescription>
                  This key may not be shown again. Copy it before continuing.
                </AlertDescription>
              </Alert>
              <CodeBlock
                code={`Authorization: Bearer ${keyRevealed ? state.apiKey : "kp_test_xxxxx"}`}
                language="text"
                title="Usage example"
              />
              <CodeBlock
                code={keyRevealed ? state.apiKey : "••••••••••••••••••••••••••••••••"}
                language="text"
                title="API Key"
              />
              <Button onClick={() => void handleCopyKey()} className="w-full mt-4">
                <Copy className="h-4 w-4 mr-2" />
                Copy &amp; continue
              </Button>
            </div>
          )}

          {state.step === 5 && (
            <div>
              <h2 className="font-heading text-xl font-semibold mb-1">
                Step 5 — Test first request
              </h2>
              <p className="text-small text-muted-foreground mb-4">
                Live GET /v1/locations/root-provinces using your new key
              </p>
              <CodeBlock
                code={`curl ${API_PUBLIC_URL}/v1/locations/root-provinces \\
  -H "Authorization: Bearer ${state.apiKey?.slice(0, 16)}…"`}
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
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button
                  onClick={() => void handleFirstRequest()}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Terminal className="h-4 w-4 mr-2" />
                  )}
                  Run test request
                </Button>
                <Link
                  href="/docs/quick-start"
                  className="inline-flex flex-1 h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium hover:bg-hover"
                >
                  <BookOpen className="h-4 w-4" />
                  Read docs
                </Link>
              </div>
            </div>
          )}

          {state.step === 6 && (
            <div className="text-center py-4">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-semibold text-success mb-2">
                ✓ Ready to integrate
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Your API key works. Open the dashboard or explore the full documentation.
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
                  href="/docs/introduction"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium hover:bg-hover"
                >
                  Full documentation
                </Link>
              </div>
            </div>
          )}

          {state.step > 1 && state.step < 6 && (
            <Button variant="ghost" size="sm" className="mt-6" onClick={goBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
      </div>
    </PublicPageShell>
  );
}
