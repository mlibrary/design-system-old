---
layout: layout.njk
eleventyNavigation:
  key: Components
  order: 2
templateEngineOverride: njk,md
title: Components
description: The Design System makes it easy to implement and use its components across any framework or no framework at all. We accomplish this by using standardized web platform APIs and Web Components.
---

{{ description }}

{% for component in components %}

## {{ component.name }} {% if component.isExperimental %}<span class="badge badge--warning">Experimental</span>{% endif %}

{{ component.description }}

[Learn about how and when to use <span class="visually-hidden">{{ component.name }}</span>]({{ component.name | slug }})

{% endfor %}
