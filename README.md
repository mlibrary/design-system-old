# University of Michigan Library Design System

The design system exists to build trust in our digital services and create components and standards that are reusable, equitable, informed by research, and available to the public.

Are you trying to find [design system documentation](https://design-system.lib.umich.edu)?

### How do I get started developing?

We expect that you have basic working understanding of [HTML](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML), [CSS](https://developer.mozilla.org/en-US/docs/Learn/CSS), [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript), [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), and [Github](https://docs.github.com/en/github).

```
git clone https://github.com/mlibrary/design-system.git
cd design-system
```
Build the images
```
docker-compose build
```

Install the npm packages on your host machine
```
docker-compose run --rm web npm install
```

Build everything locally
```
docker-compose run --rm web npm run build
```

Start everything
``
docker-compose up
```

The Developer Workshop will then be available at [http://localhost:8080/](http://localhost:8080/). This web page serves as a design system workshop to develop web components and styles and learn how to use the system.

## Reference, A to Z

[**Eleventy**](https://www.11ty.dev/) is a static site generator that is fairly simple, but powerful enough to use for our [design system website](design-system.lib.umich.edu).

[**Gulp**](https://gulpjs.com/) for automating our development workflows and build pipelines.

[**PostCSS**](https://postcss.org/) for improving the developer experience when writing styles with plugins like [postcss-nesting](https://recordit.co/71o05ZKvNf) and optimizing and transforming CSS for distribution.

[**Stencil**](https://stenciljs.com/docs/introduction) is a compiler that generates Web Components (more specifically, Custom Elements). We use this to create ready-to-go solutions like with our [Universal Header Web Component](https://design-system.lib.umich.edu/universal-header/).

[**Theo**](https://github.com/salesforce-ux/theo) is an abstraction for transforming and formatting Design Tokens. Used to manage our single source of truth for design values, such as colors and spacings.
