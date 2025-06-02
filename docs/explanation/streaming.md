# HTML Streaming

Marko provides a powerful, yet simple, declarative approach to HTML streaming via `<await>` and `<try>` to improve perceived and real performance of your pages.

Streaming is the process of transmitting data incrementally as it’s generated. On the web, **HTML streaming** means sending HTML to the browser chunk-by-chunk, as soon as it's ready, rather than waiting until the entire document is completed.

In contrast, **buffering** means generating the full HTML page first, and only then sending it to the browser.

## Background & History

- **Origins of Progressive Rendering**

  - Browsers supported progressive rendering—the ability to render an partial HTML page—as early as Netscape Navigator 1.0 released in 1994
  - Chunked transfer encoding—enabling servers to send a partial response—was introduced as part of HTTP/1.1 in 1999
    - HTTP/2 and HTTP/3 are chunked (technically [framed](https://httpwg.org/specs/rfc7540.html#:~:text=of%20the%20connection.-,frame,-%3A)) by default
  - Although supported at the protocol level, most high level web libraries across most programming languages have buffered HTML responses
  - Within the JS ecosystem we've only seen HTML streaming become more mainstream in the 2020s

- **Marko’s Streaming History**

  - Marko has supported streaming [since its inception in 2014](https://innovation.ebayinc.com/stories/async-fragments-rediscovering-progressive-html-rendering-with-marko/)

### Types of HTML Streaming

- **In-order streaming**

  - HTML arrives in the exact order of document structure.

- **Out-of-order streaming**

  - HTML fragments arrive as data becomes ready, even if out of sequence.
  - Requires minimal JavaScript client-side to rearrange HTML in correct order.

## Benefits of Streaming

### Perceived Performance (User Experience)

- Users see content immediately, improving engagement.
- Reduces perceived loading times significantly by showing progressive content.

### Real Performance (Network & Rendering)

- **Faster Time to First Byte (TTFB)**
  Content starts arriving sooner, browsers begin parsing immediately.
- **Earlier Asset Downloads**
  CSS, fonts, and JavaScript can begin downloading before the entire page HTML completes.
- **Improved Time to Interactive (TTI)**
  Users can start interacting with visible components faster.

### Reduced Server Load

- Incremental streaming reduces memory usage.
- Lower latency and increased throughput.

## How to Stream using Marko 6

Marko provides intuitive built-in tags to handle asynchronous HTML generation and streaming:

### `<await>`

Wait for a promise to render a section of the template

**Syntax example:**

```marko
<await|user|=getUser()>
  <img src=user.avatar>
  ${user.name}
</await>
```

- Marko will flush as much HTML content as possible up to an `<await>`
- Upon resolution of `getUser()`, the remaining HTML will be flushed

### `<try>`

Manage asynchronous boundaries, handle loading states, and gracefully catch errors within streaming (and non-streaming) HTML.

**Basic syntax:**

```marko
<try>
  <await|user|=getUser()>
    ${user.name}
  </await>

  <@placeholder>
    Loading...
  </@placeholder>

  <@catch|err|>
    Error: ${err.message}
  </@catch>
</try>
```

#### `@placeholder`

- Provides temporary content displayed immediately while asynchronous data is loading.
- Opts into out of order rendering.
  - Marko supports rendering HTML fragments as soon as they’re ready, regardless of document order.
  - Automatically inserts minimal JavaScript to rearrange DOM elements on the client-side for correct final positioning.

#### `@catch`

- Captures and handles runtime errors occurring within rendered content, preventing the entire page from breaking.

## Troubleshooting & Common Pitfalls

### Avoiding Layout Shift (CLS)

Out-of-order streaming involves temporary placeholders being replaced with real content once it is ready. If not handled properly, this can cause content the user is reading or interacting with to shift, leading to a poor user experience.

- Use placeholders that reserve the correct amount of space.
- Utilize loading indicators/skeleton screens that accurately represent the content.
- Fallback to in-order streaming where it makes sense or content size cannot be determined

### Avoiding Buffering

Even though streaming has been supported on the web for decades and more tools are utilizing it, you may still find that some default configurations of third parties may assume a buffered response. Here are some known culprits that may buffer your server’s output HTTP streams:

#### Reverse proxies/load balancers

- Turn off proxy buffering, or if you can’t, set the proxy buffer sizes to be reasonably small.
- Make sure the “upstream” HTTP version is 1.1 or higher; HTTP/1.0 and lower do not support streaming.
- Some software doesn’t support HTTP/2 or higher “upstream” connections at all or very well — if your Node server uses HTTP/2, you may need to downgrade.
- Check if “upstream” connections are `keep-alive`: overhead from closing and reopening connections may delay responses.
- For typical modern webpage filesizes, the following bullet points probably won’t matter. But if you want to stream **small chunks of data with the lowest latency**, investigate these sources of buffering:
  - Automatic gzip/brotli compression may have their buffer sizes set too high; you can tune their buffers to be smaller for faster streaming in exchange for slightly worse compression.
  - You can [tune HTTPS record sizes for lower latency, as described in High Performance Browser Networking](https://hpbn.co/transport-layer-security-tls/#optimize-tls-record-size).
  - Turning off MIME sniffing with [the `X-Content-Type-Options`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options) header eliminates browser buffering at the very beginning of HTTP responses

<details>
  <summary><strong>NGiNX</strong></summary>

Most of NGiNX’s relevant parameters are inside [its builtin `http_proxy` module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering):

```
proxy_http_version 1.1; # 1.0 by default
proxy_buffering off; # on by default
```

</details>

<details>
  <summary><strong>Apache</strong></summary>

Apache’s default configuration works fine with streaming, but your host may have it configured differently. The relevant Apache configuration is inside [its `mod_proxy` and `mod_proxy_*` modules](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html) and their [associated environment variables](https://httpd.apache.org/docs/2.4/env.html).

</details>

#### CDNs

Content Delivery Networks (CDNs) consider efficient streaming one of their best features, but it may be off by default or if certain features are enabled.

<details>
  <summary><strong>Fastly (Varnish)</strong></summary>

For Fastly or another provider that uses VCL configuration, check [if backend responses have `beresp.do_stream = true` set](https://developer.fastly.com/reference/vcl/variables/backend-response/beresp-do-stream/).

</details>
<details>
  <summary><strong>Akamai</strong></summary>

Some [Akamai features designed to mitigate slow backends can ironically slow down fast chunked responses](https://community.akamai.com/customers/s/question/0D50f00006n975d/enabling-chunked-transfer-encoding-responses). Try toggling off Adaptive Acceleration, Ion, mPulse, Prefetch, and/or similar performance features. Also check for the following in the configuration:

```
<network:http.buffer-response-v2>off</network:http.buffer-response-v2>
```

</details>

#### Node.js itself

For extreme cases where [Node streams very small HTML chunks with its built-in compression modules](https://github.com/marko-js/marko/pull/1641), you may need to tweak the compressor stream settings. Here’s an example with `createGzip` and its `Z_PARTIAL_FLUSH` flag:

```js
import http from "http";
import zlib from "zlib";

import MarkoTemplate from "./something.marko";

http
  .createServer(function (request, response) {
    response.writeHead(200, { "content-type": "text/html;charset=utf-8" });
    const templateStream = MarkoTemplate.stream({});
    const gzipStream = zlib.createGzip({
      flush: zlib.constants.Z_PARTIAL_FLUSH,
    });
    templateStream.pipe(outputStream).pipe(response);
  })
  .listen(80);
```
