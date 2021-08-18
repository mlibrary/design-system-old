# ADR 2. NPM Publish Prereleases

March 15, 2021

## Context

We want an automated way to collaborate on prereleases over a CDN to enable sharing and collaboration of pre released new components and styles across our projects.

## Decisions

With a Github Action build a `prerelease` tagged by the name of the branch for each Pull Request.

```
<link href="https://unpkg.com/@umich-lib/web@prerelease/umich-lib.css" rel="stylesheet"/>
<script type="module" src="https://unpkg.com/@umich-lib/web#@prerelease/dist/umich-lib/umich-lib.esm.js"></script>
<script nomodule src="https://unpkg.com/@umich-lib/web@prerelease/dist/umich-lib/umich-lib.js"></script>
```

## Status

Approved

## Consequences

We have a way to manage development contributions and use them in our development projects before production release commitments.

This adds some complexity for the developer using prereleases to swap between `@prerelease` and `@v1` tags, but this could be automated, perhaps.
