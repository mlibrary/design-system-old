# ADR 3. Goodbye Lerna

## Context

Using Lerna in practices resulted in way too many difficult to troubleshoot issues. It is time intensive to configure with third-party tools, such as CI tools like Github Actions.

We haves spent dozens and dozens of hours trying to overcome a Lerna errors to just get back to "the feature."

## Decisions

Remove Lerna. Lower dependencies and number of files and complicated folder package directories. Flatten out the project structure.

Adopt a build tool to manage just enough and improve our development and getting started contributing experience.

We offer a single published design system package: `@umich-lib/web` as follows:

```
<link href="https://unpkg.com/@umich-lib/web@v1/umich-lib.css" rel="stylesheet"/>
<script type="module" src="https://unpkg.com/@umich-lib/web@v1/components/umich-lib.esm.js"></script>
<script nomodule src="https://unpkg.com/@umich-lib/web@v1/components/umich-lib.js"></script>
```

We use `web` because that's what we build. Tools for the web platform.

## Status

Proposed

## Consequences

We adopt the web as our platform even more so. Remove the unneccesary complexity with Lerna. We drop support for SCSS in favor of PostCSS.
