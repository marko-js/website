# Preventing Multiple Form Submissions

A double click or a slow network can submit the same form twice. Prefer progressive HTML forms, then add a small amount of client state when the UI should disable itself while a request is in flight.

## Prefer Native Form Submission

When the server can handle the POST and respond with a redirect or a re-rendered page, a plain form needs no client JavaScript:

```marko
<form method="post" action="/signup">
  <input name="email" type="email" required>
  <button type="submit">Sign up</button>
</form>
```

Under [Marko Run](../marko-run/data-loading.md#forms), a `POST` handler can validate, then `redirect` on success or `next({ issues })` to re-render errors. That flow avoids client-side double-submit state for many apps.

## Disable While Submitting

When the form is handled in the browser (client-side fetch, or preventing default for a custom flow), track submission with a [`<let>`](../reference/core-tag.md#let) and disable the control surface until the work finishes.

```marko
<let/pending=false>
<let/error="">

<form onSubmit(async (e) => {
  e.preventDefault();
  if (pending) return;
  pending = true;
  error = "";
  try {
    const body = new FormData(e.target);
    const res = await fetch("/api/signup", { method: "POST", body });
    if (!res.ok) throw new Error("Signup failed");
    // navigate or reset as needed
  } catch (err) {
    error = err.message;
  } finally {
    pending = false;
  }
})>
  <input name="email" type="email" required disabled=pending>
  <button type="submit" disabled=pending>
    ${pending ? "Signing up…" : "Sign up"}
  </button>
  <if=error>
    <p>${error}</p>
  </if>
</form>
```

`if (pending) return` guards overlapping handlers if the button is activated again before the disable paints. `disabled=pending` on inputs and the submit button blocks further interaction while the request runs.

> [!TIP]
> For multi-button forms, disable the entire `<fieldset>` with `disabled=pending` so every control is covered in one place.

## Server-Rendered Pending UI

When the form posts to the same page and the handler re-renders via `next()`, show validation or progress from `$global.data` instead of client pending state. See [Marko Run data loading](../marko-run/data-loading.md#forms) for POST vs redirect tradeoffs.

## Further Reading

- [Controllable Components](../explanation/controllable-components.md) for field-level state
- [Native Tags: Change Handlers](../reference/native-tag.md#change-handlers)
- [Marko Run: Forms](../marko-run/data-loading.md#forms)
