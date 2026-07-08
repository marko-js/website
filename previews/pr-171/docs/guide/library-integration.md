# Library Integration

## Framework-agnostic Libraries

Use `<lifecycle>` tag

```marko
import Map from "map"

<lifecycle
  onMount() {
    this.map = Map();
  }
  onUpdate() {
    this.map.doSomething();
  }
  onDestroy() {
    this.map.destroy();
  }
/>
```

## Marko Libraries

## Web Component Libraries

### Consuming in Marko

### Using Marko in a Web Component

### Wrapping Imperative APIs
