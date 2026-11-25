# Nested Reactivity

> [!TLDR]
>
> - Keep state local to the loop item or child component whenever outer code does not read it
> - Hoist nested state into a parent collection only when ancestor UI depends on it
> - Use immutable updates (or a helper like Immer) to propagate hoisted changes cleanly

Applications frequently render collections where individual items have interactive state. Keeping that state as close to its usage as possible minimizes complexity and update work; hoist it into a parent collection only when surrounding UI needs to read or coordinate across items.

## Base Example

Consider a client-side to-do list:

```marko
<let/todos=[
  { id: 0, text: "Learn Marko" },
  { id: 1, text: "Make a Website" },
]>

<ul>
  <for|todo, i| of=todos by="id">
    <li>
      <id/checkboxId>
      <input type="checkbox" id=checkboxId>
      <label for=checkboxId>${todo.text}</label>
      <button title="delete" onClick() { todos = todos.toSpliced(i, 1) }>
        &times;
      </button>
    </li>
  </for>
</ul>

<let/nextId=2/>
<form onSubmit(e, form) {
  e.preventDefault();
  const data = new FormData(form);
  const text = String(data.get("text") || "").trim();
  if (!text) return;
  todos = todos.concat({ id: nextId++, text });
  form.reset();
}>
  <input name="text" placeholder="Another Item">
  <button type="submit">Add</button>
</form>
```

## Local State

State should stay local whenever no ancestor needs to read it. For example, disabling each item's delete button until its checkbox is checked only concerns that single `<li>`:

```marko
<let/todos=[
  { id: 0, text: "Learn Marko" },
  { id: 1, text: "Make a Website" },
]>

<ul>
  <for|todo, i| of=todos by="id">
    <li>
      <id/checkboxId>
      <let/done=false>
      <input type="checkbox" checked:=done id=checkboxId>
      <label for=checkboxId>${todo.text}</label>
      <button
        title="delete"
        disabled=!done
        onClick() { todos = todos.toSpliced(i, 1) }
      >
        &times;
      </button>
    </li>
  </for>
</ul>
```

Because `done` lives inside the `<for>` body and the loop is keyed with `by="id"`, toggling one checkbox updates only that row without touching the `todos` array.

## Hoisted State

Hoist item state into the parent array when sibling or ancestor UI depends on it, such as displaying the next unfinished task outside the list:

```marko
<let/todos=[
  { id: 0, text: "Learn Marko", done: false },
  { id: 1, text: "Make a Website", done: false },
]>
<const/nextTodo=todos.find((todo) => !todo.done)>

<p>Next up: ${nextTodo ? nextTodo.text : "All done!"}</p>

<ul>
  <for|todo, i| of=todos by="id">
    <li>
      <id/checkboxId>
      <let/done=todo.done valueChange(nextDone) {
        todos = todos.toSpliced(i, 1, { ...todo, done: nextDone });
      }>
      <input type="checkbox" checked:=done id=checkboxId>
      <label for=checkboxId>${todo.text}</label>
      <button
        title="delete"
        disabled=!done
        onClick() { todos = todos.toSpliced(i, 1) }
      >
        &times;
      </button>
    </li>
  </for>
</ul>
```

Replacing the updated item immutably with `toSpliced` keeps `todos` [immutable](./immutable-state.md) so `nextTodo` recomputes automatically while `by="id"` preserves every row's DOM.

For deeply nested structures where manual copying becomes verbose, an immutable update helper such as [Immer](https://immerjs.github.io/immer/) integrates directly inside `valueChange`:

```marko
import { produce } from "immer";

<let/done=todo.done valueChange(nextDone) {
  todos = produce(todos, (draft) => {
    draft[i].done = nextDone;
  });
}>
```
