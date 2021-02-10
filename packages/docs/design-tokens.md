---
layout: layout.njk
eleventyNavigation:
  key: Design tokens
  order: 1
templateEngineOverride: njk
title: Design tokens
description: Design tokens are a tech-agnostic way to store low-level values and then use them to create the styles for your website. Use tokens instead of hard coded values to ensure a scalable, consistent, and sustainable system.
---

<p>{{ description }}</p>

<p>Design tokens are available to use in your stylesheets by <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/--*">custom properties (MDN web docs)</a>.</p>

{% include 'design-tokens.njk' %}

<h2 id="accessibility">Accessibility</h2>

<p>When using colors, be sure to use them in accessible combinations. Use the <a href="https://webaim.org/resources/contrastchecker/">WebAIM Contrast Checker</a> and  reference <a href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html"><abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 2.1 Understanding Success Criterion 1.4.3: Contrast (Minimum)</a> to make accessible decisions.</p>
