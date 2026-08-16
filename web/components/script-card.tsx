import { FileCode, GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { AgentRunner } from "@/components/agent-runner";
import { CodeView } from "@/components/code-view";
import { DemoRunner } from "@/components/demo-runner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AgentEntry } from "@/lib/agents";
import type { Chapter, ScriptEntry } from "@/lib/chapters";
import type { DemoSpec } from "@/lib/demos";
import { colabUrl, githubFileUrl } from "@/lib/links";

export function ScriptCard({
  script,
  chapter,
  demoSpec,
  demoSource,
  agentEntry,
  originalSource,
}: {
  script: ScriptEntry;
  chapter: Chapter;
  demoSpec?: DemoSpec;
  demoSource?: string;
  agentEntry?: AgentEntry;
  originalSource?: string;
}) {
  const hasDemo = Boolean(demoSpec && demoSource !== undefined);
  const hasAgent = Boolean(agentEntry?.runnable);

  return (
    <article className="rounded-md border border-border bg-card">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border px-4 py-3 sm:px-5">
        {/* break-all: filenames like 02_pricing_reconciliation_tool.py
            are wider than a 320px phone and have no break opportunity. */}
        <h3 className="flex min-w-0 items-baseline gap-1.5 font-mono text-sm font-medium text-cream-100">
          <FileCode
            size={16}
            className="shrink-0 translate-y-0.5 text-gold-400"
            aria-hidden="true"
          />
          <span className="break-all">{script.file}</span>
        </h3>
        {hasDemo && (
          <Badge className="bg-run-ok/15 text-run-ok border-transparent font-mono text-[10px]">
            runs in your browser
          </Badge>
        )}
        {hasAgent && (
          <Badge className="bg-gold-400/15 text-gold-300 border-transparent font-mono text-[10px]">
            live agent
          </Badge>
        )}
        {!hasDemo && !hasAgent && (
          <Badge className="bg-navy-800 text-muted-foreground border-transparent font-mono text-[10px]">
            run in Colab
          </Badge>
        )}
        <a
          href={githubFileUrl(`${chapter.folder}/${script.file}`)}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-cream-100"
        >
          <GithubLogo size={14} aria-hidden="true" />
          Source on GitHub
        </a>
        <p className="w-full text-sm text-muted-foreground">
          {script.description}
        </p>
      </header>

      <div className="p-3 sm:p-4">
        {hasDemo && hasAgent && agentEntry ? (
          <Tabs defaultValue="demo">
            <TabsList className="mb-3 bg-navy-800/70">
              <TabsTrigger value="demo" className="text-xs">
                Tool, in your browser
              </TabsTrigger>
              <TabsTrigger value="agent" className="text-xs">
                Agent, on the server
              </TabsTrigger>
            </TabsList>
            <TabsContent value="demo">
              <DemoRunner spec={demoSpec!} initialSource={demoSource!} />
            </TabsContent>
            <TabsContent value="agent">
              <AgentRunner
                agent={agentEntry}
                chapter={chapter.slug}
                source={originalSource}
                title={`${chapter.folder}/${script.file}`}
              />
            </TabsContent>
          </Tabs>
        ) : hasDemo ? (
          <DemoRunner spec={demoSpec!} initialSource={demoSource!} />
        ) : hasAgent && agentEntry ? (
          <AgentRunner
            agent={agentEntry}
            chapter={chapter.slug}
            source={originalSource}
            title={`${chapter.folder}/${script.file}`}
          />
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            {originalSource !== undefined && (
              <CodeView
                source={originalSource}
                expandable
                title={`${chapter.folder}/${script.file}`}
              />
            )}
            <p className="border-t border-border bg-navy-950/60 px-4 py-2.5 text-xs text-muted-foreground">
              {agentEntry?.reason ??
                "This script needs packages beyond the browser runtime."}{" "}
              <a
                href={colabUrl(chapter.slug)}
                target="_blank"
                rel="noreferrer"
                className="text-gold-300 underline underline-offset-2"
              >
                Open the chapter in Colab
              </a>{" "}
              to run it with your own free Gemini key.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
