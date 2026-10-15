# Patch Protocol

> [!TLDR]
>
> - The server sends small updates instead of a whole new page
> - The browser applies them to the page that is already running
> - Used by persisted pages, so state survives navigation
> - Coming soon

Normally, going to a new page replaces the document, and anything held in the browser starts over. With the patch protocol, the server sends only the values that changed, and the browser puts them into the page that is already there.

> [!NOTE]
> The patch protocol is not available to try yet. See [Coming Soon](../newsletter/august-2026.md#coming-soon) in the August newsletter and the [September update](../newsletter/september-2026.md) for progress so far.

## How It Works

The compiler knows every spot on a page where a server value can end up, such as a text node, an attribute, or an `<if>` branch. A patch names those spots directly, and the browser updates them in place. No HTML is compared.

When a branch shows up that the browser has not built yet, the patch includes its markup once, along with its values.

## Persisted Pages

Persisted pages are the first feature built on the protocol. A counter keeps its count, an open menu stays open, and text typed into an input stays put, while the content the server controls updates around them.

Templates stay ordinary Marko. If a patch cannot describe a change correctly, Marko does a full navigation instead, so a page is never left half updated.
