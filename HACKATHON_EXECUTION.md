# Nebius build and submission runbook

## Build sequence

- [ ] Inspect inherited AGENTS.md and scoped instructions; inventory actually runnable creative operations.
- [ ] Provision native binaries/model assets and verify one image and one video operation.
- [ ] Use existing provider support or add one narrow integration; live-test a NVIDIA model through Nebius.
- [ ] Ship one import -> request -> tool execution -> preview -> correction -> export path.
- [ ] Keep SQLite memory owner; add a persistence demo only when it works after restart.
- [ ] Check unavailable tool, API error and invalid argument behavior.
- [ ] Run appropriate scoped checks for code actually changed.
- [ ] Add source baseline, exact new commits and significant-update explanation.
- [ ] Publish required source/assets/build instructions under the appropriate license before submission.
- [ ] Record a public YouTube demo under three minutes and provide working test access.
- [ ] Write platform feedback from actual usage; submit by Oct 30 at 13:00 Eastern.

## Demo outline

0:00 user problem; 0:15 import ordinary media; 0:30 request edit; 0:45 actual Nemotron/Token Factory tool decision; 1:10 preview; 1:25 correction; 1:50 export and inspection; 2:10 new work versus existing Creative Claw; 2:30 measured result and limitations; end before 3:00.

## What to keep and defer

Keep native execution, local perception, visual memory, GPU coordination and existing gateway/provider seams. Simplify the visible UI to the editing job. Leave inherited unrelated channels out of the demo. Defer VR, new distributed-agent topology, training, replacement memory stacks and broad engine rewrites.

## Repository disclosure

The public repository must let judges reproduce the demonstrated behavior. A link to a private binary without usable access is not a reproducible submission. Preserve upstream licensing and notices. Nebius retains judging/promotional rights under its terms; a permissive code license independently permits reuse. Review the official rules before publishing.

## Resume prompt

Use Creative Claw as the application. Read HACKATHON_PLAN.md and HACKATHON_MODELS.md, verify model availability and native engine provisioning, then implement the smallest working general-purpose editing loop with meaningful NVIDIA inference through Nebius. No niche content restriction. All planned integrations remain unverified until exercised.
