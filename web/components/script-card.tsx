import { FileCode, GithubLogo, Play, Sparkle } from "@phosphor-icons/react/dist/ssr";
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
    <article className="card-glass overflow-hidden">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-2 border-b border-white/10 bg-white/[0.02] px-4 py-3.5 sm:px-6">
        <h3 className="flex min-w-0 items-baseline gap-2 font-mono text-sm font-semibold text-white">
          <FileCode
            size={18}
            className="shrink-0 translate-y-0.5 text-amber-400"
            aria-hidden="true"
          />
          <span className="break-all">{script.file}</span>
        </h3>

        {hasDemo && (
          <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-[11px] gap-1 px-2.5 py-0.5">
            <Play size={10} weight="fill" />
            <span>runs in your browser</span>
          </Badge>
        )}

        {hasAgent && (
          <Badge className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono text-[11px] gap-1 px-2.5 py-0.5">
            <Sparkle size={10} weight="fill" />
            <span>live agent</span>
          </Badge>
        )}

        {!hasDemo && !hasAgent && (
          <Badge className="bg-amber-500/10 text-amber-300 border border-amber-500/25 font-mono text-[11px] px-2.5 py-0.5">
            run in Colab
          </Badge>
        )}

        <a
          href={githubFileUrl(`${chapter.folder}/${script.file}`)}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-white"
        >
          <GithubLogo size={15} aria-hidden="true" />
          <span>Source on GitHub</span>
        </a>

        <p className="w-full text-xs sm:text-sm text-slate-300 leading-relaxed">
          {script.description}
        </p>
      </header>

      <div className="p-4 sm:p-5">
        {hasDemo && hasAgent && agentEntry ? (
          <Tabs defaultValue="demo">
            <TabsList className="mb-4 bg-white/5 border border-white/10 p-1 rounded-lg">
              <TabsTrigger
                value="demo"
                className="text-xs data-[state=active]:bg-emerald-500 data-[state=active]:text-navy-950 font-medium transition-all"
              >
                Tool, in your browser
              </TabsTrigger>
              <TabsTrigger
                value="agent"
                className="text-xs data-[state=active]:bg-cyan-500 data-[state=active]:text-navy-950 font-medium transition-all"
              >
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
          <div className="overflow-hidden rounded-lg border border-white/10">
            {originalSource !== undefined && (
              <CodeView
                source={originalSource}
                expandable
                title={`${chapter.folder}/${script.file}`}
              />
            )}
            <p className="border-t border-white/10 bg-[#060913]/80 px-4 py-3 text-xs text-slate-400 leading-relaxed">
              {agentEntry?.reason ??
                "This script needs packages beyond the browser runtime."}{" "}
              <a
                href={colabUrl(chapter.slug)}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 underline underline-offset-2 hover:text-white"
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
