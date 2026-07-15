# Preventing Duplicate Form Submissions

When a form takes time to process, users may click the submit button again before the first request completes, causing the same data to be sent twice. Tracking submission state with a [`<let>` tag](../reference/core-tag.md#let) prevents these duplicate submissions. For the full submission flow, including server handling, see the [Forms guide](./forms.md).

## Disabling the Button

The [`disabled`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/disabled) attribute can be driven by a tag variable that is set in the form's [event handler](../reference/native-tag.md#event-handlers) when it is first submitted.

```marko
<let/submitting=false>

<form method="POST" action="/rsvp" onSubmit(e) {
  if (submitting) {
    e.preventDefault();
    return;
  }

  submitting = true;
}>
  <label for="guests">Number of guests</label>
  <input id="guests" name="guests" type="number" min="1">

  <button type="submit" disabled=submitting>
    ${submitting ? "Sending..." : "RSVP"}
  </button>
</form>
```

While `submitting` is `true`, the button is disabled and further clicks are ignored. Since the form here submits normally and navigates away, the flag never needs to be reset.

## Resetting After Completion

Forms that stay on the page, such as those sending data with [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), should reset the flag once the request settles so the form can be used again.

```marko
<let/submitting=false>

<form onSubmit(e) {
  e.preventDefault();
  if (submitting) return;

  submitting = true;

  fetch("/rsvp", {
    method: "POST",
    body: new FormData(e.target),
  }).finally(() => {
    submitting = false;
  });
}>
  <label for="guests">Number of guests</label>
  <input id="guests" name="guests" type="number" min="1">

  <button type="submit" disabled=submitting>
    ${submitting ? "Sending..." : "RSVP"}
  </button>
</form>
```

> [!WARNING]
> Disabling the button is a user experience improvement, not a guarantee. Requests can still be repeated by network retries or multiple open tabs, so the server should handle duplicate submissions gracefully as well.
