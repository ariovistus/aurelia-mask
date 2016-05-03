[![Sauce Test Status](https://saucelabs.com/browser-matrix/aurelia-mask.svg)](https://saucelabs.com/u/aurelia-mask)

This is a port of Angular's [UI-Mask][ui-mask] to Aurelia.

Apply a mask on an input field so the user can only type pre-determined pattern.

## Requirements

- aurelia

## Installation

### jspm

jspm install aurelia-mask=github:ariovistus/aurelia-mask

## Usage

in your template:

```html
<require from="aurelia-mask/masked-input"></require>

...

<input masked="value.bind: myvalue; mask.bind: mymask" />

```

notes

- do not apply a value binding to the input, that will interfere with the plumbing
```
    <!-- bad! -->
    <input masked="..." value.bind="myvalue" />
```
- mask has the same format as default ui-mask
  - 9 → number
  - a → alpha
  - * → number or alpha


## Options

### placeholder

the default placeholder char is '\_'. You can override it.

```html
<input masked="value.bind: myvalue; mask: (999) 999-9999; placeholder: *" />

```

| mask            | ui value       | model value |
| ----            | --------       | ----------- |
| (999) 999-9999  | (\*\*\*) \*\*\*-\*\*\*\* | ''          |

special case for space:

```html
<input masked="value.bind: myvalue; mask: 99/99; placeholder: space" />

```

| mask            | ui value       | model value |
| ----            | --------       | ----------- |
| (999) 999-9999  | '(   )    -    ' | ''          |

### bind-masking

by default, any punctuation characters are stripped out of the value, e.g:


| mask            | ui value       | model value |
| ----            | --------       | ----------- |
| (999) 999-9999  | (800) 888-8888 | 8008888888  |

you can override this:

```html
<input masked="value.bind: myvalue; mask: (999) 999-9999; bind-masking: true" />

```

| mask            | ui value       | model value     |
| ----            | --------       | -----------     |
| (999) 999-9999  | (800) 888-8888 | (800) 888-8888  |

### aspnet masking

don't know what to call this, but sometimes you want a more relaxed mode where you can enter characters
at any position, not just the start

```html
<input masked="value.bind: myvalue; mask: (999) 999-9999; aspnet-masking: true;" />

```

| mask            | ui value       | model value     |
| ----            | --------       | -----------     |
| /999/999/9999/  | /\_\_0/\_8\_/8888/ | /\_\_0/\_8\_/8888/  |

The masker object exposes a function to strip off the placeholder characters:

```javascript
var masker = getMasker({maskFormat: "/999/999/9999/", aspnetMasking: true})
var result = masker.stripPlaceholders("/__0/_8_/8888/");
expect(result).toBe("/0/8/8888/");
```
not that that's hard to do yourself. have yet to figure out how to incorporate it in the binding.

### edit mode

by default it is insert. You can also specify overtype mode. 

```html
<input masked="value.bind: myvalue; mask: (999) 999-9999; edit-mode: overtype" />
```

Currently only works with aspnet mode.

[ui-mask]: https://github.com/angular-ui/ui-mask
