# Preventing Duplicate Form Submissions

A native form sends an HTTP request and follows the server's response. The browser may send the same request more than once because of repeated submissions, retries, or multiple open tabs, so correctness cannot depend on disabling a button. The server should make repeated submissions safe.

## Submission Keys

Include a unique submission key in the rendered form. Because the page renders on the server, the form works without browser JavaScript.

```marko
/* src/routes/rsvp/+page.marko */
<const/submissionId=crypto.randomUUID()>

<form method="POST" action="/rsvp">
  <input type="hidden" name="submissionId" value=submissionId>

  <label for="guests">Number of guests</label>
  <input id="guests" name="guests" type="number" min="1" required>

  <button type="submit">RSVP</button>
</form>
```

The handler validates the submitted fields and passes the key to the persistence layer. Repeating the request returns the record created by the first request instead of creating another one.

```ts
/* src/routes/rsvp/+handler.ts */
export async function POST(context) {
  const data = await context.request.formData();
  const submissionId = data.get("submissionId");
  const guestsValue = data.get("guests");
  const guests = typeof guestsValue === "string" ? Number(guestsValue) : NaN;

  if (
    typeof submissionId !== "string" ||
    !submissionId ||
    !Number.isInteger(guests) ||
    guests < 1
  ) {
    return new Response("Invalid submission.", { status: 400 });
  }

  const rsvp = await saveRsvpOnce({ submissionId, guests });
  return context.redirect(`/rsvp/${rsvp.id}`, 303);
}
```

> [!WARNING]
> `saveRsvpOnce` must enforce uniqueness for the submission key in the same database transaction that creates the record. Checking for an existing key and inserting in separate operations leaves a race condition.

## Redirecting

After processing the `POST`, the handler returns a `303` redirect to a `GET` page. This [Post/Redirect/Get pattern](https://en.wikipedia.org/wiki/Post/Redirect/Get) means refreshing the resulting page repeats only the `GET`, not the form submission. The submission key still protects against duplicate requests that reach the server before the redirect.

For the complete native form flow, see the [Forms guide](./forms.md).
