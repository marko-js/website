# Forms

Marko renders HTML, and HTML forms work without any JavaScript. Starting from a native `<form>` keeps submissions functional before scripts load, and Marko's reactivity can then layer on richer behavior where it helps.

## Submitting to the Server

In a [Marko Run](../marko-run/getting-started.md) app, a form posts to a route, and a [`+handler`](../marko-run/file-based-routing.md#handler) beside the page receives the submission. The handler reads the submitted fields with the standard [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) API and redirects when finished.

```marko
/* src/routes/feedback/+page.marko */
<h1>Send Feedback</h1>
<form method="POST">
  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send</button>
</form>
```

```ts
/* src/routes/feedback/+handler.ts */
export async function POST(context) {
  const data = await context.request.formData();
  await saveFeedback(data.get("message"));
  return context.redirect("/feedback/thanks", 303);
}
```

`GET` requests continue to the page as usual, while the `POST` export handles submissions from the form above.

> [!NOTE]
> Redirecting after a successful `POST` (the [Post/Redirect/Get pattern](https://en.wikipedia.org/wiki/Post/Redirect/Get)) prevents a page refresh from resubmitting the form. See [Preventing Duplicate Form Submissions](./duplicate-form-submissions.md) for handling repeated clicks before the response arrives.

## Validating

Native [validation attributes](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation) such as `required`, `min`, and `pattern` block invalid submissions in the browser without any additional code.

```marko
<form method="POST">
  <label for="age">Age</label>
  <input id="age" name="age" type="number" min="18" required>

  <button type="submit">Continue</button>
</form>
```

> [!WARNING]
> Browser validation is a convenience, not a boundary. Requests can be constructed without the form, so handlers must validate submitted values again on the server.

## Reacting to Input

Binding form controls to [tag variables](../reference/language.md#tag-variables) enables live behavior such as previews, character counts, or dependent fields. The [change handler shorthand](../reference/language.md#shorthand-change-handlers-two-way-binding) (`:=`) keeps a variable in sync with a control.

```marko
<let/message="">

<form method="POST">
  <label for="message">Message</label>
  <textarea id="message" name="message" maxlength="280" value:=message/>
  <p>${280 - message.length} characters left</p>

  <button type="submit" disabled=!message.trim()>Send</button>
</form>
```

Because the form still posts natively, this enhancement degrades gracefully: without JavaScript the character counter stays static, but the form submits all the same.
