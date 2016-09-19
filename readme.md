# Grenade
A template engine for Node and Express, influenced by Taylor Otwell's "Blade" template engine for Laravel.

## Why do we need another template engine?

We don't. I just wanted more flexibility with my template engine.

This was designed to work with the server and supports a number of features:

- Natively supports Layouts.
- Custom delimiters for variables, if you really want the handlebars delimiters.
- Escaped variables, raw variables, or custom variable output.
- Ability to call javascript functions and helpers, like EJS.
- Ability to extend with custom tags.
- Ability to write custom filter functions.
- Plugs into Express easily.
- Easy to write and read.
- Ability to precompile templates (coming soon).
- Can work with Angular or other handlebars engines on the frontend, since delimiters can be changed.


## Installing

```bash
npm install breachofmind/grenade --save
```

## Using

### Compiling from a file:

```javascript
var grenade = require('grenade');

var opts = {
    rootPath: __dirname+"/views/",
    extension: 'htm',
    prettyPrint: true,
    prettyPrintOptions: {}, Uses js-beautify module.
    localsName: "data", // Your variables are prepended with this. ie, ${data.varName}
    delimiters: grenade.utils.DELIM_HANDLEBARS // This is a regex. Change to whatever.
};

// This will load and compile the file "./views/content.htm";

grenade.load('content', opts, function(err,template) {

    if (err) throw err;
    
    return template(data);
});
```

### Using with express:

```javascript
var grenade = require('grenade');
var express = require('express');

var app = express();

// "nade" is the extension, so feel free to use something 
// like "htm" if your IDE doesn't support custom file types.
// Be sure to specify your views path, since grenade does not use relative paths.

grenade.express(app, {
    rootPath: 'views',
    extension: 'nade'  
});
```


## Templates

Let's make a simple template that is based on a parent layout.

```html
<!-- ./views/index.nade -->
@extends("layouts/master")

@section("head")
    ${#This is a comment. And it's in the head section of my layout.}
    <link rel="stylesheet" href="/styles.css"/>
@endsection

@section("body")
    <h1>This is in my content section.</h1>
@endsection
```

```html
<!-- ./views/layouts/master.nade -->
<!DOCTYPE html>
<html>
    <head>
        <title>${title}</title>
        @yield("head")
    </head>
    <body>
        @yield("body")
    </body>
</html>
```

### Variables

By default, variables have the javascript-esque syntax: `${variable}`. You can, however, use other delimiters if you so desire.

- `${variable}` - Escaped value.
- `${=variable}` - Raw value, good for HTML output.
- `${#variable}` - Comment. Not processed when rendered.

### Functions

Grenade allows you to call functions from your data object, like EJS. They have the variable syntax:

`${ testing(arg1,arg2,"string") }`

### Control structures / Loops

Grenade comes with all the basic control structures, and some cool ones.

#### if/else/else if

Display the contents of the block if the expression is truthy.

```html
@if(condition)
    <h1>It's true.</h1>
@elseif(condition)
    <h1>This condition is true.</h1>
@else
    <h1>None are true.</h1>
@endif
```

#### unless/else

Displays the contents of the block if the expression is falsey.

```html
@unless(condition)
    <h1>It's false.</h1>
@else
    <h1>It's true.</h1>
@endif
```

#### for

Your basic `for` loop, just like javascript.

```html
<ul>
@for(var i=1; i<=items.length; i++)
    <li>Item ${i}</li>
@endfor
</ul>
```

#### foreach

Loop through the given data array.

```html
<ul>
@foreach(item in items)
    <li>${item}</li>
@endforeach
</ul>

<ul>
@foreach([index,item] in items)
    <li>${index} : ${item}</li>
@endforeach
</ul>
```

#### include

Include a file at the given location.

```html
@include("file/name")
```

#### show

Shows the given strings if the expressions are truthy. Useful for creating classes.

```html
<li class="@show(first: i==0, last: items.length == i)">Item</li>
```

This is pretty common, so a prefix filter also works here:

```html
<li class="${? first:i==0, last:items.length == i}">Item</li>
```

#### verbatim

Display the contents of the block exactly how it's shown.

```html
@verbatim
    @if
    <h1>This whole thing shows up, including the @if.</h1>
    @endif
@endverbatim
```

#### push/stack

Collects the `@push` scopes and renders them all under the `@stack` name. Useful for adding scripts or CSS links to the document head or footer.

```html
@stack(links)

@push(links)
<link rel="stylesheet" href="..."/>
@endpush

...

@push(links)
<link rel="stylesheet" href="..."/>
<link rel="stylesheet" href="..."/>
@endpush
```

## Filters

Filters are used in much the same way as Angular. They can be defined like so:

```javascript
var grenade = require('grenade');

grenade.Filter.extend('toUpper', function(value,data) {
    return value.toUpperCase();
});
grenade.Filter.extend('bold', function(value,data) {
    return "<strong>"+value+"</strong>";
});
```

And in the markup, they are applied in order (comma-separated)

```html
<h1>${=title | toUpper,bold}</h1>
```

Yields:
```html
<h1></strong>TITLE</strong></h1>
```

### Prefix filters

Sometimes, filters or helpers are done so often, a custom prefix would be nice to have. One good example is using locales:

```html
<!-- Instead of this... -->
${toLocale(variable)}
${toLocale("en_us.welcome")}

<!-- Let's do this -->
${>"en_us.welcome"}
```

To do this, add the following option when creating a filter:
```javascript
grenade.Filter.extend('toLocale', {prefix:">", pushPrefix: false}, function(value,data) {
    return data.toLocale(value);
});
```

__Note__ Prefix filters are applied LAST by default, so be sure to include the `pushPrefix: false` in this case. So, our locale string is modified accordingly by other filters.

```html
<h1>${>"en_us.welcome" | toUpper,bold}</h1>
<h1>${>"en_us.welcome" | escape}</h1>

<!-- This also works -->
<h1>${"en_us.welcome" | toLocale,toUpper,bold}</h1>
```

## Creating Custom Tags

Custom tags look like `@tagname(args)`. You can add your own to create custom UI components or control structures.

```javascript
var grenade = require('grenade');

// This special tag will only display it's enclosed scope if a user has the given role.

grenade.Tag.extend('role', {

    // Declare this tag as a block, 
    // which means it contains a scope and a @endrole tag.
    
    block: true,
    
    // Parse the tag's arguments.
    // They were passed as a string, so we'll leave them alone.
    
    parse: function(args) {
        return args;
    },
    
    // Function that will be called 
    // when the template is rendered with data.
    
    render(data) {
    
        // If the user has the role, 
        // show the containing scope.
        
        if (data.user && data.user.role == this.args) {
            return this.scope.render(data);
        }
        
        // Oh no. Didn't meet our criteria, 
        // so return empty string.
        
        return "";
    }
})
```

And so our markup can be:

```html
@role(superuser)
    <marquee>My user's role is a superuser!</marquee>
@endrole
```

## Testing

`mocha test`

## Notes

### Why Not Use...

- __EJS?__ Performance, no native layout support, includes are relative, and I hate writing closing braces `<% } %>`.
- __Handlebars?__ Doesn't play nice with Angular front-ends, layouts require plugin.
- __Pug?__ Syntax is hard to read sometimes, can't copy/paste the source code into html files for use, and whitespace is annoying.
- __Marko?__ Writing HTML tags as control structures or inlining control structures doesn't seem right, doesn't play nice with some IDE's.

Also, a common theme is lack of extensibility. I want to be able to extend like crazy.

### Performance

Performance is definitely a concern, so templates are compiled to plain javascript and the compiled templates are cached by filename. 

Benchmark testing has been done with Marko's handsome [Templating benchmark suite](https://github.com/marko-js/templating-benchmarks).

### I hate having to write "data.variable" in my templates

I do too, but you wouldn't believe the performance increase when the `with(data) {...}` is removed from the compiled javascript. Most of the heavy hitters avoid using `with` for performance reasons. 

If you don't care, feel free to fork and add the `with` yourself in `src/template.js`!

### What's with the name?

Evolution of a name. "Blade-for-node" -> "Node-Blade" -> "Nade" -> "Grenade".

## Contributing

Let me know if you want to help out!