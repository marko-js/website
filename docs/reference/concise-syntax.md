# Concise Syntax

Marko's concise syntax omits angle brackets and closing tags, using indentation to express nesting.

Every `.marko` file starts in concise mode. An HTML-mode tag switches to HTML mode for its own body, returning to concise mode once closed so both syntaxes can coexist in one file.

```marko no-format
div class="thumbnail"
  img src="https://example.com/thumb.png"

// identical to
<div class="thumbnail"><img src="https://example.com/thumb.png"/></div>
```

## Attributes on multiple lines

Attributes can be comma-separated on a single line or split across lines with trailing commas:

```marko no-format
div id="hello", class=["class1", "class2", "class3"], style={ border: "1px solid red" }

div id="hello" class="world",
  style={ border: "1px solid red" }
```

Indented lines beginning with a leading comma also attach attributes to the preceding tag, which is the conventional multiline style:

```marko no-format
div
  ,id="hello"
  ,class=["class1", "class2", "class3"]
  ,style={ border: "1px solid red" }
  -- hello
```

## Text

Two or more hyphens (`--`) followed by whitespace begin [tag content](./language.md#tag-content). When text follows on the same line, the text ends at the newline:

```marko no-format
-- Hello world
div -- Hello world
```

When `--` is followed by a newline, the text block runs until a matching run of hyphens or the next dedent. HTML-mode tags can appear freely inside text blocks:

```marko no-format
--
This is
multiline text at the
root of the template
--
details
  --
  Since this is normal tag content,
  regular <strong>HTML Mode</strong>
  tags may be used freely.
  --
  summary --
    This content is
    implicitly closed
```

> [!TIP]
> Use more than two hyphens when the text itself contains `--`; the closing delimiter must use the same number of hyphens as the opening one.
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

### Root Level Text

Because templates begin in concise mode, bare root text is parsed as tags with attributes:

```marko no-format
Hello World
Welcome to Marko

// parsed as
<Hello World></Hello><Welcome to Marko></Welcome>
```

Prefix root-level text with `--` delimiters:

```marko no-format
-- Welcome to Marko
```
