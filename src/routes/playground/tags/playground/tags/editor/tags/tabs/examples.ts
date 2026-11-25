export default [
  {
    name: "counter",
    content: `/**
 * Demonstrates Marko's controllable pattern.
 *
 * Optionally bind the count from a parent:
 * \`\`\`
 * <let/myCount=0>
 * <counter value:=myCount/>
 * \`\`\`
 */

<let/count=(input.value ?? 0) valueChange=input.valueChange>
<button onClick() { count++ }>
  \${count}
</button>
`,
  },
  {
    name: "let-localstorage",
    content: `/**
 * Behaves like \`<let>\`, synced through \`localStorage\` so
 * the value persists across page reloads.
 *
 * Pass a \`key=\` attribute:
 * \`\`\`
 * <let-localstorage/count=0 key="my-count"/>
 * \`\`\`
 */

<let/internalValue=input.value>

<script>
  const existingValue = localStorage.getItem(input.key);
  if (existingValue) {
    internalValue = JSON.parse(existingValue);
  }
  window.addEventListener(
    "local-storage-update",
    ({ detail }) => {
      if (detail.key === input.key) {
        internalValue = JSON.parse(detail.value ?? "null");
      }
    },
    {
      signal: $signal,
    },
  );
</script>

<return=internalValue valueChange(newValue) {
  const stringified = JSON.stringify(newValue);
  localStorage.setItem(input.key, stringified);
  window.dispatchEvent(
    new CustomEvent("local-storage-update", {
      detail: {
        key: input.key,
        value: stringified,
      },
    }),
  );
}>
`,
  },
  {
    name: "pointer-down",
    content: `/**
 * Uses reactive scripts and \`$signal\` to wire up document-wide
 * event listeners with automatic cleanup.
 *
 * Example usage:
 * \`\`\`
 * <pointer-down/clicking/>
 * <if=clicking>Clicking!</if>
 * \`\`\`
 */

<let/down=false>

<script>
  document.addEventListener("pointerdown", () => {
    down = true;
  }, { signal: $signal });
  document.addEventListener("pointerup", () => {
    down = false;
  }, { signal: $signal });
</script>

<return=down>
`,
  },
];
