# React Quick Start — Practice Tasks

Companion challenges for [react.dev/learn](https://react.dev/learn), framed around an infra/platform engineering domain (services dashboard, deployment statuses, observability widgets).

Each section builds on the previous one. By section 10 you'll have a small but coherent "fake control plane UI."

**Setup tip:** Use [Vite](https://vite.dev/guide/) locally instead of CodeSandbox — feels much more like a real dev loop.
`npm create vite@latest react-practice -- --template react`

---

## Section 1 — Creating and nesting components

Build a `ServiceCard` component that renders a div with a service name (hardcoded for now, e.g. "auth-api"). Then build a parent `ServicesDashboard` component that renders three `ServiceCard` components stacked together with an `<h1>Services</h1>` heading.

**Goal:** feel the function-returns-markup pattern and the capital-letter rule. No styling, no props yet.

---

## Section 2 — Writing markup with JSX

Take this real-looking HTML snippet and convert it to valid JSX inside a `PodStatus` component:

```html
<div class="pod">
    <h2>nginx-7d4f8c-x9k2m</h2>
    <p>Status: Running<br>
    Restarts: 0
    <img src="/icons/healthy.svg">
</div>
```

There are at least three things wrong with it as JSX. Find and fix them all. Don't use the online converter — fix them by hand so the errors stick.

---

## Section 3 — Adding styles

Style your `ServiceCard` from section 1. Give each card a border, padding, and rounded corners using a CSS class (via `className`). Then add a second class that changes the border color based on a hardcoded status string — but do it the "wrong" way first: hardcode the className. We'll make it dynamic in section 5.

**Constraint:** put the CSS in a separate file (`ServiceCard.css`) and import it. This mirrors how you'd actually structure components later.

---

## Section 4 — Displaying data

Define a service object at the top of your file:

```js
const service = {
  name: 'payment-api',
  namespace: 'prod',
  replicas: 3,
  cpuPercent: 67,
  endpoint: 'https://payment-api.prod.svc.cluster.local'
};
```

Render a card that displays all five fields. Make the CPU percentage display in red text if it's > 80, using an inline `style={{}}` expression. Use string concatenation to show namespace and name together like `prod/payment-api`.

---

## Section 5 — Conditional rendering

Add a `status` field to your service object that can be `'healthy'`, `'degraded'`, or `'down'`. Render:

- A green checkmark (just the ✓ character is fine) if healthy
- A warning icon (⚠) and a "Degraded — check logs" message if degraded
- A red X (✗) and a "Service unavailable" message if down

Use the ternary operator for one of these, an `if/else` block (assigning to a variable) for another, and `&&` for the third. Doing all three intentionally helps you feel the tradeoffs.

---

## Section 6 — Rendering lists

Define an array of 5 services (varied statuses, namespaces, CPU values). Render them as a list of `ServiceCard` components using `.map()`. Make sure each one gets a proper `key` — use the service name as the key, but think about why that's fragile (what if two namespaces have the same service name?). Then refactor to use a composite key.

**Bonus:** sort the array so unhealthy services appear first.

---

## Section 7 — Responding to events

Add a "Restart" button to each `ServiceCard`. When clicked, it should `alert()` something like "Restarting payment-api in prod...". The handler needs access to the service name, so you'll need to either define the handler inline or use a closure. Try both approaches.

**Gotcha to watch for:** don't write `onClick={handleRestart()}` — the tutorial mentions this. Make the mistake on purpose first to see what happens.

---

## Section 8 — Updating the screen (useState)

Add an "Acknowledged" toggle to each service card — a button that, when clicked, marks the alert as acknowledged. When acknowledged, the card should dim (lower opacity) and the button text should change from "Acknowledge" to "Acknowledged ✓".

Each card has its own independent `acknowledged` state for now. You should be able to acknowledge them one at a time and see they don't affect each other.

---

## Section 9 — Using Hooks

Add a counter to each card that tracks how many times a service has been "restarted" this session (just the button click count — no real API call). Now intentionally break the rules of hooks: try calling `useState` inside an `if` block and see what error you get. Then fix it.

---

## Section 10 — Sharing data between components (lifting state up)

This is the big one. Refactor your dashboard so that:

- The parent `ServicesDashboard` holds the list of services and which ones are acknowledged (in a single state object or array)
- `ServiceCard` becomes a pure presentational component that receives `service`, `isAcknowledged`, and `onAcknowledge` as props
- Add a "Acknowledge All" button at the dashboard level that marks every card acknowledged at once
- Add a counter at the top: "3 of 5 services acknowledged"

This is where the lifting-state-up concept clicks. The fact that "Acknowledge All" is now trivial to implement is the whole point.

---

## Stretch challenge (after you're done)

Wire it up to something real. Spin up a tiny Go HTTP server in your `devops-toolkit` repo that serves a `/services` endpoint returning fake service data as JSON, and have your React app fetch from it on mount. You'll need `useEffect` for that, which is the next concept after this tutorial — so it doubles as a natural bridge into [Adding Interactivity](https://react.dev/learn/adding-interactivity).
