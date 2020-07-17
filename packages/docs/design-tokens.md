---
layout: layout.njk
eleventyNavigation:
  key: Design tokens
  order: 1
templateEngineOverride: njk
description: Design tokens are a tech-agnostic way to store low-level values and then use them to create the styles for your website. Use tokens instead of hard coded values to ensure a scalable, consistent, and sustainable system.
---

<h1>Design tokens</h1>

<p>{{ description }}</p>

<p>Design tokens are available to use in your stylesheets by <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/--*">custom properties (MDN web docs)</a>.</p>

{% include 'design-tokens.njk' %}

<h2 id="integration">Integration</h2>

<p>For integration, see <a href="/#css">getting started CSS documentation</a> to use design tokens as CSS custom properties.</p>
