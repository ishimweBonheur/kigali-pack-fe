"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/public/code-block";
import {
  WEBHOOK_VERIFICATION_SNIPPETS,
  type WebhookSnippetId,
} from "@/content/docs/webhook-verification-snippets";

const SNIPPET_ORDER: WebhookSnippetId[] = [
  "node",
  "express",
  "nestjs",
  "python",
  "go",
];

export function WebhookVerificationTabs() {
  return (
    <Tabs defaultValue="node" className="my-6">
      <TabsList className="flex flex-wrap h-auto gap-1 bg-secondary/50 w-full justify-start">
        {SNIPPET_ORDER.map((id) => (
          <TabsTrigger
            key={id}
            value={id}
            className="text-[11px] sm:text-xs px-2 sm:px-3 py-1.5"
          >
            {WEBHOOK_VERIFICATION_SNIPPETS[id].label}
          </TabsTrigger>
        ))}
      </TabsList>
      {SNIPPET_ORDER.map((id) => {
        const snippet = WEBHOOK_VERIFICATION_SNIPPETS[id];
        return (
          <TabsContent key={id} value={id} className="mt-4">
            <CodeBlock
              code={snippet.code}
              language={snippet.language}
              title={`${snippet.label} verification`}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
