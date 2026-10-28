# Creative Claw — Nebius x NVIDIA 2026

Prepared 2026-10-26; refreshed from current upstream 2026-10-28. Status: documentation and existing foundation only; sponsor integration and new UI have not been implemented or live-tested.

## Product

A general-purpose creative agent for editing user-provided photos, audio and video. Import files, request an edit in plain language, inspect a preview, correct the result and export. No sport-specific classifier, domain branding or dataset is required.

Build from Creative Claw rather than a new application. This entry is an independent named copy for the competition, with a shared upstream foundation:
https://github.com/bkennedyshit/creative-claw
Baseline: 64536967c0e5729cce527730d44279279a0db208.

## Existing foundation versus new work

The inherited README documents a model-driven runtime, native C++ media engines called in-process through koffi FFI, local perception, GPU coordination and SQLite visual memory. The repository has an inherited web control UI in ui/. Native binaries/model assets are separately provisioned and gitignored; cloning source alone does not make all engines runnable.

These are inherited capabilities, not newly proven competition results. Audit actual available operations and binaries before picking the demo.

New work: NVIDIA model integration through Nebius, targeted improvements to the existing Creative Studio interface, one complete revision/export loop, model-run evidence, reproducible setup and measured evaluation.

## Rules and track

Official rules: https://nebiusglobalaihackathon.devpost.com/rules
Best Apps and Agents is the intended track. Runtime must use Nebius Token Factory or Nebius AI Cloud and at least one NVIDIA open-source model. Existing projects need significant updates explained. Provide a runnable demo/test build, a public licensed source repository, setup instructions, a public YouTube video under three minutes, platform feedback and a description. Deadline: Oct 30, 2026, 13:00 America/New_York.

An NVIDIA API call on another host alone does not meet the Nebius runtime requirement. Serverless Jobs/Endpoints are optional. Show sponsor inference doing meaningful work, not a decorative call.

## Minimal implementation

1. Reuse the current gateway, provider seams, creative tools and UI. Inspect existing integrations before writing an adapter.
2. Connect one hosted NVIDIA model on Token Factory. Validate real tool-call schema, images, context limits and authentication with the user's authorized account.
3. Expose a small working tool set: inspect media, adjust image, trim video, inspect/export result. Select supported operations from real tool discovery.
4. Add visible input/preview/output surfaces and a correction turn; retain source files.
5. Store edit choices and source-linked asset references using existing memory owners. Keep agent runtime state in the repository's canonical SQLite stores.
6. Measure successful exports, time, retries and model/token usage. No fabricated savings or benchmark results.

## Demo selection

Use generic creator media. Choose one workflow after baseline verification:
- Batch photos: requested consistent treatment, preview, adjustment, export.
- Video: find a described moment using actual perception evidence, trim it, revise boundaries, export.

One complete workflow is enough. Do not add training, autonomous publication, payments, or new hardware.

## Shared-development discipline

Keep provider-neutral fixes easy to apply to the Meta copy. Separate sponsor configuration and new-work notes. Do not represent the same pre-existing engines as new work in either event. Preserve upstream OpenClaw credit, existing license and third-party notices.

## Read next

- HACKATHON_MODELS.md: models, memory and VR decisions.
- HACKATHON_EXECUTION.md: build order, evidence and submission.

## Current upstream refresh

The October 28 source transfer uses upstream 64536967c0e5729cce527730d44279279a0db208, which includes the Creative Studio, editable graphs/recipes, native foreground effects and durable job UI source added since the earlier August baseline. Read extensions/creative-engines/README.md before designing more UI. Reuse these existing surfaces; confirm runtime behavior on a provisioned machine. Source inspection is not a fresh native-engine test.

Visual-memory search currently uses a hash embedder described as lexical/byte similarity; do not market it as semantic vision retrieval. The new provider integration must be evaluated separately.

## October 28 Studio refresh

Refreshed the inherited application to Creative Claw `64536967c0e5729cce527730d44279279a0db208`, including [merged PR #6](https://github.com/bkennedyshit/creative-claw/pull/6). Media tabs now scope the workflow editor, draft/path edits are retained, saved copies can be archived/restored, the canvas follows the viewport, and historical outputs have previews. These are inherited upstream fixes, not a new NVIDIA integration. Keep the existing Studio frontend; no sponsor-specific frontend replacement is needed.
