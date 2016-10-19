# Grenade
A template engine for Node and Express, influenced by Taylor Otwell's ["Blade" template engine](https://laravel.com/docs/5.3/blade#introduction) for Laravel.

## Why do we need another template engine?

We don't. I just wanted more flexibility with my template engine.

This was designed to work with the server and supports a number of features:

- Natively supports Layouts.
- Escaped variables, raw variables, or custom variable output.
- Ability to call javascript functions and helpers, like EJS.
- Ability to extend with custom tags.
- Ability to write custom filter functions, like Angular.
- Plugs easily into Express.
- Easy to write and read.
- Ability to precompile templates (coming soon).
- Promise-based rendering, necessary for building UI components that rely on data.
- Use your own delimiters, such as `{{ }}` or `${ }`.


## Installing

```bash
npm install grenade --save
```

## Usage

### Compiling from a file:

```javascript
var grenade = require('grenade');

// All the available options.
var options = {

    // The root view path. Views are loaded relative to this directory.
    rootPath: __dirname+"/views/",
    
    // The path of your Component javascript classes.
    componentPath: __dirname+"/components/",
    
    // The file extension.
    extension: 'htm',
    
    // Pretty print the output? Useful for debugging.
    prettyPrint: false,
    
    //Uses js-beautify module.
    prettyPrintOptions: {}, 
    
    // Your variables are prepended with this. ie, ${data.varName}
    localsName: "data",
    
    // Enable template caching? True for production mode.
    enableCache: false,
    
    // Use promises for rendering?
    // This could make rendering slower, but allows more flexibility.
    promises: true,
    
    // This is a regex. Change to whatever.
    delimiters: grenade.utils.DELIM_HANDLEBARS
    //delimiters: grenade.utils.DELIM_JAVASCRIPT
};

// This will load and compile the file "./views/content.htm";
grenade.load('content', options, function(err,template) {

    var data = {title: "Hello World"};
    
    // You can do the promise way, or not.
    if (options.promises) {
        return template(data).then(result => {
            console.log(result);
        })
    }
    console.log(template(data));
});
```

### Using with Express:

```javascript
var grenade = require('grenade');
var express = require('express');

var app = express();

// This will set up the view engine.
grenade.express(app, {
    rootPath: './views',
    extension: 'frag'  
});
```

## Syntax

Grenade's basic syntax looks very similar to Laravel's [Blade](https://laravel.com/docs/5.3/blade#introduction) syntax.
Tags are denoted with a `@` and have custom functionality. Variables are wrapped by whichever delimiters you specify.

```html
<!-- ./views/index.frag -->
@extends(layouts/master)

@section(head)
    ${#This is a comment. And it's in the head section of my layout.}
    <link rel="stylesheet" href="/styles.css"/>
@endsection

@section(body)
    @include(common/navigation)

    <h1>This is in my content section.</h1>
@endsection
```

```html
<!-- ./views/layouts/master.frag -->
<!DOCTYPE html>
<html>
    <head>
        <title>${=title}</title>
        @yield(head)
    </head>
    <body>
        @yield(body)
    </body>
</html>
```

Grenade compiles into pure javascript, which increases performance. For example:
```html
This gets compiled to javascript, ${ data.buddy }!
@if(true)
I promise.
@endif
```
Compiles into:
```javascript
__out.push("This gets compiled to javascript, ");
__out.push($$.val(data.buddy,data,['escape']));
__out.push("!");
if(true) {
    __out.push("I promise.");
}
return $$.q.all(__out).then(function(__out) { return __out.join("").trim(""); });
```

### Variables

By default, variables have the javascript-esque syntax: `${variable}`. You can, however, use other delimiters if you so desire.

- `${ data.variable }` Escaped value.
- `${= data.variable }` Raw value, good for HTML output.
- `${# data.variable }` Comment. Not processed when rendered.
- `${: data.variable }` Returns the literal string, `${ data.variable }`. Useful if using the handlebars syntax with Angular applications.

### Functions

Grenade allows you to call functions from your data object, like [EJS](http://ejs.co/):

`${ data.myFunction(arg1,arg2,"string") }`

### Control structures, loops, and tags

Grenade comes with all the basic control structures, and some cool ones.

#### @if

Display the contents of the block if the expression is __truthy__.

```html
@if(condition)
    <h1>It's true.</h1>
@elseif(condition)
    <h1>This condition is true.</h1>
@else
    <h1>None are true.</h1>
@endif
```

#### @unless

Displays the contents of the block if the expression is __falsey__.

```html
@unless(condition)
    <h1>It's false.</h1>
@else
    <h1>It's true.</h1>
@endif
```

#### @for

Your basic `for` loop, just like javascript.

```html
<ul>
@for(var i=0; i<=data.items.length; i++)
    <li>Item ${ i }</li>
@endfor
</ul>
```

#### @foreach

Loop through the given data array or hash object.

```html
<ul>
@foreach(item in items)
    <li>${ item.name }</li>
@endforeach
</ul>

<ul>
@foreach([index,item] in items)
    <li>${ index } : ${ item }</li>
@endforeach
</ul>
```

#### @include

Include a file at the given location, relative to the `rootPath`.

```html
@include(file/name)
```

#### @show

Shows the given strings if the expressions are truthy. Useful for creating classes.

```html
<!-- Markup -->
<li class="@show(first: true, last: false)">Item</li>
<!-- Rendered -->
<li class="first">Item</li>
```

This is pretty common, so a prefix filter also works here:

```html
<li class="${? first:true, last:false}">Item</li>
```

#### @verbatim

Display the contents of the block exactly how it's shown.

```html
@verbatim
    @if(false)
    <h1>This whole thing shows up, including the @if.</h1>
    @endif
@endverbatim
```

#### @push and @stack

Collects the `@push` blocks and renders them all under the `@stack` tag. Useful for adding scripts or CSS links to the document head or footer.

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

#### @set

Sets a variable. When compiled to plain javascript, it merely sets a `var` by the specified name.
```html
@set(name, "Hello World!")

<h1>${=name}</h1>
```

#### @with

When compiled to plain javascript, uses the `with(object)` syntax.
```html
@with(data)
    <!-- This is actually data.title -->
    <h1>${= title }</h1>
@endwith
```

#### @extends

Extend the current document off of a layout. Any include or component file can use it's own layout.
Works in conjunction with `@yield` and `@section`.

```html
<!-- my-component.frag -->
@extends(layouts/component)

@section(body)
    <h1>The yield tag is filled in!</h1>
@endsection
```

```html
<!-- layouts/component.frag -->
<div class="component">
    @yield(body)
</div>
```

#### @component and @block

This is a very special tag that allows you to create custom UI components off of Component classes.
A component has a javascript class associated with it, which you should define in whatever directory you
specified in `componentPath`.
```html
@component(MyComponent, {title:"Hello"})

<!-- or the shorthand... -->
@cmp(MyComponent, {title:"Hello"})
```
A block is essentially the same as a component, only you can create a 
"transcluded" template that gets passed to your component.
```html
@block(MyComponent, {title:"Hello"})
    <h1>This HTML gets past to my component class.</h1>
    <p>I can then print it using ${=data.$block} !!</p>
@endblock
```
The component declaration looks kind of like this:
```javascript
// /componentPath/MyComponent.js
"use strict"
var grenade = require('grenade');

class MyComponent extends grenade.Component 
{
    constructor(tag) {
    
        // The tag argument is the matching tag, including any passed args.
        // If using @block, a tag will have a tag.scope template.
        super(tag);
        
        this.data = {
            title:"Default Title"
        }
        // Use another grenade template file...
        this.view = "components/example";
        
        // Or, use a string template.
        this.template = "<div> ${=data.$block} </div>";
    }
    
    render(data) {
        // Maybe call to the server? Returning a promise is ok!
        // return Users.find().then(...);
        
        return super.render(data);
    }
}

module.exports = MyComponent;
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

In the markup, they are applied in order (comma-separated)

```html
<!-- Markup -->
<h1>${=data.title | toUpper,bold}</h1>

<!-- Rendered -->
<h1></strong>TITLE</strong></h1>
```

### Prefix filters

Sometimes, filters or helpers are done so often, a custom prefix would be nice to have. 
One good example is using locales:

```html
<!-- Instead of this... -->
${toLocale(data.variable)}
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

__Note:__ Prefix filters are applied LAST by default, so be sure to include 
the `pushPrefix: false` in this case. So, our locale string is modified accordingly by other filters.

```html
<h1>${>"en_us.welcome" | toUpper,bold}</h1>
<h1>${>"en_us.welcome" | escape}</h1>

<!-- This also works -->
<h1>${"en_us.welcome" | toLocale,toUpper,bold}</h1>
```

## Creating Custom Tags

Custom tags look like `@tagname(args)`. You can add your own to create 
custom UI components or control structures.

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
    render(data,done) {
    
        // If the user has the role, 
        // show the containing scope.
        if (data.user && data.user.role == this.args) {
            return this.scope.render(data).then(function(result) {
                return done(result);
            });
        }
        
        // Oh no. Didn't meet our criteria, 
        // so return empty string.
        return done("");
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

### What's with the name?

Evolution of a name. "Blade-for-node" -> "Node-Blade" -> "Nade" -> "Grenade".

## Contributing

Let me know if you want to help out.