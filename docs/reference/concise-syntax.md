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
  -- hello
```

## Text

Two or more hyphens (`--`) followed by whitespace may be used to begin [content](./language.md#tag-content).

If text immediately follows the hyphens, the content is terminated at the end of the line.

```marko no-format
-- Hello world
div -- Hello world
```

If hyphens are followed by a newline, the content is terminated by the same number of hyphens or at the next dedentation.

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
> There may be _more_ than two hyphens if necessary, but the number hyphens in the open and close must match.
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

The proper way to include root level text is with [code fences](#text).

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