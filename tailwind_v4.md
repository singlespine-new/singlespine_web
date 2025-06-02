Getting started
Upgrade guide

Upgrading your Tailwind CSS projects from v3 to v4.

Tailwind CSS v4.0 is a new major version of the framework, so while we've worked really hard to minimize breaking changes, some updates are necessary. This guide outlines all the steps required to upgrade your projects from v3 to v4.

Tailwind CSS v4.0 is designed for Safari 16.4+, Chrome 111+, and Firefox 128+. If you need to support older browsers, stick with v3.4 until your browser support requirements change.
Using the upgrade tool

If you'd like to upgrade a project from v3 to v4, you can use our upgrade tool to do the vast majority of the heavy lifting for you:
Terminal

$ npx @tailwindcss/upgrade

For most projects, the upgrade tool will automate the entire migration process including updating your dependencies, migrating your configuration file to CSS, and handling any changes to your template files.

The upgrade tool requires Node.js 20 or higher, so ensure your environment is updated before running it.

We recommend running the upgrade tool in a new branch, then carefully reviewing the diff and testing your project in the browser to make sure all of the changes look correct. You may need to tweak a few things by hand in complex projects, but the tool will save you a ton of time either way.

It's also a good idea to go over all of the breaking changes in v4 and get a good understanding of what's changed, in case there are other things you need to update in your project that the upgrade tool doesn't catch.
Upgrading manually
Using PostCSS

In v3, the tailwindcss package was a PostCSS plugin, but in v4 the PostCSS plugin lives in a dedicated @tailwindcss/postcss package.

Additionally, in v4 imports and vendor prefixing is now handled for you automatically, so you can remove postcss-import and autoprefixer if they are in your project:
postcss.config.mjs

export default {
  plugins: {
    "postcss-import": {},
    tailwindcss: {},
    autoprefixer: {},
    "@tailwindcss/postcss": {},
  },
};

Using Vite

If you're using Vite, we recommend migrating from the PostCSS plugin to our new dedicated Vite plugin for improved performance and the best developer experience:
vite.config.ts

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
});

Using Tailwind CLI

In v4, Tailwind CLI lives in a dedicated @tailwindcss/cli package. Update any of your build commands to use the new package instead:
Terminal

npx tailwindcss -i input.css -o output.css
npx @tailwindcss/cli -i input.css -o output.css

Changes from v3

Here's a comprehensive list of all the breaking changes in Tailwind CSS v4.0.

Our upgrade tool will handle most of these changes for you automatically, so we highly recommend using it if you can.
Browser requirements

Tailwind CSS v4.0 is designed for modern browsers and targets Safari 16.4, Chrome 111, and Firefox 128. We depend on modern CSS features like @property and color-mix() for core framework features, and Tailwind CSS v4.0 will not work in older browsers.

If you need to support older browsers, we recommend sticking with v3.4 for now. We're actively exploring a compatibility mode to help people upgrade sooner that we hope to share more news on in the future.
Removed @tailwind directives

In v4 you import Tailwind using a regular CSS @import statement, not using the @tailwind directives you used in v3:
CSS

@tailwind base;
@tailwind components;
@tailwind utilities;
@import "tailwindcss";

Removed deprecated utilities

We've removed any utilities that were deprecated in v3 and have been undocumented for several years. Here's a list of what's been removed along with the modern alternative:
Deprecated	Replacement
bg-opacity-*	Use opacity modifiers like bg-black/50
text-opacity-*	Use opacity modifiers like text-black/50
border-opacity-*	Use opacity modifiers like border-black/50
divide-opacity-*	Use opacity modifiers like divide-black/50
ring-opacity-*	Use opacity modifiers like ring-black/50
placeholder-opacity-*	Use opacity modifiers like placeholder-black/50
flex-shrink-*	shrink-*
flex-grow-*	grow-*
overflow-ellipsis	text-ellipsis
decoration-slice	box-decoration-slice
decoration-clone	box-decoration-clone
Renamed utilities

We've renamed the following utilities in v4 to make them more consistent and predictable:
v3	v4
shadow-sm	shadow-xs
shadow	shadow-sm
drop-shadow-sm	drop-shadow-xs
drop-shadow	drop-shadow-sm
blur-sm	blur-xs
blur	blur-sm
backdrop-blur-sm	backdrop-blur-xs
backdrop-blur	backdrop-blur-sm
rounded-sm	rounded-xs
rounded	rounded-sm
outline-none	outline-hidden
ring	ring-3
Updated shadow, radius, and blur scales

We've renamed the default shadow, radius and blur scales to make sure every utility has a named value. The "bare" versions still work for backward compatibility, but the <utility>-sm utilities will look different unless updated to their respective <utility>-xs versions.

To update your project for these changes, replace all the v3 utilities with their v4 versions:
HTML

<input class="shadow-sm" />
<input class="shadow-xs" />
<input class="shadow" />
<input class="shadow-sm" />

Renamed outline utility

The outline utility now sets outline-width: 1px by default to be more consistent with border and ring utilities. Furthermore all outline-<number> utilities default outline-style to solid, omitting the need to combine them with outline:
HTML

<input class="outline outline-2" />
<input class="outline-2" />

The outline-none utility previously didn't actually set outline-style: none, and instead set an invisible outline that would still show up in forced colors mode for accessibility reasons.

To make this more clear we've renamed this utility to outline-hidden and added a new outline-none utility that actually sets outline-style: none.

To update your project for this change, replace any usage of outline-none with outline-hidden:
HTML

<input class="focus:outline-none" />
<input class="focus:outline-hidden" />

Default ring width change

In v3, the ring utility added a 3px ring. We've changed this in v4 to be 1px to make it consistent with borders and outlines.

To update your project for this change, replace any usage of ring with ring-3:
HTML

<input class="ring ring-blue-500" />
<input class="ring-3 ring-blue-500" />

Space-between selector

We've changed the selector used by the space-x-* and space-y-* utilities to address serious performance issues on large pages:
CSS

/* Before */
.space-y-4 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 1rem;
}
/* Now */
.space-y-4 > :not(:last-child) {
  margin-bottom: 1rem;
}

You might see changes in your project if you were ever using these utilities with inline elements, or if you were adding other margins to child elements to tweak their spacing.

If this change causes any issues in your project, we recommend migrating to a flex or grid layout and using gap instead:
HTML

<div class="space-y-4 p-4">
<div class="flex flex-col gap-4 p-4">
  <label for="name">Name</label>
  <input type="text" name="name" />
</div>

Using variants with gradients

In v3, overriding part of a gradient with a variant would "reset" the entire gradient, so in this example the to-* color would be transparent in dark mode instead of yellow:
HTML

<div class="bg-gradient-to-r from-red-500 to-yellow-400 dark:from-blue-500">
  <!-- ... -->
</div>

In v4, these values are preserved which is more consistent with how other utilities in Tailwind work.

This means you may need to explicitly use via-none if you want to "unset" a three-stop gradient back to a two-stop gradient in a specific state:
HTML

<div class="bg-linear-to-r from-red-500 via-orange-400 to-yellow-400 dark:via-none dark:from-blue-500 dark:to-teal-400">
  <!-- ... -->
</div>

Container configuration

In v3, the container utility had several configuration options like center and padding that no longer exist in v4.

To customize the container utility in v4, extend it using the @utility directive:
CSS

@utility container {
  margin-inline: auto;
  padding-inline: 2rem;
}

Default border color

In v3, the border-* and divide-* utilities used your configured gray-200 color by default. We've changed this to currentColor in v4 to make Tailwind less opinionated and match browser defaults.

To update your project for this change, make sure you specify a color anywhere you're using a border-* or divide-* utility:

<div class="border border-gray-200 px-2 py-3 ...">
  <!-- ... -->
</div>

Alternatively, add these base styles to your project to preserve the v3 behavior:
CSS

@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentColor);
  }
}

Default ring width and color

We've changed the width of the ring utility from 3px to 1px and changed the default color from blue-500 to currentColor to make things more consistent the border-*, divide-*, and outline-* utilities.

To update your project for these changes, replace any use of ring with ring-3:

<button class="focus:ring ...">
<button class="focus:ring-3 ...">
  <!-- ... -->
</button>

Then make sure to add ring-blue-500 anywhere you were depending on the default ring color:

<button class="focus:ring-3 focus:ring-blue-500 ...">
  <!-- ... -->
</button>

Alternatively, add these theme variables to your CSS to preserve the v3 behavior:
CSS

@theme {
  --default-ring-width: 3px;
  --default-ring-color: var(--color-blue-500);
}

Note though that these variables are only supported for compatibility reasons, and are not considered idiomatic usage of Tailwind CSS v4.0.
Preflight changes

We've made a couple small changes to the base styles in Preflight in v4:
New default placeholder color

In v3, placeholder text used your configured gray-400 color by default. We've simplified this in v4 to just use the current text color at 50% opacity.

You probably won't even notice this change (it might even make your project look better), but if you want to preserve the v3 behavior, add this CSS to your project:
CSS

@layer base {
  input::placeholder,
  textarea::placeholder {
    color: var(--color-gray-400);
  }
}

Buttons use the default cursor

Buttons now use cursor: default instead of cursor: pointer to match the default browser behavior.

If you'd like to continue using cursor: pointer by default, add these base styles to your CSS:
CSS

@layer base {
  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }
}

Dialog margins removed

Preflight now resets margins on <dialog> elements to be consistent with how other elements are reset.

If you still want dialogs to be centered by default, add this CSS to your project:
CSS

@layer base {
  dialog {
    margin: auto;
  }
}

Using a prefix

Prefixes now look like variants and are always at the beginning of the class name:

<div class="tw:flex tw:bg-red-500 tw:hover:bg-red-600">
  <!-- ... -->
</div>

When using a prefix, you should still configure your theme variables as if you aren't using a prefix:

@import "tailwindcss" prefix(tw);
@theme {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 120rem;
  --color-avocado-100: oklch(0.99 0 0);
  --color-avocado-200: oklch(0.98 0.04 113.22);
  --color-avocado-300: oklch(0.94 0.11 115.03);
  /* ... */
}

The generated CSS variables will include a prefix to avoid conflicts with any existing variables in your project:

:root {
  --tw-font-display: "Satoshi", "sans-serif";
  --tw-breakpoint-3xl: 120rem;
  --tw-color-avocado-100: oklch(0.99 0 0);
  --tw-color-avocado-200: oklch(0.98 0.04 113.22);
  --tw-color-avocado-300: oklch(0.94 0.11 115.03);
  /* ... */
}

Adding custom utilities

In v3, any custom classes you defined within @layer utilities or @layer components would get picked up by Tailwind as a true utility class and would automatically work with variants like hover, focus, or lg with the difference being that @layer components would always come first in the generated stylesheet.

In v4 we are using native cascade layers and no longer hijacking the @layer at-rule, so we've introduced the @utility API as a replacement:
CSS

@layer utilities {
  .tab-4 {
    tab-size: 4;
  }
}
@utility tab-4 {
  tab-size: 4;
}

Custom utilities are now also sorted based on the amount of properties they define. This means that component utilities like this .btn can be overwritten by other Tailwind utilities without additional configuration:
CSS

@layer components {
  .btn {
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: ButtonFace;
  }
}
@utility btn {
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: ButtonFace;
}

Learn more about registering custom utilities in the adding custom utilities documentation.
Variant stacking order

In v3, stacked variants were applied from right to left, but in v4 we've updated them to apply left to right to look more like CSS syntax.

To update your project for this change, reverse the order of any order-sensitive stacked variants in your project:
HTML

<ul class="py-4 first:*:pt-0 last:*:pb-0">
<ul class="py-4 *:first:pt-0 *:last:pb-0">
  <li>One</li>
  <li>Two</li>
  <li>Three</li>
</ul>

You likely have very few of these if any—the direct child variant (*) and any typography plugin variants (prose-headings) are the most likely ones you might be using, and even then it's only if you've stacked them with other variants.
Variables in arbitrary values

In v3 you were able to use CSS variables as arbitrary values without var(), but recent updates to CSS mean that this can often be ambiguous, so we've changed the syntax for this in v4 to use parentheses instead of square brackets.

To update your project for this change, replace usage of the old variable shorthand syntax with the new variable shorthand syntax:
HTML

<div class="bg-[--brand-color]"></div>
<div class="bg-(--brand-color)"></div>

Hover styles on mobile

In v4 we've updated the hover variant to only apply when the primary input device supports hover:
CSS

@media (hover: hover) {
  .hover\:underline:hover {
    text-decoration: underline;
  }
}

This can create problems if you've built your site in a way that depends on touch devices triggering hover on tap. If this is an issue for you, you can override the hover variant with your own variant that uses the old implementation:
CSS

@custom-variant hover (&:hover);

Generally though we recommend treating hover functionality as an enhancement, and not depending on it for your site to work since touch devices don't truly have the ability to hover.
Transitioning outline-color

The transition and transition-color utilities now include the outline-color property.

This means if you were adding an outline with a custom color on focus, you will see the color transition from the default color. To avoid this, make sure you set the outline color unconditionally, or explicitly set it for both states:
HTML

<button class="transition hover:outline-2 hover:outline-cyan-500"></button>
<button class="outline-cyan-500 transition hover:outline-2"></button>

Disabling core plugins

In v3 there was a corePlugins option you could use to completely disable certain utilities in the framework. This is no longer supported in v4.
Using the theme() function

Since v4 includes CSS variables for all of your theme values, we recommend using those variables instead of the theme() function whenever possible:
CSS

.my-class {
  background-color: theme(colors.red.500);
  background-color: var(--color-red-500);
}

For cases where you still need to use the theme() function (like in media queries where CSS variables aren't supported), you should use the CSS variable name instead of the old dot notation:
CSS

@media (width >= theme(screens.xl)) {
@media (width >= theme(--breakpoint-xl)) {
  /* ... */
}

Using a JavaScript config file

JavaScript config files are still supported for backward compatibility, but they are no longer detected automatically in v4.

If you still need to use a JavaScript config file, you can load it explicitly using the @config directive:
CSS

@config "../../tailwind.config.js";

The corePlugins, safelist, and separator options from the JavaScript-based config are not supported in v4.0.
Theme values in JavaScript

In v3 we exported a resolveConfig function that you could use to turn your JavaScript-based config into a flat object that you could use in your other JavaScript.

We've removed this in v4 in hopes that people can use the CSS variables we generate directly instead, which is much simpler and will significantly reduce your bundle size.

For example, the popular Motion library for React lets you animate to and from CSS variable values:
JSX

<motion.div animate={{ backgroundColor: "var(--color-blue-500)" }} />

If you need access to a resolved CSS variable value in JS, you can use getComputedStyle to get the value of a theme variable on the document root:
spaghetti.js

let styles = getComputedStyle(document.documentElement);
let shadow = styles.getPropertyValue("--shadow-xl");

Using @apply with Vue, Svelte, or CSS modules

In v4, stylesheets that are bundled separately from your main CSS file (e.g. CSS modules files, <style> blocks in Vue, Svelte, or Astro, etc.) do not have access to theme variables, custom utilities, and custom variants defined in other files.

To make these definitions available in these contexts, use @reference to import them without duplicating any CSS in your bundle:
Vue

<template>
  <h1>Hello world!</h1>
</template>
<style>
  @reference "../../app.css";
  h1 {
    @apply text-2xl font-bold text-red-500;
  }
</style>

Alternatively, you can use your CSS theme variables directly instead of using @apply at all, which will also improve performance since Tailwind won't need to process these styles:
Vue

<template>
  <h1>Hello world!</h1>
</template>
<style>
  h1 {
    color: var(--text-red-500);
  }
</style>

You can find more documentation on using Tailwind with CSS modules.

---
Styling with utility classes

Building complex components from a constrained set of primitive utilities.
Overview

You style things with Tailwind by combining many single-purpose presentational classes (utility classes) directly in your markup:
ChitChat

You have a new message!

<div class="mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
  <img class="size-12 shrink-0" src="/img/logo.svg" alt="ChitChat Logo" />
  <div>
    <div class="text-xl font-medium text-black dark:text-white">ChitChat</div>
    <p class="text-gray-500 dark:text-gray-400">You have a new message!</p>
  </div>
</div>

For example, in the UI above we've used:

    The display and padding utilities (flex, shrink-0, and p-6) to control the overall layout
    The max-width and margin utilities (max-w-sm and mx-auto) to constrain the card width and center it horizontally
    The background-color, border-radius, and box-shadow utilities (bg-white, rounded-xl, and shadow-lg) to style the card's appearance
    The width and height utilities (size-12) to set the width and height of the logo image
    The gap utilities (gap-x-4) to handle the spacing between the logo and the text
    The font-size, color, and font-weight utilities (text-xl, text-black, font-medium, etc.) to style the card text

Styling things this way contradicts a lot of traditional best practices, but once you try it you'll quickly notice some really important benefits:

    You get things done faster — you don't spend any time coming up with class names, making decisions about selectors, or switching between HTML and CSS files, so your designs come together very fast.
    Making changes feels safer — adding or removing a utility class to an element only ever affects that element, so you never have to worry about accidentally breaking something another page that's using the same CSS.
    Maintaining old projects is easier — changing something just means finding that element in your project and changing the classes, not trying to remember how all of that custom CSS works that you haven't touched in six months.
    Your code is more portable — since both the structure and styling live in the same place, you can easily copy and paste entire chunks of UI around, even between different projects.
    Your CSS stops growing — since utility classes are so reusable, your CSS doesn't continue to grow linearly with every new feature you add to a project.

These benefits make a big difference on small projects, but they are even more valuable for teams working on long-running projects at scale.
Why not just use inline styles?

A common reaction to this approach is wondering, “isn’t this just inline styles?” and in some ways it is — you’re applying styles directly to elements instead of assigning them a class name and then styling that class.

But using utility classes has many important advantages over inline styles, for example:

    Designing with constraints — using inline styles, every value is a magic number. With utilities, you’re choosing styles from a predefined design system, which makes it much easier to build visually consistent UIs.
    Hover, focus, and other states — inline styles can’t target states like hover or focus, but Tailwind’s state variants make it easy to style those states with utility classes.
    Media queries — you can’t use media queries in inline styles, but you can use Tailwind’s responsive variants to build fully responsive interfaces easily.

This component is fully responsive and includes a button with hover and active styles, and is built entirely with utility classes:
Woman's Face

Erin Lindford

Product Engineer

<div class="flex flex-col gap-2 p-8 sm:flex-row sm:items-center sm:gap-6 sm:py-4 ...">
  <img class="mx-auto block h-24 rounded-full sm:mx-0 sm:shrink-0" src="/img/erin-lindford.jpg" alt="" />
  <div class="space-y-2 text-center sm:text-left">
    <div class="space-y-0.5">
      <p class="text-lg font-semibold text-black">Erin Lindford</p>
      <p class="font-medium text-gray-500">Product Engineer</p>
    </div>
    <button class="border-purple-200 text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white active:bg-purple-700 ...">
      Message
    </button>
  </div>
</div>

Thinking in utility classes
Styling hover and focus states

To style an element on states like hover or focus, prefix any utility with the state you want to target, for example hover:bg-sky-700:

Hover over this button to see the background color change

<button class="bg-sky-500 hover:bg-sky-700 ...">Save changes</button>

These prefixes are called variants in Tailwind, and they only apply the styles from a utility class when the condition for that variant matches.

Here's what the generated CSS looks like for the hover:bg-sky-700 class:
Generated CSS

.hover\:bg-sky-700 {
  &:hover {
    background-color: var(--color-sky-700);
  }
}

Notice how this class does nothing unless the element is hovered? Its only job is to provide hover styles — nothing else.

This is different from how you'd write traditional CSS, where a single class would usually provide the styles for many states:
HTML

<button class="btn">Save changes</button>
<style>
  .btn {
    background-color: var(--color-sky-500);
    &:hover {
      background-color: var(--color-sky-700);
    }
  }
</style>

You can even stack variants in Tailwind to apply a utility when multiple conditions match, like combining hover: and disabled:

<button class="bg-sky-500 disabled:hover:bg-sky-500 ...">Save changes</button>

Learn more in the documentation styling elements on hover, focus, and other states.
Media queries and breakpoints

Just like hover and focus states, you can style elements at different breakpoints by prefixing any utility with the breakpoint where you want that style to apply:

Resize this example to see the layout change
01
02
03
04
05
06

<div class="grid grid-cols-2 sm:grid-cols-3">
  <!-- ... -->
</div>

In the example above, the sm: prefix makes sure that grid-cols-3 only triggers at the sm breakpoint and above, which is 40rem out of the box:
Generated CSS

.sm\:grid-cols-3 {
  @media (width >= 40rem) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

Learn more in the responsive design documentation.
Targeting dark mode

Styling an element in dark mode is just a matter of adding the dark: prefix to any utility you want to apply when dark mode is active:

Light mode

Writes upside-down

The Zero Gravity Pen can be used to write in any orientation, including upside-down. It even works in outer space.

Dark mode

Writes upside-down

The Zero Gravity Pen can be used to write in any orientation, including upside-down. It even works in outer space.

<div class="bg-white dark:bg-gray-800 rounded-lg px-6 py-8 ring shadow-xl ring-gray-900/5">
  <div>
    <span class="inline-flex items-center justify-center rounded-md bg-indigo-500 p-2 shadow-lg">
      <svg
        class="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <!-- ... -->
      </svg>
    </span>
  </div>
  <h3 class="text-gray-900 dark:text-white mt-5 text-base font-medium tracking-tight ">Writes upside-down</h3>
  <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm ">
    The Zero Gravity Pen can be used to write in any orientation, including upside-down. It even works in outer space.
  </p>
</div>

Just like with hover states or media queries, the important thing to understand is that a single utility class will never include both the light and dark styles — you style things in dark mode by using multiple classes, one for the light mode styles and another for the dark mode styles.
Generated CSS

.dark\:bg-gray-800 {
  @media (prefers-color-scheme: dark) {
    background-color: var(--color-gray-800);
  }
}

Learn more in the dark mode documentation.
Using class composition

A lot of the time with Tailwind you'll even use multiple classes to build up the value for a single CSS property, for example adding multiple filters to an element:
HTML

<div class="blur-sm grayscale">
  <!-- ... -->
</div>

Both of these effects rely on the filter property in CSS, so Tailwind uses CSS variables to make it possible to compose these effects together:
Generated CSS

.blur-sm {
  --tw-blur: blur(var(--blur-sm));
  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-grayscale,);
}
.grayscale {
  --tw-grayscale: grayscale(100%);
  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-grayscale,);
}

The generated CSS above is slightly simplified, but the trick here is that each utility sets a CSS variable just for the effect it's meant to apply. Then the filter property looks at all of these variables, falling back to nothing if the variable hasn't been set.

Tailwind uses this same approach for gradients, shadow colors, transforms, and more.
Using arbitrary values

Many utilities in Tailwind are driven by theme variables, like bg-blue-500, text-xl, and shadow-md, which map to your underlying color palette, type scale, and shadows.

When you need to use a one-off value outside of your theme, use the special square bracket syntax for specifying arbitrary values:
HTML

<button class="bg-[#316ff6] ...">
  Sign in with Facebook
</button>

This can be useful for one-off colors outside of your color palette (like the Facebook blue above), but also when you need a complex custom value like a very specific grid:
HTML

<div class="grid grid-cols-[24rem_2.5rem_minmax(0,1fr)]">
  <!-- ... -->
</div>

It's also useful when you need to use CSS features like calc(), even if you are using your theme values:
HTML

<div class="max-h-[calc(100dvh-(--spacing(6))]">
  <!-- ... -->
</div>

There's even a syntax for generating completely arbitrary CSS including an arbitrary property name, which can be useful for setting CSS variables:
HTML

<div class="[--gutter-width:1rem] lg:[--gutter-width:2rem]">
  <!-- ... -->
</div>

Learn more in the documentation on using arbitrary values.
How does this even work?

Tailwind CSS isn't one big static stylesheet like you might be used to with other CSS frameworks — it generates the CSS needed based on the classes you're actually using when you compile your CSS.

It does this by scanning all of the files in your project looking for any symbol that looks like it could be a class name:
Button.jsx

export default function Button({ size, children }) {
  let sizeClasses = {
    md: "px-4 py-2 rounded-md text-base",
    lg: "px-5 py-3 rounded-lg text-lg",
  }[size];
  return (
    <button type="button" className={`font-bold ${sizeClasses}`}>
      {children}
    </button>
  );
}

After it's found all of the potential classes, Tailwind generates the CSS for each one and compiles it all into one stylesheet of just the styles you actually need.

Since the CSS is generated based on the class name, Tailwind can recognize classes using arbitrary values like bg-[#316ff6] and generate the necessary CSS, even when the value isn't part of your theme.

Learn more about how this works in detecting classes in source files.
Complex selectors

Sometimes you need to style an element under a combination of conditions, for example in dark mode, at a specific breakpoint, when hovered, and when the element has a specific data attribute.

Here's an example of what that looks like with Tailwind:
HTML

<button class="dark:lg:data-current:hover:bg-indigo-600 ...">
  <!-- ... -->
</button>

Simplified CSS

@media (prefers-color-scheme: dark) and (width >= 64rem) {
  button[data-current]:hover {
    background-color: var(--color-indigo-600);
  }
}

Tailwind also supports things like group-hover, which let you style an element when a specific parent is hovered:
HTML

<a href="#" class="group rounded-lg p-8">
  <!-- ... -->
  <span class="group-hover:underline">Read more…</span>
</a>

Simplified CSS

@media (hover: hover) {
  a:hover span {
    text-decoration-line: underline;
  }
}

This group-* syntax works with other variants too, like group-focus, group-active, and many more.

For really complex scenarios (especially when styling HTML you don't control), Tailwind supports arbitrary variants which let you write any selector you want, directly in a class name:
HTML

<div class="[&>[data-active]+span]:text-blue-600 ...">
  <span data-active><!-- ... --></span>
  <span>This text will be blue</span>
</div>

Simplified CSS

div > [data-active] + span {
  color: var(--color-blue-600);
}

When to use inline styles

Inline styles are still very useful in Tailwind CSS projects, particularly when a value is coming from a dynamic source like a database or API:
branded-button.jsx

export function BrandedButton({ buttonColor, textColor, children }) {
  return (
    <button
      style={{
        backgroundColor: buttonColor,
        color: textColor,
      }}
      className="rounded-md px-3 py-1.5 font-medium"
    >
      {children}
    </button>
  );
}

You might also reach for an inline style for very complicated arbitrary values that are difficult to read when formatted as a class name:
HTML

<div class="grid-[2fr_max(0,var(--gutter-width))_calc(var(--gutter-width)+10px)]">
<div style="grid-template-columns: 2fr max(0, var(--gutter-width)) calc(var(--gutter-width) + 10px)">
  <!-- ... -->
</div>

Another useful pattern is setting CSS variables based on dynamic sources using inline styles, then referencing those variables with utility classes:
branded-button.jsx

export function BrandedButton({ buttonColor, buttonColorHover, textColor, children }) {
  return (
    <button
      style={{
        "--bg-color": buttonColor,
        "--bg-color-hover": buttonColorHover,
        "--text-color": textColor,
      }}
      className="bg-(--bg-color) text-(--text-color) hover:bg-(--bg-color-hover) ..."
    >
      {children}
    </button>
  );
}

Managing duplication

When you build entire projects with just utility classes, you'll inevitably find yourself repeating certain patterns to recreate the same design in different places.

For example, here the utility classes for each avatar image are repeated five separate times:
Contributors
204

    198 others

<div>
  <div class="flex items-center space-x-2 text-base">
    <h4 class="font-semibold text-slate-900">Contributors</h4>
    <span class="bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 ...">204</span>
  </div>
  <div class="mt-3 flex -space-x-2 overflow-hidden">
    <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
    <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
    <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt="" />
    <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
    <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
  </div>
  <div class="mt-3 text-sm font-medium">
    <a href="#" class="text-blue-500">+ 198 others</a>
  </div>
</div>

Don't panic! In practice this isn't the problem you might be worried it is, and the strategies for dealing with it are things you already do every day.
Using loops

A lot of the time a design element that shows up more than once in the rendered page is only actually authored once because the actual markup is rendered in a loop.

For example, the duplicate avatars at the beginning of this guide would almost certainly be rendered in a loop in a real project:
Contributors
204

    198 others

<div>
  <div class="flex items-center space-x-2 text-base">
    <h4 class="font-semibold text-slate-900">Contributors</h4>
    <span class="bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 ...">204</span>
  </div>
  <div class="mt-3 flex -space-x-2 overflow-hidden">
    {#each contributors as user}
      <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" src={user.avatarUrl} alt={user.handle} />
    {/each}
  </div>
  <div class="mt-3 text-sm font-medium">
    <a href="#" class="text-blue-500">+ 198 others</a>
  </div>
</div>

When elements are rendered in a loop like this, the actual class list is only written once so there's no actual duplication problem to solve.
Using multi-cursor editing

When duplication is localized to a group of elements in a single file, the easiest way to deal with it is to use multi-cursor editing to quickly select and edit the class list for each element at once:

You'd be surprised at how often this ends up being the best solution. If you can quickly edit all of the duplicated class lists simultaneously, there's no benefit to introducing any additional abstraction.
Home
Team
Projects
Reports

<nav class="flex justify-center space-x-4">  <a href="/dashboard" class="font-bold rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900">    Home  </a>  <a href="/team" class="font-bold rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900">    Team  </a>  <a href="/projects" class="font-bold rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900">    Projects  </a>  <a href="/reports" class="font-bold rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900">    Reports  </a></nav>

Using components

If you need to reuse some styles across multiple files, the best strategy is to create a component if you're using a front-end framework like React, Svelte, or Vue, or a template partial if you're using a templating language like Blade, ERB, Twig, or Nunjucks.
Beach
Private Villa
Relaxing All-Inclusive Resort in Cancun
$299 USD per night

export function VacationCard({ img, imgAlt, eyebrow, title, pricing, url }) {
  return (
    <div>
      <img className="rounded-lg" src={img} alt={imgAlt} />
      <div className="mt-4">
        <div className="text-xs font-bold text-sky-500">{eyebrow}</div>
        <div className="mt-1 font-bold text-gray-700">
          <a href={url} className="hover:underline">
            {title}
          </a>
        </div>
        <div className="mt-2 text-sm text-gray-600">{pricing}</div>
      </div>
    </div>
  );
}

Now you can use this component in as many places as you like, while still having a single source of truth for the styles so they can easily be updated together in one place.
Using custom CSS

If you're using a templating language like ERB or Twig instead of something like React or Vue, creating a template partial for something as small as a button can feel like overkill compared to a simple CSS class like btn.

While it's highly recommended that you create proper template partials for more complex components, writing some custom CSS is totally fine when a template partial feels heavy-handed.

Here's what a btn-primary class might look like, using theme variables to keep the design consistent:
HTML

<button class="btn-primary">Save changes</button>

CSS

@import "tailwindcss";
@layer components {
  .btn-primary {
    border-radius: calc(infinity * 1px);
    background-color: var(--color-violet-500);
    padding-inline: --spacing(5);
    padding-block: --spacing(2);
    font-weight: var(--font-weight-semibold);
    color: var(--color-white);
    box-shadow: var(--shadow-md);
    &:hover {
      @media (hover: hover) {
        background-color: var(--color-violet-700);
      }
    }
  }
}

Again though, for anything that's more complicated than just a single HTML element, we highly recommend using template partials so the styles and structure can be encapsulated in one place.
Managing style conflicts
Conflicting utility classes

When you add two classes that target the same CSS property, the class that appears later in the stylesheet wins. So in this example, the element will receive display: grid even though flex comes last in the actual class attribute:
HTML

<div class="grid flex">
  <!-- ... -->
</div>

CSS

.flex {
  display: flex;
}
.grid {
  display: grid;
}

In general, you should just never add two conflicting classes to the same element — only ever add the one you actually want to take effect:
example.jsx

export function Example({ gridLayout }) {
  return <div className={gridLayout ? "grid" : "flex"}>{/* ... */}</div>;
}

Using component-based libraries like React or Vue, this often means exposing specific props for styling customizations instead of letting consumers add extra classes from outside of a component, since those styles will often conflict.
Using the important modifier

When you really need to force a specific utility class to take effect and have no other means of managing the specificity, you can add ! to the end of the class name to make all of the declarations !important:
HTML

<div class="bg-teal-500 bg-red-500!">
  <!-- ... -->
</div>

Generated CSS

.bg-red-500\! {
  background-color: var(--color-red-500) !important;
}
.bg-teal-500 {
  background-color: var(--color-teal-500);
}

Using the important flag

If you're adding Tailwind to a project that has existing complex CSS with high specificity rules, you can use the important flag when importing Tailwind to mark all utilities as !important:
app.css

@import "tailwindcss" important;

Compiled CSS

@layer utilities {
  .flex {
    display: flex !important;
  }
  .gap-4 {

    gap: 1rem !important;
  }
  .underline {
    text-decoration-line: underline !important;
  }
}

Using the prefix option

If your project has class names that conflict with Tailwind CSS utilities, you can prefix all Tailwind-generated classes and CSS variables using the prefix option:
app.css

@import "tailwindcss" prefix(tw);

Compiled CSS

@layer theme {
  :root {
    --tw-color-red-500: oklch(0.637 0.237 25.331);
  }
}
@layer utilities {
  .tw\:text-red-500 {
    color: var(--tw-color-red-500);
  }
}

Upgrade guide
Hover, focus, and other states


Core concepts
Hover, focus, and other states

Using utilities to style elements on hover, focus, and more.

Every utility class in Tailwind can be applied conditionally by adding a variant to the beginning of the class name that describes the condition you want to target.

For example, to apply the bg-sky-700 class on hover, use the hover:bg-sky-700 class:

Hover over this button to see the background color change

<button class="bg-sky-500 hover:bg-sky-700 ...">Save changes</button>

Tailwind includes variants for just about everything you'll ever need, including:

    Pseudo-classes, like :hover, :focus, :first-child, and :required
    Pseudo-elements, like ::before, ::after, ::placeholder, and ::selection
    Media and feature queries, like responsive breakpoints, dark mode, and prefers-reduced-motion
    Attribute selectors, like [dir="rtl"] and [open]
    Child selectors, like & > * and & *

These variants can even be stacked to target more specific situations, for example changing the background color in dark mode, at the medium breakpoint, on hover:

<button class="dark:md:hover:bg-fuchsia-600 ...">Save changes</button>

In this guide you'll learn about every variant available in the framework, how to use them with your own custom classes, and even how to create your own.
Pseudo-classes
:hover, :focus, and :active

Style elements on hover, focus, and active using the hover, focus, and active variants:

Try interacting with this button to see the hover, focus, and active states

<button class="bg-violet-500 hover:bg-violet-600 focus:outline-2 focus:outline-offset-2 focus:outline-violet-500 active:bg-violet-700 ...">
  Save changes
</button>

Tailwind also includes variants for other interactive states like :visited, :focus-within, :focus-visible, and more.

See the pseudo-class reference for a complete list of available pseudo-class variants.
:first, :last, :odd, and :even

Style an element when it is the first-child or last-child using the first and last variants:

    Kristen Ramos

    kristen.ramos@example.com

    Floyd Miles

    floyd.miles@example.com

    Courtney Henry

    courtney.henry@example.com

    Ted Fox

    ted.fox@example.com

<ul role="list">
  {#each people as person}
    <!-- Remove top/bottom padding when first/last child -->
    <li class="flex py-4 first:pt-0 last:pb-0">
      <img class="h-10 w-10 rounded-full" src={person.imageUrl} alt="" />
      <div class="ml-3 overflow-hidden">
        <p class="text-sm font-medium text-gray-900 dark:text-white">{person.name}</p>
        <p class="truncate text-sm text-gray-500 dark:text-gray-400">{person.email}</p>
      </div>
    </li>
  {/each}
</ul>

You can also style an element when it's an odd or even child using the odd and even variants:
Name	Title	Email
Jane Cooper	Regional Paradigm Technician	jane.cooper@example.com
Cody Fisher	Product Directives Officer	cody.fisher@example.com
Leonard Krasner	Senior Designer	leonard.krasner@example.com
Emily Selman	VP, Hardware Engineering	emily.selman@example.com
Anna Roberts	Chief Strategy Officer	anna.roberts@example.com

<table>
  <!-- ... -->
  <tbody>
    {#each people as person}
      <!-- Use different background colors for odd and even rows -->
      <tr class="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
        <td>{person.name}</td>
        <td>{person.title}</td>
        <td>{person.email}</td>
      </tr>
    {/each}
  </tbody>
</table>

Use the nth-* and nth-last-* variants to style children based on their position in the list:

<div class="nth-3:underline">
  <!-- ... -->
</div>
<div class="nth-last-5:underline">
  <!-- ... -->
</div>
<div class="nth-of-type-4:underline">
  <!-- ... -->
</div>
<div class="nth-last-of-type-6:underline">
  <!-- ... -->
</div>

You can pass any number you want to these by default, and use arbitrary values for more complex expressions like nth-[2n+1_of_li].

Tailwind also includes variants for other structural pseudo-classes like :only-child, :first-of-type, :empty, and more.

See the pseudo-class reference for a complete list of available pseudo-class variants.
:required and :disabled

Style form elements in different states using variants like required, invalid, and disabled:

Try making the email address valid to see the styles change
Username
Email
Password

<input
  type="text"
  value="tbone"
  disabled
  class="invalid:border-pink-500 invalid:text-pink-600 focus:border-sky-500 focus:outline focus:outline-sky-500 focus:invalid:border-pink-500 focus:invalid:outline-pink-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none dark:disabled:border-gray-700 dark:disabled:bg-gray-800/20 ..."
/>

Using variants for this sort of thing can reduce the amount of conditional logic in your templates, letting you use the same set of classes regardless of what state an input is in and letting the browser apply the right styles for you.

Tailwind also includes variants for other form states like :read-only, :indeterminate, :checked, and more.

See the pseudo-class reference for a complete list of available pseudo-class variants.
:has()

Use the has-* variant to style an element based on the state or content of its descendants:
Payment method
Google Pay
Apple Pay
Credit Card

<label
  class="has-checked:bg-indigo-50 has-checked:text-indigo-900 has-checked:ring-indigo-200 dark:has-checked:bg-indigo-950 dark:has-checked:text-indigo-200 dark:has-checked:ring-indigo-900 ..."
>
  <svg fill="currentColor">
    <!-- ... -->
  </svg>
  Google Pay
  <input type="radio" class="checked:border-indigo-500 ..." />
</label>

You can use has-* with a pseudo-class, like has-[:focus], to style an element based on the state of its descendants. You can also use element selectors, like has-[img] or has-[a], to style an element based on the content of its descendants.
Styling based on the descendants of a group

If you need to style an element based on the descendants of a parent element, you can mark the parent with the group class and use the group-has-* variant to style the target element:
Spencer Sharp

Product Designer at planeteria.tech
Casey Jordan

Just happy to be here.
Alex Reed

A multidisciplinary designer, working at the intersection of art and technology.

alex-reed.com
Taylor Bailey

Pushing pixels. Slinging divs.

<div class="group ...">
  <img src="..." />
  <h4>Spencer Sharp</h4>
  <svg class="hidden group-has-[a]:block ..."><!-- ... --></svg>
  <p>Product Designer at <a href="...">planeteria.tech</a></p>
</div>

Styling based on the descendants of a peer

If you need to style an element based on the descendants of a sibling element, you can mark the sibling with the peer class and use the peer-has-* variant to style the target element:
Today

<div>
  <label class="peer ...">
    <input type="checkbox" name="todo[1]" checked />
    Create a to do list
  </label>
  <svg class="peer-has-checked:hidden ..."><!-- ... --></svg>
</div>

:not()

Use the not- variant to style an element when a condition is not true.

It's particularly powerful when combined with other pseudo-class variants, for example combining not-focus: with hover: to only apply hover styles when an element is not focused:

Try focusing on the button and then hovering over it

<button class="bg-indigo-600 hover:not-focus:bg-indigo-700">
  <!-- ... -->
</button>

You can also combine the not- variant with media query variants like forced-colors or supports to only style an element when something about the user's environment is not true:

<div class="not-supports-[display:grid]:flex">
  <!-- ... -->
</div>

Styling based on parent state

When you need to style an element based on the state of some parent element, mark the parent with the group class, and use group-* variants like group-hover to style the target element:

Hover over the card to see both text elements change color
New project

Create a new project from a variety of starting templates.

<a href="#" class="group ...">
  <div>
    <svg class="stroke-sky-500 group-hover:stroke-white ..." fill="none" viewBox="0 0 24 24">
      <!-- ... -->
    </svg>
    <h3 class="text-gray-900 group-hover:text-white ...">New project</h3>
  </div>
  <p class="text-gray-500 group-hover:text-white ...">Create a new project from a variety of starting templates.</p>
</a>

This pattern works with every pseudo-class variant, for example group-focus, group-active, or even group-odd.
Differentiating nested groups

When nesting groups, you can style something based on the state of a specific parent group by giving that parent a unique group name using a group/{name} class, and including that name in variants using classes like group-hover/{name}:

    Leslie Abbott
    Co-Founder / CEO

Hector Adams
VP, Marketing
Blake Alexander
Account Coordinator

<ul role="list">
  {#each people as person}
    <li class="group/item ...">
      <!-- ... -->
      <a class="group/edit invisible group-hover/item:visible ..." href="tel:{person.phone}">
        <span class="group-hover/edit:text-gray-700 ...">Call</span>
        <svg class="group-hover/edit:translate-x-0.5 group-hover/edit:text-gray-500 ..."><!-- ... --></svg>
      </a>
    </li>
  {/each}
</ul>

Groups can be named however you like and don’t need to be configured in any way — just name your groups directly in your markup and Tailwind will automatically generate the necessary CSS.
Arbitrary groups

You can create one-off group-* variants on the fly by providing your own selector as an arbitrary value between square brackets:

<div class="group is-published">
  <div class="hidden group-[.is-published]:block">
    Published
  </div>
</div>

For more control, you can use the & character to mark where .group should end up in the final selector relative to the selector you are passing in:

<div class="group">
  <div class="group-[:nth-of-type(3)_&]:block">
    <!-- ... -->
  </div>
</div>

Implicit groups

The in-* variant works similarly to group except you don't need to add group to the parent element:

<div tabindex="0" class="group">
  <div class="opacity-50 group-focus:opacity-100">
<div tabindex="0">
  <div class="opacity-50 in-focus:opacity-100">
    <!-- ... -->
  </div>
</div>

The in-* variant responds to state changes in any parent, so if you want more fine-grained control you'll need to use group instead.
Styling based on sibling state

When you need to style an element based on the state of a sibling element, mark the sibling with the peer class, and use peer-* variants like peer-invalid to style the target element:

Try making the email address valid to see the warning disappear
Email

Please provide a valid email address.

<form>
  <label class="block">
    <span class="...">Email</span>
    <input type="email" class="peer ..." />
    <p class="invisible peer-invalid:visible ...">Please provide a valid email address.</p>
  </label>
</form>

This makes it possible to do all sorts of neat tricks, like floating labels for example without any JS.

This pattern works with every pseudo-class variant, for example peer-focus, peer-required, and peer-disabled.

It's important to note that the peer marker can only be used on previous siblings because of how the subsequent-sibling combinator works in CSS:

Won't work, only previous siblings can be marked as peers

<label>
  <span class="peer-invalid:text-red-500 ...">Email</span>
  <input type="email" class="peer ..." />
</label>

Differentiating peers

When using multiple peers, you can style something on the state of a specific peer by giving that peer a unique name using a peer/{name} class, and including that name in variants using classes like peer-checked/{name}:
Published status
DraftPublished
Drafts are only visible to administrators.

<fieldset>
  <legend>Published status</legend>
  <input id="draft" class="peer/draft" type="radio" name="status" checked />
  <label for="draft" class="peer-checked/draft:text-sky-500">Draft</label>
  <input id="published" class="peer/published" type="radio" name="status" />
  <label for="published" class="peer-checked/published:text-sky-500">Published</label>
  <div class="hidden peer-checked/draft:block">Drafts are only visible to administrators.</div>
  <div class="hidden peer-checked/published:block">Your post will be publicly visible on your site.</div>
</fieldset>

Peers can be named however you like and don’t need to be configured in any way — just name your peers directly in your markup and Tailwind will automatically generate the necessary CSS.
Arbitrary peers

You can create one-off peer-* variants on the fly by providing your own selector as an arbitrary value between square brackets:

<form>
  <label for="email">Email:</label>
  <input id="email" name="email" type="email" class="is-dirty peer" required />
  <div class="peer-[.is-dirty]:peer-required:block hidden">This field is required.</div>
  <!-- ... -->
</form>

For more control, you can use the & character to mark where .peer should end up in the final selector relative to the selector you are passing in:

<div>
  <input type="text" class="peer" />
  <div class="hidden peer-[:nth-of-type(3)_&]:block">
    <!-- ... -->
  </div>
</div>

Pseudo-elements
::before and ::after

Style the ::before and ::after pseudo-elements using the before and after variants:
Email

<label>
  <span class="text-gray-700 after:ml-0.5 after:text-red-500 after:content-['*'] ...">Email</span>
  <input type="email" name="email" class="..." placeholder="you@example.com" />
</label>

When using these variants, Tailwind will automatically add content: '' by default so you don't have to specify it unless you want a different value:

    When you look annoyed all the time, people think that you're busy.

<blockquote class="text-center text-2xl font-semibold text-gray-900 italic dark:text-white">
  When you look
  <span class="relative inline-block before:absolute before:-inset-1 before:block before:-skew-y-3 before:bg-pink-500">
    <span class="relative text-white dark:text-gray-950">annoyed</span>
  </span>
  all the time, people think that you're busy.
</blockquote>

It's worth noting that you don't really need ::before and ::after pseudo-elements for most things in Tailwind projects — it's usually simpler to just use a real HTML element.

For example, here's the same design from above but using a <span> instead of the ::before pseudo-element, which is a little easier to read and is actually less code:

<blockquote class="text-center text-2xl font-semibold text-gray-900 italic">
  When you look
  <span class="relative">
    <span class="absolute -inset-1 block -skew-y-3 bg-pink-500" aria-hidden="true"></span>
    <span class="relative text-white">annoyed</span>
  </span>
  all the time, people think that you're busy.
</blockquote>

Save before and after for situations where it's important that the content of the pseudo-element is not actually in the DOM and can't be selected by the user.
::placeholder

Style the placeholder text of any input or textarea using the placeholder variant:
Search

<input
  class="placeholder:text-gray-500 placeholder:italic ..."
  placeholder="Search for anything..."
  type="text"
  name="search"
/>

::file

Style the button in file inputs using the file variant:
Current profile photo
Choose profile photo

<input
  type="file"
  class="file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100 dark:file:bg-violet-600 dark:file:text-violet-100 dark:hover:file:bg-violet-500 ..."
/>

::marker

Style the counters or bullets in lists using the marker variant:
Ingredients

    5 cups chopped Porcini mushrooms
    1/2 cup of olive oil
    3lb of celery

<ul role="list" class="list-disc marker:text-sky-400 ...">
  <li>5 cups chopped Porcini mushrooms</li>
  <li>1/2 cup of olive oil</li>
  <li>3lb of celery</li>
</ul>

We've designed the marker variant to be inheritable, so although you can use it directly on an <li> element, you can also use it on a parent to avoid repeating yourself.
::selection

Style the active text selection using the selection variant:

Try selecting some of this text with your mouse

So I started to walk into the water. I won't lie to you boys, I was terrified. But I pressed on, and as I made my way past the breakers a strange calm came over me. I don't know if it was divine intervention or the kinship of all living things but I tell you Jerry at that moment, I was a marine biologist.

<div class="selection:bg-fuchsia-300 selection:text-fuchsia-900">
  <p>
    So I started to walk into the water. I won't lie to you boys, I was terrified. But I pressed on, and as I made my
    way past the breakers a strange calm came over me. I don't know if it was divine intervention or the kinship of all
    living things but I tell you Jerry at that moment, I <em>was</em> a marine biologist.
  </p>
</div>

We've designed the selection variant to be inheritable, so you can add it anywhere in the tree and it will be applied to all descendant elements.

This makes it easy to set the selection color to match your brand across your entire site:

<html>
  <head>
    <!-- ... -->
  </head>
  <body class="selection:bg-pink-300">
    <!-- ... -->
  </body>
</html>

::first-line and ::first-letter

Style the first line in a block of content using the first-line variant, and the first letter using the first-letter variant:

Well, let me tell you something, funny boy. Y'know that little stamp, the one that says "New York Public Library"? Well that may not mean anything to you, but that means a lot to me. One whole hell of a lot.

Sure, go ahead, laugh if you want to. I've seen your type before: Flashy, making the scene, flaunting convention. Yeah, I know what you're thinking. What's this guy making such a big stink about old library books? Well, let me give you a hint, junior.

<div class="text-gray-700">
  <p
    class="first-letter:float-left first-letter:mr-3 first-letter:text-7xl first-letter:font-bold first-letter:text-gray-900 first-line:tracking-widest first-line:uppercase"
  >
    Well, let me tell you something, funny boy. Y'know that little stamp, the one that says "New York Public Library"?
  </p>
  <p class="mt-6">Well that may not mean anything to you, but that means a lot to me. One whole hell of a lot.</p>
</div>

::backdrop

Style the backdrop of a native <dialog> element using the backdrop variant:

<dialog class="backdrop:bg-gray-50">
  <form method="dialog">
    <!-- ... -->
  </form>
</dialog>

If you're using native <dialog> elements in your project, you may also want to read about styling open/closed states using the open variant.
Media and feature queries
Responsive breakpoints

To style an element at a specific breakpoint, use responsive variants like md and lg.

For example, this will render a 3-column grid on mobile, a 4-column grid on medium-width screens, and a 6-column grid on large-width screens:

<div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
  <!-- ... -->
</div>

To style an element based on the width of a parent element instead of the viewport, use variants like @md and @lg:

<div class="@container">
  <div class="flex flex-col @md:flex-row">
    <!-- ... -->
  </div>
</div>

Check out the Responsive design documentation for an in-depth look at how these features work.
prefers-color-scheme

The prefers-color-scheme media query tells you whether the user prefers a light theme or dark theme, and is usually configured at the operating system level.

Use utilities with no variant to target light mode, and use the dark variant to provide overrides for dark mode:

Light mode
Writes upside-down

The Zero Gravity Pen can be used to write in any orientation, including upside-down. It even works in outer space.

Dark mode
Writes upside-down

The Zero Gravity Pen can be used to write in any orientation, including upside-down. It even works in outer space.

<div class="bg-white dark:bg-gray-900 ...">
  <!-- ... -->
  <h3 class="text-gray-900 dark:text-white ...">Writes upside-down</h3>
  <p class="text-gray-500 dark:text-gray-400 ...">
    The Zero Gravity Pen can be used to write in any orientation, including upside-down. It even works in outer space.
  </p>
</div>

Check out the Dark Mode documentation for an in-depth look at how this feature works.
prefers-reduced-motion

The prefers-reduced-motion media query tells you if the user has requested that you minimize non-essential motion.

Use the motion-reduce variant to conditionally add styles when the user has requested reduced motion:

Try emulating `prefers-reduced-motion: reduce` in your developer tools to hide the spinner

<button type="button" class="bg-indigo-500 ..." disabled>
  <svg class="animate-spin motion-reduce:hidden ..." viewBox="0 0 24 24"><!-- ... --></svg>
  Processing...
</button>

Tailwind also includes a motion-safe variant that only adds styles when the user has not requested reduced motion. This can be useful when using the motion-reduce helper would mean having to "undo" a lot of styles:

<!-- Using `motion-reduce` can mean lots of "undoing" styles -->
<button class="transition hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ...">
  Save changes
</button>
<!-- Using `motion-safe` is less code in these situations -->
<button class="motion-safe:transition motion-safe:hover:-translate-x-0.5 ...">Save changes</button>

prefers-contrast

The prefers-contrast media query tells you if the user has requested more or less contrast.

Use the contrast-more variant to conditionally add styles when the user has requested more contrast:

Try emulating `prefers-contrast: more` in your developer tools to see the changes
Social Security Number

We need this to steal your identity.

<label class="block">
  <span class="block text-sm font-medium text-gray-700">Social Security Number</span>
  <input
    class="border-gray-200 placeholder-gray-400 contrast-more:border-gray-400 contrast-more:placeholder-gray-500 ..."
  />
  <p class="text-gray-600 opacity-10 contrast-more:opacity-100 ...">We need this to steal your identity.</p>
</label>

Tailwind also includes a contrast-less variant you can use to conditionally add styles when the user has requested less contrast.
forced-colors

The forced-colors media query indicates if the user is using a forced colors mode. These modes override your site's colors with a user defined palette for text, backgrounds, links and buttons.

Use the forced-colors variant to conditionally add styles when the user has enabled a forced color mode:

Try emulating `forced-colors: active` in your developer tools to see the changes
Choose a theme:

<label>
  <input type="radio" class="appearance-none forced-colors:appearance-auto" />
  <p class="hidden forced-colors:block">Cyan</p>
  <div class="bg-cyan-200 forced-colors:hidden ..."></div>
  <div class="bg-cyan-500 forced-colors:hidden ..."></div>
</label>

Use the not-forced-colors variant to apply styles based when the user is not using a forced colors mode:

<div class="not-forced-colors:appearance-none ...">
  <!-- ... -->
</div>

Tailwind also includes a forced color adjust utilities to opt in and out of forced colors.
inverted-colors

Use the inverted-colors variant to conditionally add styles when the user has enabled an inverted color scheme:

<div class="shadow-xl inverted-colors:shadow-none ...">
  <!-- ... -->
</div>

pointer and any-pointer

The pointer media query tells you whether the user has a primary pointing device, like a mouse, and the accuracy of that pointing device.

Use the pointer-fine variant to target an accurate pointing device, like a mouse or trackpad, or the pointer-coarse variant to target a less accurate pointing device, like a touchscreen, which can be useful for providing larger click targets on touch devices:

Try emulating a touch device in your developer tools to see the changes
RAM
See performance specs
4 GB
8 GB
16 GB
32 GB
64 GB
128 GB

<fieldset aria-label="Choose a memory option">
  <div class="flex items-center justify-between">
    <div>RAM</div>
    <a href="#"> See performance specs </a>
  </div>
  <div class="mt-4 grid grid-cols-6 gap-2 pointer-coarse:mt-6 pointer-coarse:grid-cols-3 pointer-coarse:gap-4">
    <label class="p-2 pointer-coarse:p-4 ...">
      <input type="radio" name="memory-option" value="4 GB" className="sr-only" />
      <span>4 GB</span>
    </label>
    <!-- ... -->
  </div>
</fieldset>

While pointeronly targets the primary pointing device, any-pointer is used to target any of the pointing devices that might be available. Use the any-pointer-fine and any-pointer-coarse variants to provide different styles if at least one connected pointing device meets the criteria.

You can use pointer-none and any-pointer-none to target the absence of a pointing device.
orientation

Use the portrait and landscape variants to conditionally add styles when the viewport is in a specific orientation:

<div>
  <div class="portrait:hidden">
    <!-- ... -->
  </div>
  <div class="landscape:hidden">
    <p>This experience is designed to be viewed in landscape. Please rotate your device to view the site.</p>
  </div>
</div>

scripting

Use the noscript variant to conditionally add styles based on whether the user has scripting, such as JavaScript, enabled:

<div class="hidden noscript:block">
  <p>This experience requires JavaScript to function. Please enable JavaScript in your browser settings.</p>
</div>

print

Use the print variant to conditionally add styles that only apply when the document is being printed:

<div>
  <article class="print:hidden">
    <h1>My Secret Pizza Recipe</h1>
    <p>This recipe is a secret, and must not be shared with anyone</p>
    <!-- ... -->
  </article>
  <div class="hidden print:block">Are you seriously trying to print this? It's secret!</div>
</div>

@supports

Use the supports-[...] variant to style things based on whether a certain feature is supported in the user's browser:

<div class="flex supports-[display:grid]:grid ...">
  <!-- ... -->
</div>

Under the hood the supports-[...] variant generates @supports rules and takes anything you’d use with @supports (...) between the square brackets, like a property/value pair, and even expressions using and and or.

For terseness, if you only need to check if a property is supported (and not a specific value), you can just specify the property name:

<div class="bg-black/75 supports-backdrop-filter:bg-black/25 supports-backdrop-filter:backdrop-blur ...">
  <!-- ... -->
</div>

Use the not-supports-[...] variant to style things based on whether a certain feature is not supported in the user's browser:

<div class="not-supports-[display:grid]:flex">
  <!-- ... -->
</div>

You can configure shortcuts for common @supports rules you're using in your project by creating a new variant in the supports-* namespace:

@custom-variant supports-grid {
  @supports (display: grid) {
    @slot;
  }
}

You can then use these custom supports-* variants in your project:

<div class="supports-grid:grid">
  <!-- ... -->
</div>

@starting-style

Use the starting variant to set the appearance of an element when it is first rendered in the DOM, or transitions from display: none to visible:

<div>
  <button popovertarget="my-popover">Check for updates</button>
  <div popover id="my-popover" class="opacity-0 starting:open:opacity-0 ...">
    <!-- ... -->
  </div>
</div>

Attribute selectors
ARIA states

Use the aria-* variant to conditionally style things based on ARIA attributes.

For example, to apply the bg-sky-700 class when the aria-checked attribute is set to true, use the aria-checked:bg-sky-700 class:

<div aria-checked="true" class="bg-gray-600 aria-checked:bg-sky-700">
  <!-- ... -->
</div>

By default we've included variants for the most common boolean ARIA attributes:
Variant	CSS
aria-busy	&[aria-busy="true"]
aria-checked	&[aria-checked="true"]
aria-disabled	&[aria-disabled="true"]
aria-expanded	&[aria-expanded="true"]
aria-hidden	&[aria-hidden="true"]
aria-pressed	&[aria-pressed="true"]
aria-readonly	&[aria-readonly="true"]
aria-required	&[aria-required="true"]
aria-selected	&[aria-selected="true"]

You can customize which aria-* variants are available by creating a new variant:

@custom-variant aria-asc (&[aria-sort="ascending"]);
@custom-variant aria-desc (&[aria-sort="descending"]);

If you need to use a one-off aria variant that doesn’t make sense to include in your project, or for more complex ARIA attributes that take specific values, use square brackets to generate a property on the fly using any arbitrary value:
Invoice #
Client	Amount
#100	Pendant Publishing	$2,000.00
#101	Kruger Industrial Smoothing	$545.00
#102	J. Peterman	$10,000.25

<table>
  <thead>
    <tr>
      <th
        aria-sort="ascending"
        class="aria-[sort=ascending]:bg-[url('/img/down-arrow.svg')] aria-[sort=descending]:bg-[url('/img/up-arrow.svg')]"
      >
        Invoice #
      </th>
      <!-- ... -->
    </tr>
  </thead>
  <!-- ... -->
</table>

ARIA state variants can also target parent and sibling elements using the group-aria-* and peer-aria-* variants:

<table>
  <thead>
    <tr>
    <th aria-sort="ascending" class="group">
      Invoice #
      <svg class="group-aria-[sort=ascending]:rotate-0 group-aria-[sort=descending]:rotate-180"><!-- ... --></svg>
    </th>
    <!-- ... -->
    </tr>
  </thead>
  <!-- ... -->
</table>

Data attributes

Use the data-* variant to conditionally apply styles based on data attributes.

To check if a data attribute exists (and not a specific value), you can just specify the attribute name:

<!-- Will apply -->
<div data-active class="border border-gray-300 data-active:border-purple-500">
  <!-- ... -->
</div>
<!-- Will not apply -->
<div class="border border-gray-300 data-active:border-purple-500">
  <!-- ... -->
</div>

If you need to check for a specific value you may use an arbitrary value:

<!-- Will apply -->
<div data-size="large" class="data-[size=large]:p-8">
  <!-- ... -->
</div>
<!-- Will not apply -->
<div data-size="medium" class="data-[size=large]:p-8">
  <!-- ... -->
</div>

Alternatively, you can configure shortcuts for common data attributes you're using in your project by creating a new variant in the data-* namespace:
app.css

@import "tailwindcss";
@custom-variant data-checked (&[data-ui~="checked"]);

You can then use these custom data-* variants in your project:

<div data-ui="checked active" class="data-checked:underline">
  <!-- ... -->
</div>

RTL support

Use the rtl and ltr variants to conditionally add styles in right-to-left and left-to-right modes respectively when building multi-directional layouts:

Left-to-right

Tom Cook

Director of Operations

Right-to-left

تامر كرم

الرئيس التنفيذي

<div class="group flex items-center">
  <img class="h-12 w-12 shrink-0 rounded-full" src="..." alt="" />
  <div class="ltr:ml-3 rtl:mr-3">
    <p class="text-gray-700 group-hover:text-gray-900 ...">...</p>
    <p class="text-gray-500 group-hover:text-gray-700 ...">...</p>
  </div>
</div>

Remember, these variants are only useful if you are building a site that needs to support both left-to-right and right-to-left layouts. If you're building a site that only needs to support a single direction, you don't need these variants — just apply the styles that make sense for your content.
Open/closed state

Use the open variant to conditionally add styles when a <details> or <dialog> element is in an open state:

Try toggling the disclosure to see the styles change

The mug is round. The jar is round. They should call it Roundtine.

<details class="border border-transparent open:border-black/10 open:bg-gray-100 ..." open>
  <summary class="text-sm leading-6 font-semibold text-gray-900 select-none">Why do they call it Ovaltine?</summary>
  <div class="mt-3 text-sm leading-6 text-gray-600">
    <p>The mug is round. The jar is round. They should call it Roundtine.</p>
  </div>
</details>

This variant also targets the :popover-open pseudo-class for popovers:

<div>
  <button popovertarget="my-popover">Open Popover</button>
  <div popover id="my-popover" class="opacity-0 open:opacity-100 ...">
    <!-- ... -->
  </div>
</div>

Styling inert elements

The inert variant lets you style elements marked with the inert attribute:
Notification preferences
Custom
Everything

<form>
  <legend>Notification preferences</legend>
  <fieldset>
    <input type="radio" />
    <label> Custom </label>
    <fieldset inert class="inert:opacity-50">
      <!-- ... -->
    </fieldset>
    <input type="radio" />
    <label> Everything </label>
  </fieldset>
</form>

This is useful for adding visual cues that make it clear that sections of content aren't interactive.
Child selectors
Styling direct children

While it's generally preferable to put utility classes directly on child elements, you can use the * variant in situations where you need to style direct children that you don’t have control over:
Categories
Sales
Marketing
SEO
Analytics
Design
Strategy
Security
Growth
Mobile
UX/UI

<div>
  <h2>Categories<h2>
  <ul class="*:rounded-full *:border *:border-sky-100 *:bg-sky-50 *:px-2 *:py-0.5 dark:text-sky-300 dark:*:border-sky-500/15 dark:*:bg-sky-500/10 ...">
    <li>Sales</li>
    <li>Marketing</li>
    <li>SEO</li>
    <!-- ... -->
  </ul>
</div>

It's important to note that overriding a style with a utility directly on the child itself won't work due to the specificity of the generated child selector:

Won't work, children can't override their own styling.

<ul class="*:bg-sky-50 ...">
  <li class="bg-red-50 ...">Sales</li>
  <li>Marketing</li>
  <li>SEO</li>
  <!-- ... -->
</ul>

Styling all descendants

Like *, the ** variant can be used to style children of an element. The main difference is that ** will apply styles to all descendants, not just the direct children. This is especially useful when you combine it with another variant for narrowing the thing you're selecting:

    Leslie Abbott
    Co-Founder / CEO
    Hector Adams
    VP, Marketing
    Blake Alexander
    Account Coordinator

<ul class="**:data-avatar:size-12 **:data-avatar:rounded-full ...">
  {#each items as item}
    <li>
      <img src={item.src} data-avatar />
      <p>{item.name}</p>
    </li>
  {/each}
</ul>

Custom variants
Using arbitrary variants

Just like arbitrary values let you use custom values with your utility classes, arbitrary variants let you write custom selector variants directly in your HTML.

Arbitrary variants are just format strings that represent the selector, wrapped in square brackets. For example, this arbitrary variant changes the cursor to grabbing when the element has the is-dragging class:

<ul role="list">
  {#each items as item}
    <li class="[&.is-dragging]:cursor-grabbing">{item}</li>
  {/each}
</ul>

Arbitrary variants can be stacked with built-in variants or with each other, just like the rest of the variants in Tailwind:

<ul role="list">
  {#each items as item}
    <li class="[&.is-dragging]:active:cursor-grabbing">{item}</li>
  {/each}
</ul>

If you need spaces in your selector, you can use an underscore. For example, this arbitrary variant selects all p elements within the element where you've added the class:

<div class="[&_p]:mt-4">
  <p>Lorem ipsum...</p>
  <ul>
    <li>
      <p>Lorem ipsum...</p>
    </li>
    <!-- ... -->
  </ul>
</div>

You can also use at-rules like @media or @supports in arbitrary variants:

<div class="flex [@supports(display:grid)]:grid">
  <!-- ... -->
</div>

With at-rule custom variants the & placeholder isn't necessary, just like when nesting with a preprocessor.
Registering a custom variant

If you find yourself using the same arbitrary variant multiple times in your project, it might be worth creating a custom variant using the @custom-variant directive:

@custom-variant theme-midnight (&:where([data-theme="midnight"] *));

Now you can use the theme-midnight:<utility> variant in your HTML:

<html data-theme="midnight">
  <button class="theme-midnight:bg-black ..."></button>
</html>

Learn more about adding custom variants in the adding custom variants documentation.
Appendix
Quick reference

A quick reference table of every single variant included in Tailwind by default.
Variant	CSS
hover	@media (hover: hover) { &:hover }
focus	&:focus
focus-within	&:focus-within
focus-visible	&:focus-visible
active	&:active
visited	&:visited
target	&:target
*	:is(& > *)
**	:is(& *)
has-[...]	&:has(...)
group-[...]	&:is(:where(.group)... *)
peer-[...]	&:is(:where(.peer)... ~ *)
in-[...]	:where(...) &
not-[...]	&:not(...)
inert	&:is([inert], [inert] *)
first	&:first-child
last	&:last-child
only	&:only-child
odd	&:nth-child(odd)
even	&:nth-child(even)
first-of-type	&:first-of-type
last-of-type	&:last-of-type
only-of-type	&:only-of-type
nth-[...]	&:nth-child(...)
nth-last-[...]	&:nth-last-child(...)
nth-of-type-[...]	&:nth-of-type(...)
nth-last-of-type-[...]	&:nth-last-of-type(...)
empty	&:empty
disabled	&:disabled
enabled	&:enabled
checked	&:checked
indeterminate	&:indeterminate
default	&:default
optional	&:optional
required	&:required
valid	&:valid
invalid	&:invalid
user-valid	&:user-valid
user-invalid	&:user-invalid
in-range	&:in-range
out-of-range	&:out-of-range
placeholder-shown	&:placeholder-shown
details-content	&:details-content
autofill	&:autofill
read-only	&:read-only
before	&::before
after	&::after
first-letter	&::first-letter
first-line	&::first-line
marker	&::marker, & *::marker
selection	&::selection
file	&::file-selector-button
backdrop	&::backdrop
placeholder	&::placeholder
sm	@media (width >= 40rem)
md	@media (width >= 48rem)
lg	@media (width >= 64rem)
xl	@media (width >= 80rem)
2xl	@media (width >= 96rem)
min-[...]	@media (width >= ...)
max-sm	@media (width < 40rem)
max-md	@media (width < 48rem)
max-lg	@media (width < 64rem)
max-xl	@media (width < 80rem)
max-2xl	@media (width < 96rem)
max-[...]	@media (width < ...)
@3xs	@container (width >= 16rem)
@2xs	@container (width >= 18rem)
@xs	@container (width >= 20rem)
@sm	@container (width >= 24rem)
@md	@container (width >= 28rem)
@lg	@container (width >= 32rem)
@xl	@container (width >= 36rem)
@2xl	@container (width >= 42rem)
@3xl	@container (width >= 48rem)
@4xl	@container (width >= 56rem)
@5xl	@container (width >= 64rem)
@6xl	@container (width >= 72rem)
@7xl	@container (width >= 80rem)
@min-[...]	@container (width >= ...)
@max-3xs	@container (width < 16rem)
@max-2xs	@container (width < 18rem)
@max-xs	@container (width < 20rem)
@max-sm	@container (width < 24rem)
@max-md	@container (width < 28rem)
@max-lg	@container (width < 32rem)
@max-xl	@container (width < 36rem)
@max-2xl	@container (width < 42rem)
@max-3xl	@container (width < 48rem)
@max-4xl	@container (width < 56rem)
@max-5xl	@container (width < 64rem)
@max-6xl	@container (width < 72rem)
@max-7xl	@container (width < 80rem)
@max-[...]	@container (width < ...)
dark	@media (prefers-color-scheme: dark)
motion-safe	@media (prefers-reduced-motion: no-preference)
motion-reduce	@media (prefers-reduced-motion: reduce)
contrast-more	@media (prefers-contrast: more)
contrast-less	@media (prefers-contrast: less)
forced-colors	@media (forced-colors: active)
inverted-colors	@media (inverted-colors: inverted)
pointer-fine	@media (pointer: fine)
pointer-coarse	@media (pointer: coarse)
pointer-none	@media (pointer: none)
any-pointer-fine	@media (any-pointer: fine)
any-pointer-coarse	@media (any-pointer: coarse)
any-pointer-none	@media (any-pointer: none)
portrait	@media (orientation: portrait)
landscape	@media (orientation: landscape)
noscript	@media (scripting: none)
print	@media print
supports-[…]	@supports (…)
aria-busy	&[aria-busy="true"]
aria-checked	&[aria-checked="true"]
aria-disabled	&[aria-disabled="true"]
aria-expanded	&[aria-expanded="true"]
aria-hidden	&[aria-hidden="true"]
aria-pressed	&[aria-pressed="true"]
aria-readonly	&[aria-readonly="true"]
aria-required	&[aria-required="true"]
aria-selected	&[aria-selected="true"]
aria-[…]	&[aria-…]
data-[…]	&[data-…]
rtl	&:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *)
ltr	&:where(:dir(ltr), [dir="ltr"], [dir="ltr"] *)
open	&:is([open], :popover-open, :open)
starting	@starting-style
Pseudo-class reference

This is a comprehensive list of examples for all the pseudo-class variants included in Tailwind to complement the pseudo-classes documentation at the beginning of this guide.
:hover

Style an element when the user hovers over it with the mouse cursor using the hover variant:

<div class="bg-black hover:bg-white ...">
  <!-- ... -->
</div>

:focus

Style an element when it has focus using the focus variant:

<input class="border-gray-300 focus:border-blue-400 ..." />

:focus-within

Style an element when it or one of its descendants has focus using the focus-within variant:

<div class="focus-within:shadow-lg ...">
  <input type="text" />
</div>

:focus-visible

Style an element when it has been focused using the keyboard using the focus-visible variant:

<button class="focus-visible:outline-2 ...">Submit</button>

:active

Style an element when it is being pressed using the active variant:

<button class="bg-blue-500 active:bg-blue-600 ...">Submit</button>

:visited

Style a link when it has already been visited using the visited variant:

<a href="https://seinfeldquotes.com" class="text-blue-600 visited:text-purple-600 ..."> Inspiration </a>

:target

Style an element if its ID matches the current URL fragment using the target variant:

<div id="about" class="target:shadow-lg ...">
  <!-- ... -->
</div>

:first-child

Style an element if it's the first child using the first variant:

<ul>
  {#each people as person}
    <li class="py-4 first:pt-0 ...">
      <!-- ... -->
    </li>
  {/each}
</ul>

:last-child

Style an element if it's the last child using the last variant:

<ul>
  {#each people as person}
    <li class="py-4 last:pb-0 ...">
      <!-- ... -->
    </li>
  {/each}
</ul>

:only-child

Style an element if it's the only child using the only variant:

<ul>
  {#each people as person}
    <li class="py-4 only:py-0 ...">
      <!-- ... -->
    </li>
  {/each}
</ul>

:nth-child(odd)

Style an element if it's an oddly numbered child using the odd variant:

<table>
  {#each people as person}
    <tr class="bg-white odd:bg-gray-100 ...">
      <!-- ... -->
    </tr>
  {/each}
</table>

:nth-child(even)

Style an element if it's an evenly numbered child using the even variant:

<table>
  {#each people as person}
    <tr class="bg-white even:bg-gray-100 ...">
      <!-- ... -->
    </tr>
  {/each}
</table>

:first-of-type

Style an element if it's the first child of its type using the first-of-type variant:

<nav>
  <img src="/logo.svg" alt="Vandelay Industries" />
  {#each links as link}
    <a href="#" class="ml-2 first-of-type:ml-6 ...">
      <!-- ... -->
    </a>
  {/each}
</nav>

:last-of-type

Style an element if it's the last child of its type using the last-of-type variant:

<nav>
  <img src="/logo.svg" alt="Vandelay Industries" />
  {#each links as link}
    <a href="#" class="mr-2 last-of-type:mr-6 ...">
      <!-- ... -->
    </a>
  {/each}
  <button>More</button>
</nav>

:only-of-type

Style an element if it's the only child of its type using the only-of-type variant:

<nav>
  <img src="/logo.svg" alt="Vandelay Industries" />
  {#each links as link}
    <a href="#" class="mx-2 only-of-type:mx-6 ...">
      <!-- ... -->
    </a>
  {/each}
  <button>More</button>
</nav>

:nth-child()

Style an element at a specific position using the nth variant:

<nav>
  <img src="/logo.svg" alt="Vandelay Industries" />
  {#each links as link}
    <a href="#" class="mx-2 nth-3:mx-6 nth-[3n+1]:mx-7 ...">
      <!-- ... -->
    </a>
  {/each}
  <button>More</button>
</nav>

:nth-last-child()

Style an element at a specific position from the end using the nth-last variant:

<nav>
  <img src="/logo.svg" alt="Vandelay Industries" />
  {#each links as link}
    <a href="#" class="mx-2 nth-last-3:mx-6 nth-last-[3n+1]:mx-7 ...">
      <!-- ... -->
    </a>
  {/each}
  <button>More</button>
</nav>

:nth-of-type()

Style an element at a specific position, of the same type using the nth-of-type variant:

<nav>
  <img src="/logo.svg" alt="Vandelay Industries" />
  {#each links as link}
    <a href="#" class="mx-2 nth-of-type-3:mx-6 nth-of-type-[3n+1]:mx-7 ...">
      <!-- ... -->
    </a>
  {/each}
  <button>More</button>
</nav>

:nth-last-of-type()

Style an element at a specific position from the end, of the same type using the nth-last-of-type variant:

<nav>
  <img src="/logo.svg" alt="Vandelay Industries" />
  {#each links as link}
    <a href="#" class="mx-2 nth-last-of-type-3:mx-6 nth-last-of-type-[3n+1]:mx-7 ...">
      <!-- ... -->
    </a>
  {/each}
  <button>More</button>
</nav>

:empty

Style an element if it has no content using the empty variant:

<ul>
  {#each people as person}
    <li class="empty:hidden ...">{person.hobby}</li>
  {/each}
</ul>

:disabled

Style an input when it's disabled using the disabled variant:

<input class="disabled:opacity-75 ..." />

:enabled

Style an input when it's enabled using the enabled variant, most helpful when you only want to apply another style when an element is not disabled:

<input class="enabled:hover:border-gray-400 disabled:opacity-75 ..." />

:checked

Style a checkbox or radio button when it's checked using the checked variant:

<input type="checkbox" class="appearance-none checked:bg-blue-500 ..." />

:indeterminate

Style a checkbox or radio button in an indeterminate state using the indeterminate variant:

<input type="checkbox" class="appearance-none indeterminate:bg-gray-300 ..." />

:default

Style an option, checkbox or radio button that was the default value when the page initially loaded using the default variant:

<input type="checkbox" class="default:outline-2 ..." />

:optional

Style an input when it's optional using the optional variant:

<input class="border optional:border-red-500 ..." />

:required

Style an input when it's required using the required variant:

<input required class="border required:border-red-500 ..." />

:valid

Style an input when it's valid using the valid variant:

<input required class="border valid:border-green-500 ..." />

:invalid

Style an input when it's invalid using the invalid variant:

<input required class="border invalid:border-red-500 ..." />

:user-valid

Style an input when it's valid and the user has interacted with it, using the user-valid variant:

<input required class="border user-valid:border-green-500" />

:user-invalid

Style an input when it's invalid and the user has interacted with it, using the user-invalid variant:

<input required class="border user-invalid:border-red-500" />

:in-range

Style an input when its value is within a specified range limit using the in-range variant:

<input min="1" max="5" class="in-range:border-green-500 ..." />

:out-of-range

Style an input when its value is outside of a specified range limit using the out-of-range variant:

<input min="1" max="5" class="out-of-range:border-red-500 ..." />

:placeholder-shown

Style an input when the placeholder is shown using the placeholder-shown variant:

<input class="placeholder-shown:border-gray-500 ..." placeholder="you@example.com" />

:details-content

Style the content of a <details> element using the details-content variant:

<details class="details-content:bg-gray-100 ...">
  <summary>Details</summary>
  This is a secret.
</details>

:autofill

Style an input when it has been autofilled by the browser using the autofill variant:

<input class="autofill:bg-yellow-200 ..." />

:read-only

Style an input when it is read-only using the read-only variant:

<input class="read-only:bg-gray-100 ..." />

Styling with utility classes
Responsive design

Responsive design

Using responsive utility variants to build adaptive user interfaces.
Overview

Every utility class in Tailwind can be applied conditionally at different breakpoints, which makes it a piece of cake to build complex responsive interfaces without ever leaving your HTML.

First, make sure you've added the viewport meta tag to the <head> of your document:
index.html

<meta name="viewport" content="width=device-width, initial-scale=1.0" />

Then to add a utility but only have it take effect at a certain breakpoint, all you need to do is prefix the utility with the breakpoint name, followed by the : character:
HTML

<!-- Width of 16 by default, 32 on medium screens, and 48 on large screens -->
<img class="w-16 md:w-32 lg:w-48" src="..." />

There are five breakpoints by default, inspired by common device resolutions:
Breakpoint prefix	Minimum width	CSS
sm	40rem (640px)	@media (width >= 40rem) { ... }
md	48rem (768px)	@media (width >= 48rem) { ... }
lg	64rem (1024px)	@media (width >= 64rem) { ... }
xl	80rem (1280px)	@media (width >= 80rem) { ... }
2xl	96rem (1536px)	@media (width >= 96rem) { ... }

This works for every utility class in the framework, which means you can change literally anything at a given breakpoint — even things like letter spacing or cursor styles.

Here's a simple example of a marketing page component that uses a stacked layout on small screens, and a side-by-side layout on larger screens:

<div class="mx-auto max-w-md overflow-hidden rounded-xl bg-white shadow-md md:max-w-2xl">
  <div class="md:flex">
    <div class="md:shrink-0">
      <img
        class="h-48 w-full object-cover md:h-full md:w-48"
        src="/img/building.jpg"
        alt="Modern building architecture"
      />
    </div>
    <div class="p-8">
      <div class="text-sm font-semibold tracking-wide text-indigo-500 uppercase">Company retreats</div>
      <a href="#" class="mt-1 block text-lg leading-tight font-medium text-black hover:underline">
        Incredible accommodation for your team
      </a>
      <p class="mt-2 text-gray-500">
        Looking to take your team away on a retreat to enjoy awesome food and take in some sunshine? We have a list of
        places to do just that.
      </p>
    </div>
  </div>
</div>

Here's how the example above works:

    By default, the outer div is display: block, but by adding the md:flex utility, it becomes display: flex on medium screens and larger.
    When the parent is a flex container, we want to make sure the image never shrinks, so we've added md:shrink-0 to prevent shrinking on medium screens and larger. Technically we could have just used shrink-0 since it would do nothing on smaller screens, but since it only matters on md screens, it's a good idea to make that clear in the class name.
    On small screens the image is automatically full width by default. On medium screens and up, we've constrained the width to a fixed size and ensured the image is full height using md:h-full md:w-48.

We've only used one breakpoint in this example, but you could easily customize this component at other sizes using the sm, lg, xl, or 2xl responsive prefixes as well.
Working mobile-first

Tailwind uses a mobile-first breakpoint system, similar to what you might be used to in other frameworks like Bootstrap.

What this means is that unprefixed utilities (like uppercase) take effect on all screen sizes, while prefixed utilities (like md:uppercase) only take effect at the specified breakpoint and above.
Targeting mobile screens

Where this approach surprises people most often is that to style something for mobile, you need to use the unprefixed version of a utility, not the sm: prefixed version. Don't think of sm: as meaning "on small screens", think of it as "at the small breakpoint".

Don't use sm: to target mobile devices
HTML

<!-- This will only center text on screens 640px and wider, not on small screens -->
<div class="sm:text-center"></div>

Use unprefixed utilities to target mobile, and override them at larger breakpoints
HTML

<!-- This will center text on mobile, and left align it on screens 640px and wider -->
<div class="text-center sm:text-left"></div>

For this reason, it's often a good idea to implement the mobile layout for a design first, then layer on any changes that make sense for sm screens, followed by md screens, etc.
Targeting a breakpoint range

By default, styles applied by rules like md:flex will apply at that breakpoint and stay applied at larger breakpoints.

If you'd like to apply a utility only when a specific breakpoint range is active, stack a responsive variant like md with a max-* variant to limit that style to a specific range:
HTML

<div class="md:max-xl:flex">
  <!-- ... -->
</div>

Tailwind generates a corresponding max-* variant for each breakpoint, so out of the box the following variants are available:
Variant	Media query
max-sm	@media (width < 40rem) { ... }
max-md	@media (width < 48rem) { ... }
max-lg	@media (width < 64rem) { ... }
max-xl	@media (width < 80rem) { ... }
max-2xl	@media (width < 96rem) { ... }
Targeting a single breakpoint

To target a single breakpoint, target the range for that breakpoint by stacking a responsive variant like md with the max-* variant for the next breakpoint:
HTML

<div class="md:max-lg:flex">
  <!-- ... -->
</div>

Read about targeting breakpoint ranges to learn more.
Using custom breakpoints
Customizing your theme

Use the --breakpoint-* theme variables to customize your breakpoints:
app.css

@import "tailwindcss";
@theme {
  --breakpoint-xs: 30rem;
  --breakpoint-2xl: 100rem;
  --breakpoint-3xl: 120rem;
}

This updates the 2xl breakpoint to use 100rem instead of the default 96rem, and creates new xs and 3xl breakpoints that can be used in your markup:
HTML

<div class="grid xs:grid-cols-2 3xl:grid-cols-6">
  <!-- ... -->
</div>

Note that it's important to always use the same unit for defining your breakpoints or the generated utilities may be sorted in an unexpected order, causing breakpoint classes to override each other in unexpected ways.

Tailwind uses rem for the default breakpoints, so if you are adding additional breakpoints to the defaults, make sure you use rem as well.

Learn more about customizing your theme in the theme documentation.
Removing default breakpoints

To remove a default breakpoint, reset its value to the initial keyword:
app.css

@import "tailwindcss";
@theme {
  --breakpoint-2xl: initial;
}

You can also reset all of the default breakpoints using --breakpoint-*: initial, then define all of your breakpoints from scratch:
app.css

@import "tailwindcss";
@theme {
  --breakpoint-*: initial;
  --breakpoint-tablet: 40rem;
  --breakpoint-laptop: 64rem;
  --breakpoint-desktop: 80rem;
}

Learn more removing default theme values in the theme documentation.
Using arbitrary values

If you need to use a one-off breakpoint that doesn’t make sense to include in your theme, use the min or max variants to generate a custom breakpoint on the fly using any arbitrary value.

<div class="max-[600px]:bg-sky-300 min-[320px]:text-center">
  <!-- ... -->
</div>

Learn more about arbitrary value support in the arbitrary values documentation.
Container queries
What are container queries?

Container queries are a modern CSS feature that let you style something based on the size of a parent element instead of the size of the entire viewport. They let you build components that are a lot more portable and reusable because they can change based on the actual space available for that component.
Basic example

Use the @container class to mark an element as a container, then use variants like @sm and @md to style child elements based on the size of the container:
HTML

<div class="@container">
  <div class="flex flex-col @md:flex-row">
    <!-- ... -->
  </div>
</div>

Just like breakpoint variants, container queries are mobile-first in Tailwind CSS and apply at the target container size and up.
Max-width container queries

Use variants like @max-sm and @max-md to apply a style below a specific container size:
HTML

<div class="@container">
  <div class="flex flex-row @max-md:flex-col">
    <!-- ... -->
  </div>
</div>

Container query ranges

Stack a regular container query variant with a max-width container query variant to target a specific range:
HTML

<div class="@container">
  <div class="flex flex-row @sm:@max-md:flex-col">
    <!-- ... -->
  </div>
</div>

Named containers

For complex designs that use multiple nested containers, you can name containers using @container/{name} and target specific containers with variants like @sm/{name} and @md/{name}:
HTML

<div class="@container/main">
  <!-- ... -->
  <div class="flex flex-row @sm/main:flex-col">
    <!-- ... -->
  </div>
</div>

This makes it possible to style something based on the size of a distant container, rather than just the nearest container.
Using custom container sizes

Use the --container-* theme variables to customize your container sizes:
app.css

@import "tailwindcss";
@theme {
  --container-8xl: 96rem;
}

This adds a new 8xl container query variant that can be used in your markup:
HTML

<div class="@container">
  <div class="flex flex-col @8xl:flex-row">
    <!-- ... -->
  </div>
</div>

Learn more about customizing your theme in the theme documentation.
Using arbitrary values

Use variants like @min-[475px] and @max-[960px] for one-off container query sizes you don't want to add to your theme:
HTML

<div class="@container">
  <div class="flex flex-col @min-[475px]:flex-row">
    <!-- ... -->
  </div>
</div>

Using container query units

Use container query length units like cqw as arbitrary values in other utility classes to reference the container size:
HTML

<div class="@container">
  <div class="w-[50cqw]">
    <!-- ... -->
  </div>
</div>

Container size reference

By default, Tailwind includes container sizes ranging from 16rem (256px) to 80rem (1280px):
Variant	Minimum width	CSS
@3xs	16rem (256px)	@container (width >= 16rem) { … }
@2xs	18rem (288px)	@container (width >= 18rem) { … }
@xs	20rem (320px)	@container (width >= 20rem) { … }
@sm	24rem (384px)	@container (width >= 24rem) { … }
@md	28rem (448px)	@container (width >= 28rem) { … }
@lg	32rem (512px)	@container (width >= 32rem) { … }
@xl	36rem (576px)	@container (width >= 36rem) { … }
@2xl	42rem (672px)	@container (width >= 42rem) { … }
@3xl	48rem (768px)	@container (width >= 48rem) { … }
@4xl	56rem (896px)	@container (width >= 56rem) { … }
@5xl	64rem (1024px)	@container (width >= 64rem) { … }
@6xl	72rem (1152px)	@container (width >= 72rem) { … }
@7xl	80rem (1280px)	@container (width >= 80rem) { … }
Hover, focus, and other states
Dark mode
