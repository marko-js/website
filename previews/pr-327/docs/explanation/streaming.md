# HTML Streaming

> [!TLDR]
>
> - HTML streaming sends markup to the browser incrementally as chunks become ready
> - `<await>` and `<try>` enable in-order and out-of-order streaming declaratively
> - Built-in placeholders and error boundaries handle loading and failure states

Marko streams HTML incrementally as templates render rather than buffering the entire document before sending the first byte. Using [`<await>`](../reference/core-tag.md#await) and [`<try>`](../reference/core-tag.md#try), templates flush static markup and `<head>` assets immediately while slow data fetches resolve in parallel.

## Background

Browsers have rendered partial HTML progressively since 1994, and HTTP has supported streaming responses since HTTP/1.1 chunked transfer encoding (1999) and HTTP/2–HTTP/3 [framing](https://httpwg.org/specs/rfc7540.html#:~:text=of%20the%20connection.-,frame,-%3A). Marko has shipped native HTML streaming [since 2014](https://innovation.ebayinc.com/stories/async-fragments-rediscovering-progressive-html-rendering-with-marko/).

### Streaming Modes

In **in-order streaming**, HTML chunks arrive in exact document order, pausing at each pending `<await>` until it resolves. In **out-of-order streaming**, placing `<await>` inside `<try>` with `<@placeholder>` flushes the placeholder immediately and streams the resolved HTML later with a tiny inline script that swaps it into place.

## Benefits

### Perceived Performance

Users see navigation, layout, and critical content immediately instead of staring at a blank screen while slow queries finish.

### Network Performance

Streaming delivers faster Time to First Byte (TTFB) so browsers begin parsing `<head>` immediately, triggers earlier downloads for stylesheets, fonts, and scripts while server data is still loading, and improves Time to Interactive (TTI) by letting visible interactive regions resume as soon as their chunks arrive.

### Reduced Server Load

Flushing HTML incrementally avoids holding full rendered documents in server memory, lowering peak memory usage and improving throughput.

## Streaming in Marko

### `<await>`

Waits for a promise and renders its resolved value through a tag parameter:

```marko
<await|user|=getUser()>
  <img src=user.avatar>
  ${user.name}
</await>
```

Marko flushes all HTML preceding `<await>` immediately, then flushes the resolved body and trailing HTML once `getUser()` resolves.

### `<try>`

Wraps async sections with loading placeholders and error boundaries:

```marko
<try>
  <await|user|=getUser()>
    ${user.name}
  </await>

  <@placeholder>Loading...</@placeholder>
  <@catch|err|>Error: ${err.message}</@catch>
</try>
```

#### `@placeholder`

Renders immediately while nested `<await>` promises are pending, opting into out-of-order streaming. Resolved chunks stream as soon as ready regardless of document order and swap into the placeholder's position on the client.

#### `@catch`

Catches errors thrown while rendering `<try>` content (including rejected `<await>` promises) and renders fallback markup without aborting the rest of the page.

## Troubleshooting

### Layout Shift

Replacing a placeholder with differently sized content can shift surrounding elements (CLS):

- Size placeholders or skeleton screens to match the resolved content's dimensions.
- Fall back to in-order streaming (omit `@placeholder`) when the resolved height is unpredictable and sits above the fold.

### Avoiding Buffering

Some proxies, CDNs, and compressors buffer responses by default, hiding streaming benefits until tuned.

#### Reverse Proxies

- Disable proxy buffering (or lower buffer sizes).
- Use HTTP/1.1 or higher for upstream connections (HTTP/1.0 does not support chunked streaming).
- Enable upstream `keep-alive` to avoid connection setup latency.
- For latency-critical small chunks: reduce gzip/brotli buffer sizes, [tune TLS record sizes](https://hpbn.co/transport-layer-security-tls/#optimize-tls-record-size), and send `X-Content-Type-Options: nosniff` so browsers do not buffer initial bytes for MIME sniffing.

<details>
  <summary><strong>NGINX</strong></summary>

Configure NGINX's [`http_proxy` module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering):

```sh
proxy_http_version 1.1; # 1.0 by default
proxy_buffering off;    # on by default
```

</details>

<details>
  <summary><strong>Apache</strong></summary>

Apache streams by default; if a host overrides it, check [`mod_proxy`](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html) and its [environment variables](https://httpd.apache.org/docs/2.4/env.html).

</details>

#### CDNs

<details>
  <summary><strong>Fastly (Varnish)</strong></summary>

Ensure VCL sets [`beresp.do_stream = true`](https://developer.fastly.com/reference/vcl/variables/backend-response/beresp-do-stream/).

</details>

<details>
  <summary><strong>Akamai</strong></summary>

Features like Adaptive Acceleration, Ion, mPulse, or Prefetch can buffer chunked responses. Disable response buffering in configuration:

```xml
<network:http.buffer-response-v2>off</network:http.buffer-response-v2>
```

</details>

#### Node.js Compression

When compressing small HTML chunks in Node.js, configure `Z_PARTIAL_FLUSH` on `zlib.createGzip`:

```js
import http from "node:http";
import zlib from "node:zlib";
import Template from "./page.marko";

http
  .createServer((request, response) => {
    response.writeHead(200, {
      "content-type": "text/html;charset=utf-8",
      "content-encoding": "gzip",
    });

    const gzip = zlib.createGzip({ flush: zlib.constants.Z_PARTIAL_FLUSH });
    gzip.pipe(response);

    Template.render({}).pipe(gzip);
  })
  .listen(80);
```

[`pipe()`](../reference/template.md#pipe) invokes `flush()` on the target stream after every chunk so compressed data reaches the client without waiting for a full compression buffer.
