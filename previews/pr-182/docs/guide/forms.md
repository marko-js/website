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

  <button type="submit">Send</button>
</form>
```

Because the form still posts natively, this enhancement degrades gracefully: without JavaScript the character counter stays static, but the form submits all the same.

> [!WARNING]
> Deriving `disabled` on the submit button from bound state (for example, disabling it until a field is filled in) renders the button disabled in the server HTML, locking out visitors whose JavaScript has not loaded. Prefer [validation attributes](#validating), which the browser enforces on its own.

## Binding Controls

Every stateful form control has a [`Change` handler](../reference/native-tag.md#change-handlers) in Marko, so the `:=` shorthand from the previous section is not limited to text. Radio groups and checkboxes bind through the [`checkedValue` attribute](../reference/native-tag.md#input-typeradio-and-input-typecheckbox), which holds a string for radios and an array for checkbox groups, and `<select>` binds through its [enhanced `value` attribute](../reference/native-tag.md#select).

```marko
<let/format="html">
<let/topics=[]>
<let/frequency="weekly">

<form method="POST" action="/newsletter">
  <fieldset>
    <legend>Format</legend>
    <label><input type="radio" name="format" value="html" checkedValue:=format> HTML</label>
    <label><input type="radio" name="format" value="text" checkedValue:=format> Plain text</label>
  </fieldset>

  <fieldset>
    <legend>Topics</legend>
    <label><input type="checkbox" name="topics" value="releases" checkedValue:=topics> Releases</label>
    <label><input type="checkbox" name="topics" value="community" checkedValue:=topics> Community</label>
  </fieldset>

  <label for="frequency">Frequency</label>
  <select id="frequency" name="frequency" value:=frequency>
    <option value="daily">Daily</option>
    <option value="weekly">Weekly</option>
    <option value="monthly">Monthly</option>
  </select>

  <p>${topics.length} topic${topics.length === 1 ? "" : "s"}, delivered ${frequency}.</p>

  <button type="submit">Subscribe</button>
</form>
```

Each control still submits its `name` and value natively; the bound variables exist so the rest of the template can react, as the summary line does here.

> [!CAUTION]
> Form controls always report strings. Binding a numeric input directly (`value:=quantity`) turns the variable into a string on the first edit. Add a [refining function](../reference/language.md#refining-function) to convert each change before it is assigned:
>
> ```marko
> <let/quantity=1>
>
> <input type="number" name="quantity" min="1" value:parseFloat:=quantity>
> ```

## Reusable Fields

Repeated label-and-input markup can move into a [custom tag](../reference/custom-tag.md#relative-custom-tags), discovered from a `tags/` directory. The [`<id>` tag](../reference/core-tag.md#id) generates a unique id per instance to associate the label with its control, and binding the native input to `input.value` forwards both the value and its change handler to the parent, so the tag is bound with `:=` exactly like a native control.

```marko
/* tags/labeled-input.marko */
<id/fieldId>

<div class="field">
  <label for=fieldId>${input.label}</label>
  <input id=fieldId name=input.name value:=input.value>
</div>
```

```marko
/* profile-form.marko */
<let/displayName="">

<form method="POST">
  <labeled-input label="Display name" name="displayName" value:=displayName/>
  <p hidden=!displayName>Previewing as ${displayName}</p>

  <button type="submit">Save</button>
</form>
```

Components that hold their own state can offer the same interface by making that state controllable; [Controllable Components](../explanation/controllable-components.md) covers the pattern in depth.
