# Font Awesome as Primary Font - Usage Guide

This document provides guidance on how to use Font Awesome as the primary font throughout your application.

## Font Hierarchy

Font Awesome is now configured as the primary font in the following order:

1. Font Awesome 5 Free (Regular 400)
2. System fonts (-apple-system, BlinkMacSystemFont, etc.)

## Using Font Awesome Typography

### Base Text (Automatic)

All text in the application now uses Font Awesome as the primary font by default. You don't need to do anything special for basic text.

```html
<p>This text will use Font Awesome automatically</p>
```

### Font Weights

Font Awesome provides different font weights, which can be applied using Tailwind classes or custom CSS classes:

```html
<!-- Using Tailwind classes -->
<p class="font-normal">Regular weight (400)</p>
<p class="font-solid">Solid weight (900)</p>
<p class="font-bold">Bold weight (700)</p>

<!-- Using custom classes -->
<p class="font-awesome">Regular Font Awesome</p>
<p class="font-awesome-solid">Solid Font Awesome</p>
```

### Font Variants

You can explicitly choose different font variants:

```html
<!-- Using Tailwind classes -->
<p class="font-fa">Font Awesome Regular</p>
<p class="font-fa-solid">Font Awesome Solid</p>
<p class="font-fa-brands">Font Awesome Brands</p>
<p class="font-system">System fonts only (no Font Awesome)</p>
```

### Using Font Awesome Icons

You can use Font Awesome icons directly in text by using the appropriate Unicode:

```html
<span class="font-awesome-solid">&#xf005;</span> <!-- star icon -->
<span class="font-fa-solid">&#xf004;</span> <!-- heart icon -->
```

Common icon codes:
- Star: `&#xf005;`
- Heart: `&#xf004;`
- User: `&#xf007;`
- Check: `&#xf00c;`
- Times/X: `&#xf00d;`

## Benefits

1. **Consistent Typography**: Font Awesome provides a consistent look across the entire application.
2. **Icon Integration**: Seamlessly integrate icons with text using the same font family.
3. **Performance**: Using the font for both text and icons can improve performance by reducing the need to load separate icon libraries.

## Note on Font Loading

The Font Awesome CSS is loaded at the beginning of the document head to ensure it's given priority during page rendering.

## Reverting to System Fonts

If you need to use the system fonts without Font Awesome for certain elements:

```html
<p class="font-system">This will use only system fonts</p>
```
