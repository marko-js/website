# 簡潔構文

Markoの簡潔構文は、HTML構文に非常に似ていますが、より...簡潔です。山括弧が削除され、ネストはインデントベースになります。

すべてのMarkoファイルはデフォルトで簡潔モードになっており、HTML構文を使用するタグがある場合にHTMLモードに切り替わります。

```marko no-format
div class="thumbnail"
    img src="https://example.com/thumb.png"

// これと同じ

<div class="thumbnail"><img src="https://example.com/thumb.png" /></div>
```

## 複数行の属性

すべてのMarkoタグで、属性はカンマ区切りにできます。

```marko no-format
div id="hello", class=["class1", "class2", "class3"], style={ border: "1px solid red" }
```

カンマは別の属性が続くことを示すため、複数行にわたって属性を広げるために使用できます。

```marko no-format
div id="hello" class="world",
  style={ border: "1px solid red" }
```

慣例として、カンマを属性のある各行の_先頭_に配置すると、可読性が向上します。

```marko no-format
div
  ,id="hello"
  ,class=["class1", "class2", "class3"]
  ,style={ border: "1px solid red" }
  -- hello
```

## テキスト

2つ以上のハイフン（`--`）の後に空白を続けることで、[コンテンツ](./language.md#tag-content)を開始できます。

ハイフンの直後にテキストが続く場合、コンテンツは行の終わりで終了します。

```marko no-format
-- Hello world
div -- Hello world
```

ハイフンの後に改行が続く場合、コンテンツは同じ数のハイフンまたは次のデデンテーションで終了します。

```marko no-format
--
This is
a bunch of
text at the
root of
the tag
--
details
  --
  since this is normal tag content,
  regular <strong>HTML Mode</strong>
  tags may be used freely.
  --
  summary --
    This content is
    implicitly closed
```

> [!TIP]
> 必要に応じて2つ_以上_のハイフンを使用できますが、開始と終了のハイフンの数は一致する必要があります。
>
> ```marko no-format
> pre
>   ---------------------
>      ---   ---   ---
>    --- -- -- ---  ---
>   ---   ---   ---  ---
>    ---       ---  ---
>     ---     ---  ---
>   ---------------------
> ```

### ルートレベルのテキスト

Markoパーサーは簡潔モードで開始します。したがって、次のテンプレートが与えられた場合:

```marko no-format
Hello World
Welcome to Marko
```

出力は次のようになります:

```html
<Hello World></Hello> <Welcome to Marko></Welcome>
```

ルートレベルのテキストを含める適切な方法は、[コードフェンス](#text)を使用することです。

```marko no-format
-- Welcome to Marko
```

<!--

The proper way to include root level text is with [string literals or code fences](#text).

```marko no-format
"Hello World"
-- Welcome to Marko
```

## Line Termination

A semicolon (`;`) indicates a newline

```marko no-format
div; span; p

// identical to

div
span
p
```

A right angle bracket (`>`) indicates a newline _with_ a tab (i. e. nested content).

```marko no-format
div > span > p

// identical to

div
  span
    p
```

> [!TIP]
> You can use the nesting syntax (`>`) to limit the amount of space before deeply nested content
>
> ```
> div.shell > div.wrapper > p
>   -- This text belongs to the paragraph
> ```

-->