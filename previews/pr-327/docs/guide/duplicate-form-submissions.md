# Duplicate Form Submissions

Guard forms against repeated clicks and network retries by tracking in-flight submission state on the client and redirecting after successful server writes.

## Client Guard

Track submission state with [`<let>`](../reference/core-tag.md#let) and disable the submit button while an async request is in flight:

```marko
<let/submitting=false>
<let/status="">

<form async onSubmit(e, form) {
  e.preventDefault();
  if (submitting) return;
  submitting = true;
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      body: new FormData(form),
    });
    status = res.ok ? "Order placed." : "Submission failed.";
  } finally {
    submitting = false;
  }
}>
  <input name="sku" required>
  <button type="submit" disabled=submitting>
    ${submitting ? "Submitting..." : "Place Order"}
  </button>
</form>

<if=status>
  <p>${status}</p>
</if>
```

Checking `if (submitting) return;` inside `onSubmit` prevents duplicate submissions triggered via the keyboard even before the disabled state paints, and resetting `submitting` in `finally` restores the form if the request fails.

## Server Redirect

For standard HTML `POST` forms handled by [Marko Run](../marko-run/data-loading.md#forms), respond to successful mutations with a redirect (`303 See Other`) using `ctx.redirect("/orders/complete", 303)`. This implements [Post/Redirect/Get](https://en.wikipedia.org/wiki/Post/Redirect/Get) so browser refreshes and back-button navigations replay a safe `GET` instead of resubmitting the form.
