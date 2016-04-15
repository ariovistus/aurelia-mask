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
<input masked="value.bind: myvalue; mask: 99/99; placeholder: *" />

```

will display \*\*/\*\* given an empty value.

special case for space:

```html
<input masked="value.bind: myvalue; mask: 99/99; placeholder: space" />

```

will display '  /  ' given an empty value.

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



[ui-mask]: https://github.com/angular-ui/ui-mask
