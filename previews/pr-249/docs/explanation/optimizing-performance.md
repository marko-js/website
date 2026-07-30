# Optimizing Performance

## Profiling

### Server-side

### Client-side

## Client-side JS Size

## Promise Passing

Passing an unsettled promise into a template, rather than awaiting it first, lets the HTML flush while the work is still in flight. Client code that depends on the promise receives it [in its pending state](./serializable-state.md#pending-promises), settling once the server settles it.

## NODE_ENV

## Reducing Hydration Data
