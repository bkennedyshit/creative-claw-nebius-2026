# NVIDIA model, memory and VR decisions

Research date: 2026-10-26. Research is not an API validation result. Recheck the account's model catalog and supported payloads before implementation.

## Candidate order

| Candidate | Proposed responsibility | Decision gate |
| --- | --- | --- |
| Nemotron 3.5 Super VL | Visual inspection plus reasoning/tool selection | Nebius officially lists nvidia/Nemotron-3.5-Super-VL. Verify images and tool calls end-to-end before adopting. |
| Nemotron 3 Super / Nano | Text orchestration from existing local perception summaries | Conservative first route. Official Super example: nvidia/nemotron-3-super-120b-a12b; verify account availability. |
| Nemotron 3 Ultra | Difficult planning after a simpler model demonstrably struggles | Nebius confirms public endpoints; optional escalation after measuring. |
| Nemotron 3 Nano Omni | Integrated audio/video/image understanding | Nebius describes a dedicated endpoint option; do not assume standard public-endpoint audio/video payload support. |

Official Nebius Oct 16 reference: https://nebius.com/blog/posts/three-new-open-weight-models-from-us-companies-give-builders-more-choice
It lists Super VL on an OpenAI-compatible API; this suggests an existing provider seam is the first integration to inspect.
Family: https://nebius.com/services/token-factory/nemotron
Ultra/public versus Nano Omni/dedicated: https://nebius.com/blog/posts/retail-ai-agents-nvidia-blueprints-nebius
Nano Omni research: https://blogs.nvidia.com/blog/nemotron-3-nano-omni-multimodal-ai-agents/

Do not substitute a Meta/Qwen-only endpoint and call it NVIDIA integration. Local perception may remain a supporting component while Nemotron makes real editing decisions.

## Memory: keep the existing owner

Keep SQLite visual memory, source-asset IDs, timestamps, user corrections and export history. Add the smallest needed creative preference, such as a requested crop or export preset, through existing storage APIs.

Model context windows are not durable application memory. Demonstrate persistence by restarting the app and retrieving an explicitly saved preference or asset, if memory is shown in the video.

NVIDIA offers an optional memory reference recipe, not a mandatory replacement:
https://developer.nvidia.com/blog/building-a-memory-driven-agent-with-nvidia-nemoclaw/
NemoClaw/OpenShell provide orchestration/sandboxing and persistence controls:
https://github.com/NVIDIA/NemoClaw

Evaluate those only after the baseline works; native FFI engines, local media and GPU access need compatibility checks. Do not add a second agent runtime or parallel memory database solely to display sponsor branding.

## VR / spatial media

Defer a new headset app, world generation and robot stack. The chosen track does not require VR. Keep an extension seam for 360/equirectangular media, projection metadata and spatial audio if existing native engines already support them. That support is unverified.

Cosmos/GROOT/robot policies do not automatically improve ordinary media editing. Add only when a concrete operation and a tested execution path justify them. Describe future VR ideas as future work.

## Small model evaluation

Run the same three tasks on each candidate: select a valid tool with valid arguments; revise an edit after a user correction; handle a missing/unavailable tool without pretending success. Then inspect the exported file. Record real model ID, endpoint, latency, token usage, retries and outcome. Use a licensed public/synthetic fixture; keep credentials outside git.
