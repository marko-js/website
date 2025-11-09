# ネストされたリアクティビティ

> [!TLDR]
> ネストされた状態を管理するための3つのアプローチを探る

アプリケーション開発では、状態がトップレベルのオブジェクトに格納され、コンポーネントツリー全体で表現および変更されることがよくあります。このガイドでは、To-Do リストの例をベースとして、このタイプのパターンを処理する3つの方法を概説します。

このガイドの各メソッドは、前のメソッドよりも複雑で、オーバーヘッドが大きくなります。一般的に、アプリケーションのニーズに対応できる_最も_複雑でないメソッドを使用する必要があります。

## コア例: To-Do リスト

このガイドの各例は、次のクライアント側 To-Do リストアプリケーションをベースにします。

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
```

## ケース 1: ローカル状態

ネストされたリアクティビティの最初のルールは、ネストされたリアクティビティを避けるべきだということです。一般的に、**状態は可能な限りその使用場所に近い場所で管理すべきです**。グローバルオブジェクトに状態を引き上げる前に、実際にそうする意味があるかどうかを_必ず_検討してください。

ほとんどの場合、グローバルストアに値を追加するよりも、ローカル状態を作成する方が理にかなっています。たとえば、まだ完了していない項目の削除を無効にしたい場合があります。このためには、入力から状態を引き上げる必要があります。

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
```

この機能では、トップレベルの `todos` オブジェクトを変更する_必要がない_ことに注意してください。状態はローカルのままでよいため、そのオブジェクトのネストされたリアクティビティは不要です。

## ケース 2: シンプルな引き上げられた状態

時には、状態をグローバルオブジェクトに引き上げることが理にかなっている場合_も_あります。ボタンをクリックすると、リスト内でまだ完了していない最初の項目を表示する機能を追加したいとします。その情報を知るには、`todos` オブジェクトに状態を含める必要があります：

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
```

このように状態ツリーを直接変更することは、しばしば面倒で理解しにくいため、[immer](https://immerjs.github.io/immer/) のようなライブラリを使用して状態の更新を処理することもできます：

```marko
import { produce } from "immer"

<let/done=todo.done valueChange(done) {
  todos = produce(todos, draft => {
    draft[i].done = done
  });
}>
```

## ケース 3: 複雑な引き上げられた状態

<!-- TODO: discuss `<mut>` tag -->
