# Concise syntax

Marko's concise syntax is very similar to the HTML syntax, except it's more... concise. Angle brackets are removed, and nesting is indentation-based.

All Marko files are in concise mode by default, and switch to HTML mode once there is a tag that uses the HTML syntax.

```marko no-format
div class="thumbnail"
    img src="https://example.com/thumb.png"

// identical to

<div class="thumbnail"><img src="https://example.com/thumb.png" /></div>
```

## Attributes on multiple lines

Attributes may be comma-separated in all Marko tags.

```marko no-format
div id="hello", class=["class1", "class2", "class3"], style={ border: "1px solid red" }
```

Since commas indicate that another attribute is expected, they may be used to spread attributes across multiple lines.

```marko no-format
div id="hello" class="world",
  style={ border: "1px solid red" }
```

By convention, readability is improved if commas are organized at the _beginning_ of each line with attributes.

```marko no-format
div
  ,id="hello"
  ,class=["class1", "class2", "class3"]
  ,style={ border: "1px solid red" }
  `hello
```

## Text

A run of backticks begins [content](./language.md#tag-content). The text is exactly what follows the opening backticks, so any whitespace there is part of it.

If text immediately follows the backticks, the content is terminated at the end of the line.

```marko no-format
`Hello world
div `Hello world
```

Closing backticks are optional on a single line. They are recognized at the end of the line, optionally followed by a comment, and they keep trailing whitespace that the end of the line would otherwise drop.

```marko no-format
div `Hello world` // greeting
p `Sold by `
a href="/shop" `Acme`
```

HTML tags may be used within the text, which keeps inline markup on one line.

```marko no-format
p `concise mode is <em>sort of</em> concise
```

If backticks are alone on a line, the content is terminated by a line holding the same number of backticks, indented like the text, or at the next dedent.

```marko no-format
`
This is
a bunch of
text at the
root of
the tag
`
details
  `
  since this is normal tag content,
  regular <strong>HTML Mode</strong>
  tags may be used freely.
  `
  summary `
    This content is
    implicitly closed
```

A longer run of backticks allows the text to contain backticks. A closing run must be the same length as the opening run.

```marko no-format
p ``Wrap code in `backticks` like this
```

> [!NOTE]
> Backticks that follow `=` or an operator remain template literals. Text begins at a backtick that follows whitespace where another attribute could start.
>
> ```marko no-format
> a href=`/orders/${id}` `View order
> ```

### Hyphens

Two or more hyphens (`--`) are an older spelling of the same syntax and continue to work. Text may follow on the same line, or the hyphens may be alone on a line and closed by the same number of hyphens, indented like the text, or at the next dedent.

```marko no-format
div -- Hello world
details
  --
  Some <strong>text</strong>
  --
```

### Root level text

The Marko parser starts out in the concise mode. Therefore, given the following template:

```marko no-format
Hello World
Welcome to Marko
```

The output is:

```marko no-format
<Hello World></Hello><Welcome to Marko></Welcome>
```

The proper way to include root level [text](#text) is with backticks.

```marko no-format
`Welcome to Marko
```

<!--

The proper way to include root level text is with [string literals or backticks](#text).

```marko no-format
"Hello World"
`Welcome to Marko
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
>   `This text belongs to the paragraph
> ```

-->