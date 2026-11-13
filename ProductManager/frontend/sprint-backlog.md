# Frontend Sprint Backlog

Planning date: 2026-11-13. All tasks are **TODO**. One additional frontend developer is assumed; the backend developer retains the [backend sprint](../sprint-backlog.md). Each day has 6 focused hours, with 5 h scheduled and 1 h reserve. Estimates include a relevant UI/contract check. A mocked response can unblock layout work, but only a real backend result can close an integration task.

| Window | Capacity | Scheduled | Reserve | Exit |
| --- | ---: | ---: | ---: | --- |
| FE Sprint 1: Mon 16–Wed 18 Nov | 18 h | 15 h | 3 h | Real browse → Guest cart → Member login/merge |
| FE Sprint 2: Thu 19–Fri 20 Nov | 12 h | 10 h | 2 h | Real COD checkout → Seller cash record/cancel, two rehearsals |

## FE Sprint 1 — Reach a purchasable cart

| Day | Task | Hours | Exit evidence and backend handoff |
| --- | --- | ---: | --- |
| Mon 16 | FE-001 | 3 | Record frontend code root, pinned dependencies, generated contract/types, build and production profile guard. Backend PB-001 fixture/API location is known. |
| Mon 16 | FE-002, part 1 | 2 | Server-only client, session and safe error boundary compile; connect `logIn` and Guest-cookie relay to PB-002/004 responses. |
| Tue 17 | FE-002, part 2 | 2 | Role/owner navigation, expiry, Origin and cookie-merge checks pass against the backend. Capture `cartMerge` rejections. |
| Tue 17 | FE-003 | 3 | Product list/detail loads PB-003 fixtures; two Seller variants can be selected; ineligible products stay absent. |
| Wed 18 | FE-004 | 5 | Guest cart set/remove, login merge and Member cart read work in one browser session; stale version and rejected-line messages are checked. |

Sprint 1 closes only when the backend PB-002–004 behavior is executable. If it is late, record the browser slice as blocked and keep the contract fixture checks separate from end-to-end evidence.

## FE Sprint 2 — Complete and rehearse the COD journey

| Day | Task | Hours | Exit evidence and backend handoff |
| --- | --- | ---: | --- |
| Thu 19 | FE-005 | 4 | Select a seeded owned address; create a two-Seller order through PB-006; retry an uncertain result with the same key/body; inspect actual order ID/status through PB-007. |
| Thu 19 | FE-008, preparation | 1 | Align disposable fixtures and reset steps with backend PB-019; prepare browser run sheet without committed credentials. |
| Fri 20 | FE-006 | 2 | Cancel a fresh pending order and re-read; a paid/partly paid order remains uncancellable through PB-008. |
| Fri 20 | FE-007 | 2 | Seller A/B each see and pay only their own portion through PB-009; Member order read shows aggregate Paid after both. |
| Fri 20 | FE-008, finish | 1 | Run the scripted browser journey twice from reset state; record build/check output, backend revision, defects and omitted routes; freeze a known-good revision. Use reserve if rehearsal exposes faults. |

## Checkpoints and replanning

| Checkpoint | Evidence required | Action if missed |
| --- | --- | --- |
| Mon 16 end | Frontend repo/build and API contract generation run; backend login/cart endpoints available | Re-estimate the remaining web work from the actual codebase. Keep the API demo as the guaranteed format. |
| Wed 18 end | Real Guest → Member cart merge and two-Seller product selection | Use reserve on session/cookie faults. Do not start Seller UI until the purchase path is reproducible. |
| Thu 19 end | Real checkout returns one order ID; replay/uncertain-result behavior checked; backend PB-006/007 green | If checkout is unavailable or unsafe, stop the end-to-end web claim and prepare the last verified browse/cart slice beside the backend API runner. |
| Fri 20 end | Two clean browser runs; backend mandatory race/rollback evidence and API rehearsal pass | Freeze. If one fails, show only the verified web slice and list the missing flow. Do not substitute UI mocks for backend proof. |

The weekend is not planned capacity. If a frontend developer is not assigned, FE Sprint 1 and 2 remain unstarted; the approved backend [demo plan](../demo-plan.md) remains the delivery path.

## Post-demo forecast

At the 20 Nov review, re-estimate from completed FE work and actual backend readiness. Tentative FE Sprint 3 (23–27 Nov) sequences FE-009, FE-010 and FE-011 when PB-011/013 are executable. Tentative FE Sprint 4 (30 Nov–04 Dec) sequences FE-012, FE-013, voucher display in FE-005 and FE-014 when PB-012/014/015 are ready. Carry unfinished demo defects ahead of these features; do not count blocked backend work as frontend Done.
