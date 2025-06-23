# Nested Reactivity

> [!TLDR]
> Three approaches are explored for managing nested state

It is often the case in application development that state is stored in a top-level object which is then represented and mutated throughout the component tree. This guide will outline 3 ways of handling this type of pattern, using a To-Do List example as a base.

Each method in this guide is more complex and has more overhead than those before it. Generally, you should use the _least_ complex method that still addresses the needs of your application.

## Core Example: To-Do List

Each example in this guide will build on the following client-side To-Do list application.

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
      <button title="delete" onClick() {
        todos = todos.toSpliced(i, 1);
      }>&times;</button>
    </li>
  </for>
</ul>

<let/nextId=2/>
<form onSubmit(e) {
  e.preventDefault();
  todos = todos.concat({
    id: nextId++,
    text: e.target.text.value,
  })
}>
  <input name="text" placeholder="Another Item">
  <button type="submit">Add</button>
</form>

<!-- ignore -->
<style>
  ul {
    max-width: 20rem;
    padding: 0;
  }
  li {
    display: flex;
    gap: 1rem;
    justify-content: space-between;

    label {
      width: 100%;
    }
  }
  input:checked + label {
    text-decoration: line-through;
  }
</style>
<!-- /ignore -->
```

## Case 1: Local State

The first rule of nested reactivity is that you should try to avoid nested reactivity. Generally, **state should be managed as close to its uses as possible**. Before jumping right into hoisting state into a global object, _please_ consider whether it actually makes sense to do so.

In most cases, it makes more sense to create local state than to add a value to some global store. For example, maybe we want to disable deleting items that haven't yet been completed. For this, we need to hoist state out of the input.

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
        onClick() {
          todos = todos.toSpliced(i, 1);
        }
      >&times;</button>
    </li>
  </for>
</ul>

<!-- ignore -->
<let/nextId=2/>
<form onSubmit(e) {
  e.preventDefault();
  todos = todos.concat({
    id: nextId++,
    text: e.target.text.value,
  })
}>
  <input name="text" placeholder="Another Item">
  <button type="submit">Add</button>
</form>

<style>
  ul {
    max-width: 20rem;
    padding: 0;
  }
  li {
    display: flex;
    gap: 1rem;
    justify-content: space-between;

    label {
      width: 100%;
    }
  }
  input:checked + label {
    text-decoration: line-through;
  }
</style>
<!-- /ignore -->
```

Notice that for this feature, there is _no need_ to modify the `todos` object at the top level. State can stay local, so nested reactivity on that object is unnecessary.

## Case 2: Simple Hoisted State

Sometimes, it _does_ make sense to hoist state up to a global object. Suppose we want to add a feature where clicking a button shows the first item in the list that isn't done yet. For that information to be known, we need to include the state in the `todos` object:

```marko
<let/todos=[
  { id: 0, text: "Learn Marko", done: false },
  { id: 1, text: "Make a Website", done: false },
]>

<ul>
  <for|todo, i| of=todos by="id">
    <li>
      <id/checkboxId>
      <let/done=todo.done valueChange(done) {
        todos = todos.toSpliced(i, 1, { ...todo, done })
      }>
      <input type="checkbox" checked:=done id=checkboxId>
      <label for=checkboxId>${todo.text}</label>
      <button
        title="delete"
        disabled=!done
        onClick() {
          todos = todos.toSpliced(i, 1);
        }
      >&times;</button>
    </li>
  </for>
</ul>

<!-- ignore -->
<let/nextId=2/>
<form onSubmit(e) {
  e.preventDefault();
  todos = todos.concat({
    id: nextId++,
    text: e.target.text.value,
  })
}>
  <input name="text" placeholder="Another Item">
  <button type="submit">Add</button>
</form>

<style>
  ul {
    max-width: 20rem;
    padding: 0;
  }
  li {
    display: flex;
    gap: 1rem;
    justify-content: space-between;

    label {
      width: 100%;
    }
  }
  input:checked + label {
    text-decoration: line-through;
  }
</style>
<!-- /ignore -->
```

Modifying state trees directly like this is often tedious and hard to follow, so we could also use a library like [immer](https://immerjs.github.io/immer/) to handle state updates:

```marko
import { produce } from "immer"
<!-- ignore -->
<let/todos=[
  { id: 0, text: "Learn Marko", done: false },
  { id: 1, text: "Make a Website", done: false },
]>

<ul>
  <for|todo, i| of=todos by="id">
    <li>
      <id/checkboxId>
<!-- /ignore -->
<let/done=todo.done valueChange(done) {
  todos = produce(todos, draft => {
    draft[i].done = done
  });
}>
<!-- ignore -->
      <input type="checkbox" checked:=done id=checkboxId>
      <label for=checkboxId>${todo.text}</label>
      <button
        title="delete"
        disabled=!done
        onClick() {
          todos = todos.toSpliced(i, 1);
        }
      >&times;</button>
    </li>
  </for>
</ul>

<let/nextId=2/>
<form onSubmit(e) {
  e.preventDefault();
  todos = todos.concat({
    id: nextId++,
    text: e.target.text.value,
  })
}>
  <input name="text" placeholder="Another Item">
  <button type="submit">Add</button>
</form>

<style>
  ul {
    max-width: 20rem;
    padding: 0;
  }
  li {
    display: flex;
    gap: 1rem;
    justify-content: space-between;

    label {
      width: 100%;
    }
  }
  input:checked + label {
    text-decoration: line-through;
  }
</style>
<!-- /ignore -->
```

## Case 3: Complex Hoisted State

<!-- TODO: discuss `<mut>` tag -->
