# Getting Started

Marko Run is a framework for building web applications with Marko. This is a _meta_-framework for Marko, similar to Next.js or Remix for React, SvelteKit for Svelte, and Nuxt for Vue.

Marko Run is powered by Vite, a fast and modern build tool that provides a great developer experience. It is designed to be easy to use and flexible, allowing developers to build applications with Marko quickly and efficiently.

## Using a Template

Marko's CLI provides a variety of templates to get started with Marko, many of which use Marko Run.

```sh
npm init marko
```

## Starting from Zero

The smallest possible Marko Run project requires just a few files.

```sh
npm init
npm install @marko/run
```

## Adding to an Existing Project

Marko Run can be added to an existing Marko project by installing the package.

```sh
npm install @marko/run
```

## Zero Config Setup

`marko-run` enables quick project initialization with minimal configuration. The package ships with a default Vite config and node-based adapter.

Starting with a template:

1. Create a new project

   ```sh
   npm init marko -- -t basic
   ```

2. Navigate to project directory

   ```sh
   cd PROJECT_NAME
   ```

3. Start development server

   ```sh
   npm run dev
   ```

Manual project setup:

1. Install the required package: `npm install @marko/run`
2. Create the entry file: `src/routes/+page.marko`
3. Start the development server: `npm exec marko-run`

The application will be available at `http://localhost:3000` 🚀

## CLI Commands

### `marko-run dev`

Starts a development server in watch mode

```sh
npm exec marko-run
```

or (with explicit sub command)

```sh
npm exec marko-run dev
```

### `marko-run build`

Creates a production build

```sh
npm exec marko-run build
```

### `marko-run preview`

Creates a production build and start the preview server

```sh
npm exec marko-run preview
```
