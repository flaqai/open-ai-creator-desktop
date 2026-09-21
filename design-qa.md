# Design QA — prompt detail media viewer

- Source visual truth:
  `/Users/6677h/.codex/generated_images/01a07a5f-23c4-7501-aca8-04200ff50aea/exec-b926d917-7710-4ded-b5fa-40d1d62e9319.png`
- Implementation: `http://localhost:31415/zh/recommended-prompts/`
- State: light theme, Qwen Image 3.0 Example 3 detail dialog
- Checked: 2026-09-21 in the Codex in-app browser

## Result

The dialog now behaves as an adaptive media viewer rather than a fixed 16:9 card. On desktop the left side is a title,
full-height media canvas, and a bottom action row. The source image is fitted with its original ratio and is never
cropped at 100%. At zoom levels from 125% through 300%, the image can be grabbed and moved while calculated bounds
prevent empty canvas from being exposed.

The desktop divider now has three stable states: split, full prompt, and full media. Split widths accept a 20–72% media
range, while dragging beyond either threshold previews the destination and commits it only on release. Pointer movement
is coalesced into one animation-frame DOM write instead of a React state update per pixel, and observer-driven viewer
measurements pause during the drag. The divider remains reachable at either edge and has keyboard and button
alternatives.

The full-prompt transition uses the same DOM and a staged, interruptible choreography. The image and media controls
recede first with a short accelerated fade, then the media column and divider settle closed with a damped spring. The
dialog title now lives in a fixed, shared header outside both animated panels, so it remains a stable visual anchor
while the prompt expands beneath it. A compact full-prompt status pill fades in beside the title without changing its
position. Returning reopens the split before the image settles back in. With `prefers-reduced-motion: reduce`, the
switch completes immediately.

## Responsive evidence

| Viewport   | Result                                                                          |
| ---------- | ------------------------------------------------------------------------------- |
| 1440 × 920 | 1380 × 864 dialog; two columns; 841 × 706 media canvas; no dialog overflow      |
| 1040 × 720 | 1008 × 688 dialog; two columns; media toolbar visible; only prompt text scrolls |
| 900 × 720  | Desktop interaction remains enabled at the breakpoint                           |
| 899 × 720  | Vertical media/prompt layout; divider and media toolbar hidden                  |
| 850 × 514  | 818 × 482 dialog; vertical layout; no horizontal or vertical dialog overflow    |

At 1440 × 920, the local 2048 × 1152 source rendered at 841 × 473.06, preserving the exact 16:9 ratio without cropping.
The media canvas occupied the complete 841 × 706 region between title and actions.

## Interaction evidence

- Zoom button changed the viewer from 100% to 125% and showed the temporary hand-icon drag hint.
- Pointer drag at 125% moved the image to the computed horizontal maximum of 105.125 px; vertical movement remained at
  zero because the scaled image was still shorter than the canvas.
- Fit reset returned zoom and translation to their defaults.
- Full view collapsed the media column to 0 px and moved prompt content to the dialog's left inset.
- The title stayed at x=44 px and y=44 px before, during, and after the full-view transition; the dialog retained zero
  horizontal and vertical overflow.
- Dragging left from 65% entered full-prompt mode; its left-edge handle returned directly to a 40% split.
- Dragging right entered full-media mode; its right-edge handle returned directly to a 50% split. The explicit media
  button also entered full-media mode and restored the previous 72% split.
- Keyboard Home and End selected the exact 20% and 72% split boundaries. Closing and reopening reset the split to 65%.
- At 899 px the divider and full-media entry were hidden with zero modal overflow; at 900 px the 32 px divider returned.
- Expansion reached its final state in roughly 0.8–0.9 seconds across overlapping stages; return remained quicker at
  roughly 0.6–0.7 seconds.
- A rapid expand/return/expand sequence finished in the latest requested state without queuing an older animation or
  flashing an obsolete state.
- The toggle exposes `aria-expanded`, has subtle press feedback, and uses a spring-driven icon transition without
  changing its hit target.
- Small layouts hid the toolbar and divider and retained complete image fitting.
- Reduced-motion mode switched to full view immediately.
- A page reload after implementation showed the dialog without the transient development issue badge.

## Automated verification

- Pure geometry tests cover contain sizing, pan bounds, clamping, pointer-centered zoom, fit reset, zoom limits, and
  image-only desktop interaction.
- TypeScript and focused ESLint checks pass.
- The full unit suite passes.
- The static desktop build completes all 200 generated pages.

final result: passed
