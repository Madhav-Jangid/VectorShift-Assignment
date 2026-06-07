import { useState } from 'react';
import { useStore } from '../../app/store';
import { INCIDENT_BRIEFING_COPILOT, QA_CHATBOT, API_SUMMARIZER } from '../../data/workflows';

const FEATURES = [
  {
    num: '01',
    title: 'Visual pipeline builder',
    body: 'Compose inputs, prompts, APIs, branches, and outputs on one precise canvas.',
  },
  {
    num: '02',
    title: 'Agentic orchestration',
    body: 'Turn goals into multi-step systems that route, enrich, parse, and self-correct.',
  },
  {
    num: '03',
    title: 'Live integrations',
    body: 'Connect external APIs and model providers without rebuilding the workflow.',
  },
  {
    num: '04',
    title: 'Provenance by default',
    body: 'Every run stays inspectable, from source signal to final response.',
  },
];

const HERO_NODES = [
  { label: 'Input', meta: 'Deal brief', x: '8%', y: '28%', color: '#10B981' },
  { label: 'LLM', meta: 'Reasoning', x: '38%', y: '42%', color: '#6366F1' },
  { label: 'Output', meta: 'Memo', x: '68%', y: '28%', color: '#F59E0B' },
];

const HERO_LINES = [
  { left: '22%', top: '38%', width: '28%', rotate: '18deg' },
  { left: '52%', top: '43%', width: '27%', rotate: '-18deg' },
];

const TEMPLATES = [
  {
    ...INCIDENT_BRIEFING_COPILOT,
    real: true,
    tag: 'Finance Agent',
    accent: '#E8703A',
  },
  {
    ...QA_CHATBOT,
    real: true,
    tag: 'LLM Pipeline',
    accent: '#6366F1',
    preview: [
      { color: '#10B981', label: 'Input' },
      { color: '#EC4899', label: 'Text' },
      { color: '#6366F1', label: 'LLM' },
      { color: '#F59E0B', label: 'Output' },
    ],
  },
  {
    ...API_SUMMARIZER,
    real: true,
    tag: 'API + LLM',
    accent: '#0EA5E9',
  },
  {
    id: 'sentiment',
    name: 'Sentiment Analyzer',
    tag: 'Classification',
    accent: '#EC4899',
    preview: [
      { color: '#10B981', label: 'Input' },
      { color: '#6366F1', label: 'LLM' },
      { color: '#F59E0B', label: 'Output' },
    ],
    real: false,
  },
  {
    id: 'doc-summarizer',
    name: 'Document Summarizer',
    tag: 'Summarization',
    accent: '#8B5CF6',
    preview: [
      { color: '#10B981', label: 'Input' },
      { color: '#EC4899', label: 'Text' },
      { color: '#6366F1', label: 'LLM' },
      { color: '#F59E0B', label: 'Output' },
    ],
    real: false,
  },
  {
    id: 'email-notifier',
    name: 'Email Notifier',
    tag: 'Automation',
    accent: '#06B6D4',
    preview: [
      { color: '#10B981', label: 'Input' },
      { color: '#6366F1', label: 'LLM' },
      { color: '#06B6D4', label: 'Email' },
    ],
    real: false,
  },
  {
    id: 'content-moderator',
    name: 'Content Moderator',
    tag: 'Routing',
    accent: '#EF4444',
    preview: [
      { color: '#10B981', label: 'Input' },
      { color: '#6366F1', label: 'LLM' },
      { color: '#EF4444', label: 'Condition' },
      { color: '#F59E0B', label: 'Output' },
    ],
    real: false,
  },
  {
    id: 'researcher',
    name: 'Multi-step Researcher',
    tag: 'Multi-step',
    accent: '#F59E0B',
    preview: [
      { color: '#10B981', label: 'Input' },
      { color: '#0EA5E9', label: 'API' },
      { color: '#8B5CF6', label: 'JSON' },
      { color: '#6366F1', label: 'LLM' },
    ],
    real: false,
  },
  {
    id: 'scheduled-report',
    name: 'Scheduled Report',
    tag: 'Automation',
    accent: '#F97316',
    preview: [
      { color: '#F59E0B', label: 'Delay' },
      { color: '#6366F1', label: 'LLM' },
      { color: '#06B6D4', label: 'Email' },
    ],
    real: false,
  },
  {
    id: 'webhook-handler',
    name: 'Webhook Handler',
    tag: 'Integration',
    accent: '#10B981',
    preview: [
      { color: '#0EA5E9', label: 'API' },
      { color: '#8B5CF6', label: 'JSON' },
      { color: '#F59E0B', label: 'Output' },
    ],
    real: false,
  },
  {
    id: 'conditional-router',
    name: 'Conditional Router',
    tag: 'Branching',
    accent: '#A78BFA',
    preview: [
      { color: '#10B981', label: 'Input' },
      { color: '#EF4444', label: 'Condition' },
      { color: '#F59E0B', label: 'Output x2' },
    ],
    real: false,
  },
];

const ArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14m-4-4 4 4-4 4" />
  </svg>
);

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M13.5 10.5A6 6 0 0 1 5.5 2.5a6 6 0 1 0 8 8z" />
  </svg>
);

const FeatureCard = ({ num, title, body }) => (
  <div
    className="min-h-[190px] p-6 sm:p-7 flex flex-col justify-between"
    style={{ background: 'var(--card)' }}
  >
    <span className="font-mono text-[13px]" style={{ color: 'var(--accent)' }}>
      {num}
    </span>
    <div>
      <h3
        className="font-sans mb-3 leading-[1.14]"
        style={{ color: 'var(--ink)', fontSize: 'clamp(18px, 2vw, 24px)', fontWeight: 400 }}
      >
        {title}
      </h3>
      <p className="font-sans text-[14px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
        {body}
      </p>
    </div>
  </div>
);

const NodeChain = ({ preview }) => (
  <div className="flex items-center gap-[5px]" aria-hidden="true">
    {preview.map((node, index) => (
      <div key={`${node.label}-${index}`} className="flex items-center gap-[5px]">
        {index > 0 && <span className="block h-px w-4" style={{ background: 'var(--border-2)' }} />}
        <span
          className="block h-[7px] w-[7px] rounded-full"
          style={{ background: node.color }}
          title={node.label}
        />
      </div>
    ))}
  </div>
);

const TemplateCard = ({ template, index, onUse }) => {
  const [isHovered, setIsHovered] = useState(false);
  const num = String(index + 1).padStart(2, '0');

  return (
    <button
      type="button"
      disabled={!template.real}
      onClick={() => template.real && onUse(template)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative min-h-[188px] w-full overflow-hidden text-left transition-all duration-200 disabled:cursor-default"
      style={{
        background: isHovered && template.real ? 'var(--surface)' : 'var(--card)',
        border: '0',
        borderTop: `2px solid ${isHovered && template.real ? template.accent : 'transparent'}`,
        padding: '22px',
      }}
    >
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div
            className="font-mono text-[12px] uppercase tracking-[0.16em]"
            style={{ color: template.real ? template.accent : 'var(--dim)' }}
          >
            {template.real ? 'Ready now' : 'Coming soon'}
          </div>
          <div className="mt-2 font-mono text-[12px]" style={{ color: 'var(--dim)' }}>
            {num}
          </div>
        </div>
        <NodeChain preview={template.preview} />
      </div>

      <h3
        className="mb-2 font-sans leading-[1.15]"
        style={{ color: 'var(--ink)', fontSize: '18px', fontWeight: 400 }}
      >
        {template.name}
      </h3>
      <p className="font-mono text-[11px] uppercase tracking-[0.13em]" style={{ color: 'var(--muted)' }}>
        {template.tag}
      </p>

      <div
        className="absolute bottom-5 left-[22px] flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.13em] transition-all duration-200"
        style={{
          color: template.real ? template.accent : 'var(--dim)',
          opacity: template.real ? (isHovered ? 1 : 0.68) : (isHovered ? 1 : 0),
          transform: isHovered ? 'translateY(0)' : 'translateY(3px)',
        }}
      >
        {template.real ? 'Use template' : 'Unavailable'}
        <ArrowIcon />
      </div>
    </button>
  );
};

const HeroWorkflow = () => (
  <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '120px 120px',
        opacity: 0.2,
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(180deg, rgba(6,8,11,0.18) 0%, rgba(6,8,11,0.48) 54%, rgba(6,8,11,0.92) 100%), linear-gradient(90deg, rgba(6,8,11,0.98) 0%, rgba(6,8,11,0.9) 46%, rgba(6,8,11,0.62) 100%)',
      }}
    />
    <div
      className="absolute right-[4vw] top-[22vh] hidden h-[320px] w-[520px] max-w-[44vw] md:block"
      style={{ opacity: 0.58 }}
    >
      {HERO_LINES.map((line, index) => (
        <div
          key={index}
          className="absolute h-px origin-left"
          style={{
            left: line.left,
            top: line.top,
            width: line.width,
            transform: `rotate(${line.rotate})`,
            background: 'linear-gradient(90deg, rgba(251,249,244,0.08), rgba(197,165,98,0.5), rgba(251,249,244,0.08))',
          }}
        />
      ))}
      {HERO_NODES.map((node) => (
        <div
          key={node.label}
          className="absolute w-[142px] border p-4"
          style={{
            left: node.x,
            top: node.y,
            borderColor: 'rgba(251,249,244,0.12)',
            background: 'rgba(10,12,16,0.46)',
            color: '#FBF9F4',
            boxShadow: '0 18px 44px rgba(0,0,0,0.18)',
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="h-2 w-2 rounded-full" style={{ background: node.color }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(251,249,244,0.48)' }}>
              Live
            </span>
          </div>
          <div className="font-sans text-[15px] leading-none">{node.label}</div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.11em]" style={{ color: 'rgba(251,249,244,0.54)' }}>
            {node.meta}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const LandingScreen = () => {
  const goToCanvas   = useStore((s) => s.goToCanvas);
  const loadWorkflow = useStore((s) => s.loadWorkflow);
  const clearCanvas  = useStore((s) => s.clearCanvas);
  const theme        = useStore((s) => s.theme);
  const toggleTheme  = useStore((s) => s.toggleTheme);

  const handleUseTemplate = (template) => {
    loadWorkflow({ nodes: template.nodes, edges: template.edges });
  };

  const handleStartFromScratch = () => {
    clearCanvas();
    goToCanvas();
  };

  return (
    <div data-theme={theme} className="min-h-screen font-sans" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <section className="relative min-h-[82vh] overflow-hidden" style={{ background: '#06080b' }}>
        <HeroWorkflow />

        <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <div className="font-sans text-[19px] leading-none" style={{ color: '#FBF9F4', fontWeight: 400 }}>
            Vector<em className="font-serif italic" style={{ color: '#C5A562' }}>Shift</em>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center transition-colors duration-150"
              style={{
                border: '1px solid rgba(251,249,244,0.22)',
                background: 'rgba(251,249,244,0.04)',
                color: 'rgba(251,249,244,0.82)',
              }}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              type="button"
              onClick={goToCanvas}
              className="hidden items-center gap-2 px-4 py-[10px] font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-150 sm:flex"
              style={{
                border: '1px solid rgba(251,249,244,0.26)',
                background: 'rgba(251,249,244,0.08)',
                color: '#FBF9F4',
              }}
            >
              Canvas
              <ArrowIcon />
            </button>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(82vh-80px)] max-w-[1440px] flex-col justify-center px-5 pb-12 pt-16 sm:px-8 lg:px-12">
          <div className="max-w-[780px]">
            <div className="mb-6 flex max-w-[390px] items-center gap-4">
              <span className="h-px w-14" style={{ background: 'rgba(251,249,244,0.42)' }} />
              <span className="font-mono text-[12px] uppercase tracking-[0.22em]" style={{ color: 'rgba(251,249,244,0.82)' }}>
                Pipeline Builder
              </span>
            </div>

            <h1
              className="font-sans leading-[0.98]"
              style={{
                color: '#FBF9F4',
                fontSize: 'clamp(46px, 7.2vw, 104px)',
                fontWeight: 300,
              }}
            >
              VectorShift
              <br />
              <em className="font-serif italic" style={{ fontWeight: 400 }}>Pipeline</em> Builder
            </h1>

            <p
              className="mt-7 max-w-[570px] font-sans leading-[1.65]"
              style={{ color: 'rgba(251,249,244,0.84)', fontSize: 'clamp(16px, 1.35vw, 20px)', fontWeight: 300 }}
            >
              Build agentic AI workflows visually. Connect models, APIs, branching logic, and outputs on a canvas that keeps every run traceable.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
              type="button"
              onClick={handleStartFromScratch}
              className="inline-flex items-center gap-3 px-5 py-4 font-sans text-[14px] font-medium transition-colors duration-200"
              style={{ background: '#FBF9F4', color: '#0F131A', border: '1px solid #FBF9F4' }}
            >
                Start from scratch
                <ArrowIcon />
              </button>
              <a
                href="#templates"
                className="inline-flex items-center gap-3 px-5 py-4 font-sans text-[14px] transition-colors duration-200"
                style={{ color: '#FBF9F4', border: '1px solid rgba(251,249,244,0.28)' }}
              >
                Browse templates
                <ArrowIcon />
              </a>
            </div>
          </div>

          <div className="mt-12 h-px w-full max-w-[900px]" style={{ background: 'rgba(251,249,244,0.16)' }} />
        </div>
      </section>

      <section style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[240px_1fr]">
          <div className="px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
            <div className="font-mono text-[13px] uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
              Overview
            </div>
          </div>
          <div className="px-5 pb-12 sm:px-8 lg:px-12 lg:py-16">
            <h2
              className="max-w-[850px] font-sans leading-[1.06]"
              style={{ color: 'var(--ink)', fontSize: 'clamp(32px, 4.2vw, 64px)', fontWeight: 300 }}
            >
              A single platform for <em className="font-serif italic" style={{ fontWeight: 400 }}>AI workflows</em> that move from idea to execution.
            </h2>
            <p className="mt-5 max-w-[620px] text-[16px] leading-[1.7]" style={{ color: 'var(--ink-2)', fontWeight: 300 }}>
              The landing screen mirrors the official VectorShift pages while making the assessment app immediately usable: pick a proven workflow or open a blank canvas.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: 'var(--border)' }}>
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.num} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section id="templates" style={{ background: 'var(--surface)' }}>
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
            <div>
              <div className="font-mono text-[13px] uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
                Workflow Templates
              </div>
            </div>
            <div>
              <h2
                className="max-w-[780px] font-sans leading-[1.06]"
                style={{ color: 'var(--ink)', fontSize: 'clamp(30px, 3.6vw, 54px)', fontWeight: 300 }}
              >
                Start from a <em className="font-serif italic" style={{ fontWeight: 400 }}>pre-built pipeline</em>.
              </h2>
              <p className="mt-5 max-w-[620px] text-[15px] leading-[1.7]" style={{ color: 'var(--ink-2)', fontWeight: 300 }}>
                Three templates are ready to load today. The rest show the broader workflow library direction without changing the current app contract.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ background: 'var(--border)' }}>
            {TEMPLATES.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={index}
                onUse={handleUseTemplate}
              />
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div className="font-sans text-[18px]">
            Vector<em className="font-serif italic">Shift</em>
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[0.15em]" style={{ color: 'rgba(255,254,251,0.58)' }}>
            Pipeline Builder / Visual AI Workflow Studio
          </div>
        </div>
      </footer>
    </div>
  );
};
