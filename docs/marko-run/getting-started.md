# Getting Started

## Using a Template

```
npm init marko
```

## Starting from Zero

```
npm init
npm install @marko/run
```

## Adding to an Existing Project

```
npm install @marko/run
```

## Getting Started / Zero Config

`marko-run` makes it easy to get started without little to no config. The package ships with a default Vite config and node-based adapter.

To get started from a template:

1. `npm init marko -- -t basic`
2. `cd ./<PROJECT_NAME>`
3. `npm run dev`

Or manually create a project:

1. Install `@marko/run`
2. Create file `src/routes/+page.marko`
3. Run `npm exec marko-run`

Finally open `http://localhost:3000` 🚀

## CLI

**`dev`** - Start a development server in watch mode

```
npm exec marko-run
```

or (with explicit sub command)

```
npm exec marko-run dev
```

**`build`** - Create a production build

```
npm exec marko-run build
```

**`preview`** - Create a production build and start the preview server

```
npm exec marko-run preview
```
