# ネイティブタグ

ネイティブタグは、[組み込みHTML要素](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements)です。Markoでは、いくつかの人間工学的な機能強化を備えた標準HTMLのように動作します。

## 要素参照

すべてのネイティブタグは、DOMノードへの参照のゲッターを提供する[タグ変数](./language.md#tag-variables)を公開します。

```marko
<div/ref/>

<script>
  ref().innerHTML = "Hello World"
</script>
```

> [!CAUTION]
> ノード参照はブラウザでのみ利用できます。サーバーからDOMノードにアクセスしようとするとエラーになります。

## 拡張属性

### `class=`

文字列に加えて、Markoは`class=`属性に配列とオブジェクトを渡すことをサポートしています。

```marko
<!-- 文字列 -->
<div class="a c"/>

<!-- オブジェクト -->
<div class={ a: true, b: false, c: true }/>

<!-- 配列 -->
<div class=["a", null, { c: true }]/>
```

上記のすべての例は、同じHTMLになります:

```html
<div class="a c"></div>
```

### `style=`

文字列に加えて、Markoは`style=`属性に配列とオブジェクトを渡すことをサポートしています。

```marko
<!-- 文字列 -->
<div style="display:block;margin-right:16px"/>

<!-- オブジェクト -->
<div style={ display: "block", color: false, "margin-right": 16 }/>

<!-- 配列 -->
<div style=["display:block", null, { "margin-right": 16 }]/>
```

上記のすべての例は、同じHTMLになります:

```html
<div style="display:block;margin-right:16px;"></div>
```

### イベントハンドラ

`on`で始まり、その後に`-`または大文字が続くネイティブタグの属性は、[イベントハンドラ](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)として添付されます。

属性が`on-`で始まる場合、イベント名の大文字小文字は保持されます。それ以外の場合、イベント名はすべて小文字になります。

- `onDblClick` → `dblclick`
- `on-DblClick` → `DblClick`

```marko
<button onClick() { alert("Hi!") }>
  Say Hi
</button>

// これと同等

<button on-click() { alert("Hi!") }>
  Say Hi
</button>
```

> [!NOTE]
> イベントハンドラは、可読性のために通常、[メソッド省略記法](./language.md#shorthand-methods)を使用して記述されます。

属性の値は、関数または[falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)値のいずれかである必要があり、条件付きイベントハンドラを可能にします:

```marko
<let/clicked=false>
<button onClick=!clicked && (() => {
  alert("First click!");
  clicked = true;
})>
  Click me!
</button>
```

> [!TIP]
> ネイティブイベントはすべて小文字であるため、`onCamelCase`イベント命名は、複数語のイベントの可読性を向上させるのに役立ちます:
>
> ```marko
> <canvas onContentVisibilityAutoStateChange() {  }/>
> ```
>
> 一部の[カスタム要素](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)は、小文字でないイベント名を発行する場合があります。その場合（ダジャレです😏）、大文字小文字を保持する`on-`を使用する必要があります。

> [!CAUTION]
> Markoは[ネイティブHTMLインラインイベントハンドラ属性](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#event_handler_attributes)を_サポート_していますが、Markoのリアクティビティシステムから切り離されており、[CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) / [XSS](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting)の問題につながる可能性があるため、避けることをお勧めします。
>
> ```marko
> <button onclick="this.innerHTML++">0</button>
> ```

### 拡張された`value`属性を持つタグ

HTML `<input>`タグには、`<input>`の状態を反映する`value=`属性があります。Markoは、内部状態を保持する他のいくつかのタグにこの属性を追加します。

#### `<input type="radio">`と`<input type="checkbox">`

ラジオとチェックボックスの入力は、`checkedValue=`属性をサポートします。この属性が入力の`value=`属性と一致すると、`checked`になります。

`checkedValue=`は文字列に設定でき、この場合、1つの値のみが一致します（`type="radio"`で使用）。または文字列の配列に設定でき、この場合、複数の値が一致する可能性があります（`type="checkbox"`で使用）。

#### `<select>`

`<select>`タグは、その状態がボディ内の`<option>`タグと内部的に同期されるという点で独特です。Markoは、`value=`属性を介してこの状態を公開します。

`value=`は文字列に設定でき、この場合、`<select>`の`.value`プロパティ（選択された`<option>`の値）をミラーリングします。文字列の配列にも設定でき、この場合、複数の`<option>`を選択できます（`<select multiple>`で使用）。

#### `<textarea>`

HTMLでは、`<textarea>`はその値をボディ内に保持します。Markoでは、この状態は`value=`属性にも保持でき、これはtextareaの変更ハンドラに役立ちます。

### 変更ハンドラ

Markoの一部のネイティブタグには、それらを**制御可能**にする追加の属性があります。これらの属性は`Change`で終わり、[バインド省略記法](./language.md#shorthand-change-handlers-two-way-binding)と連携するように設計されています。

関連する属性とは別の内部状態を維持するDOM要素の場合、Markoはデフォルトで「非制御」属性を使用します。つまり、属性値のみを設定し、内部値は設定しません。

```marko
<input value="hello">
```

上記は最も単純な例の1つですが、興味深いことに、フレームワーク間で微妙に異なる動作をします。

Reactなどの一部のフレームワークでは、これは「読み取り専用」の`<input>`になります。Markoは異なるアプローチを取り、ブラウザによってネイティブに入力の状態を管理できるようにします。

状態を追加すると、動作にいくつかのニュアンスが導入されます。

```marko
<let/message="hello">

<input value=message>

<div>${message}</div>

<button onClick() { message = "goodbye" }>Click Me</>
```

この例では、`<input>`に入力してから`<button>`をクリックしても、期待どおりに動作しない可能性があります。`<div>`のテキストはボタンがクリックされたときにのみ更新され、`<input>`は新しい「goodbye」値を反映しません。

これは、独立して更新される2つの別々の状態があるために発生します:

1. `<let/message>`のMarko管理状態
2. `<input>`値の内部状態

これら2つの状態とその更新を同期するために、Markoは`<input>`に特別な`valueChange`属性を含めています。

```marko
<let/message = "hello">

<input value=message valueChange() {}>

<div>${message}</div>

<button onClick() { message = "goodbye" }>Click Me</>
```

`valueChange`属性は動作を変換します:

- `<input>`への入力は、`<input>`と`<div>`の両方を更新します
- `<button>`のクリックは、`<input>`と`<div>`の両方を更新します

これで状態は1つだけになりました! この同期は、`valueChange`が次のことを行うため発生します:

1. 内部`<input>`の変更をキャプチャ
2. `message`変数を更新し、次に`value=`属性を更新

`valueChange`関数は、`<input>`が通常更新されるたびに呼び出され、親コンポーネントがその状態を入力の内部状態と同期できるようにします。

```marko
<let/message = "hello">

<input value=message valueChange(newMessage) { message = newMessage }>

<div>${message}</div>

<button onClick() { message = "goodbye" }>Click Me</>
```

この例では、単一の状態があり、_かつ_両方のソースからの更新が処理されます。`<input>`への入力と`<button>`のクリックは、`<div>`と`<input>`自体の両方に変更を引き起こします。すべてが同期しています!

Markoには、このような単純な反射的変更ハンドラのための[省略記法](./language.md#shorthand-change-handlers-two-way-binding)があり、例を次のように簡略化できます:

```marko
<let/message="Hello">

<input value:=message>

<div>${message}</div>

<button onClick() { message = "Goodbye" }>Click Me</>
```

この省略記法では、`value`属性を「非制御」から「制御」に変更するために必要なのは、`value=`から`value:=`に切り替えることだけです。

最も単純なケース以外では、手動の`valueChange`ハンドラが必要です。

```marko
<let/message = "hello">

<input value=message valueChange(newMessage) { message = newMessage.toLowerCase() }>

<div>${message}</div>

<button onClick() { message = "goodbye" }>Click Me</>
```

この`<input>`へのすべての変更は、傍受され_操作されます_。この例では、すべての大文字が自動的に小文字に変換されます。このパターンは、[入力マスキング](https://css-tricks.com/input-masking/)などに役立ち、組み込まれています!

```marko
// 非制御 - ブラウザが状態を所有
<input value="hello">

// 制御 - `inputValue`タグ変数が状態を所有
<let/inputValue="hello">
<input value:=inputValue>

// 制御 - `<input>`への変更が変換される
<let/creditCardNumber="5555 5555 555">
<input
  value=creditCardNumber
  valueChange(v) {
    creditCardNumber = [...v.replace(/\D/g, "").matchAll(/\d{1,4}/g)].join(" ");
  }
>
```

#### `<input>` (`valueChange=`, `checkedChange=`, `checkedValueChange=`)

`<input>`タグには、それぞれ入力タイプに関連する3つの変更ハンドラがあります。

`value=`属性は`valueChange=`で制御できます

```marko
<let/text="">
<input type="text" value:=text>
<input type="text" value=text valueChange(value) { text = value.toLowerCase() }>
```

> [!CAUTION]
> `<input>`の値は_常に_文字列であるため、数値はキャストする必要があります。
>
> ```marko
> <let/number=0>
>
> // ❌ (不正解) これは更新時にnumberを文字列に設定します
> <input type="number" value:=number>
>
> // ✅ 変更ハンドラ中に文字列値を数値にキャストします
> <input type="number" value=number valueChange(value) { number = +value }>
> ```

`checked=`属性は`checkedChange=`で制御できます

```marko
<let/checked=false>
<input type="checkbox" checked:=checked>
<input type="checkbox" checked=checked checkedChange(value) { checked = value }>
```

[追加された`checkedValue=`属性](#input-typeradio-and-input-typecheckbox)にも変更ハンドラがあります。

```marko
<let/checked="foo">
<input type="radio" value="foo" checkedValue:=checked>
```

#### `<select>` (`valueChange=`)

従来、`<select>`の値は、その`<option>`タグの`selected=`属性を介して制御されます。Markoは、[新しい`value=`属性](#select)を使用して`<select>`を制御する追加の方法を追加しており、これも`Change`ハンドラで制御できます。

```marko
<let/selected="en">
<select value:=selected>
  <option value="en">English</option>
  <option value="pt-br">Portuguese (Brazil)</option>
  <option value="it">Italian</option>
</select>
```

#### `<textarea>` (`valueChange=`)

`<textarea>`タグには、[Markoが追加した`value=`属性](#textarea)の変更ハンドラがあります。

```marko
<let/text="">
<textarea value:=text/>
```

#### `<details>` (`openChange=`)

`<details>`タグには、その`open=`属性の変更ハンドラがあります。

```marko
<let/open=false>
<details open:=open/>

<button onClick() { open = false }>
  Collapse
</button>
```

#### `<dialog>` (`openChange=`)

`<dialog>`タグには、その`open=`属性の変更ハンドラがあります。

```marko
<let/open=false>
<dialog open:=open>Hello!</dialog>

<button onClick() { open = !open }>
  Toggle
</button>
```

> [!Warning]
> `<dialog>`タグの`open`属性は、非モーダルダイアログを制御するために使用できます。ただし、モーダルダイアログが必要な場合は、[`.showModal()`メソッド](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal)を直接使用する必要があります。このメソッドを呼び出しても、HTML `<dialog>`は`close`時にのみイベントを発火するため、`openChange`は発火_しません_。

## 拡張タグ

一部のネイティブタグはMarkoで特別な意味を持ち、HTMLの対応するものとまったく同じように動作しません。

### `<script>`

Markoの[`<script>`タグ](./core-tag.md#script)は、ブラウザエフェクトに使用されます。

ネイティブHTML `<script>`は、`<html-script>`で含めることができます。

```marko
<html-script type="application/json">
  { "foo": [ "bar", "baz" ] }
</html-script>
```

### `<style>`

Markoの[`<style>`タグ](./core-tag.md#style)は、`.css`ファイルを生成します。

ほとんど推奨されませんが、ネイティブHTML `<style>`は`<html-style>`で含めることができます。

### `<!-- comment -->`

デフォルトでは、Markoは出力から[コメント](./language.md#comments)を除外します。

ネイティブHTML `<!-- comment -->`は、[`<html-comment>`](./core-tag.md#html-comment)で含めることができます
