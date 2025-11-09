# ライブラリ統合

## フレームワークに依存しないライブラリ

`<lifecycle>`タグを使用します

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

## Markoライブラリ

## Web Componentライブラリ

### Markoでの使用

### Web ComponentでのMarkoの使用

### 命令型APIのラップ
