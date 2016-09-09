# Grenade
A template library for Node and Express, influenced by Taylor Otwell's "Blade" template engine for Laravel.

## Why do we need another templater?

We don't. I just happen to have a lot of requirements for my template libraries and I've always liked the way Blade feels.

This was designed to work with the server and supports a number of features:

- Natively supports Layouts..
- Escaped, unescaped, and comment variables.
- Make Function calls like you can with EJS.
- Ability to extend with custom tags.
- Plugs into Express easily.
- Easy to write and read, unobtrusive syntax.
- Scoping of data structures, like Angular. (ie. `@foreach((i,item) in items)`)
- Ability to precompile templates, like handlebars or EJS.
- Can work with Angular or other handlebars templaters on the client, since this library doesn't use handlebars delimiters.

## Performance

Still tweaking performance. Not quite ready for production yet. However, I have been testing it with Marko's template performance tester. Let's just say it's faster than swig and nunjucks but slower than handlebars.

## What's with the name?

Evolution of a name. "Blade-for-node" -> "Node-Blade" -> "Nade" -> "Grenade".

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
    debug: true,
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
app.engine('nade', grenade.Compiler.express({
    rootPath: 'views' // grenade uses a root path to find views instead of a relative path. Be sure to set it here.
    extension: 'nade' // File extension.
});
```


## Templates

Let's make a simple template that is based on a parent layout.

```html
./views/index.nade
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
./views/layouts/master.nade
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

Notice that variables have the javascript-esque syntax: `${variable}`. By default, the values are escaped, much like other templaters.

- `${variable}` - Escaped value.
- `${=variable}` - Raw value, good for HTML output.
- `${#variable}` - Comment. Not processed when rendered.

### Functions

Grenade allows you to call functions from your data object, like EJS. They have the variable syntax:

`${testing(arg1,arg2,"string")}`

### Control structures

Grenade comes with some basic structures. More are on the way.

#### if/else

```html
@if(condition)
    <h1>It's true.</h1>
@else
    <h1>It's false.</h1>
@endif
```

#### foreach

```html
<ul>
@foreach(item in items)
    <li>${item}</li>
@endforeach
</ul>

<ul>
@foreach((index,item) in items)
    <li>#${index} : ${item}</li>
@endforeach
</ul>
```

#### include

```html
@include("file/name")
```

## Creating Custom Tags

Custom tags look like `@tagname(args)`. You can add your own to create custom UI components or control structures.

```javascript
var grenade = require('grenade');

// This special tag will only display it's enclosed scope if a user has the given role.
grenade.Tag.extend('role', {
    // Declare this tag as a block, which means it contains a scope and a @endrole tag.
    block: true,
    
    // Parse the tag's arguments.
    // They were passed as a string, so we'll leave them alone.
    parse: function(args) {
        return args;
    },
    
    // Function that will be called when the template is rendered with data.
    render(data) {
        // If the user has the role, show the containing scope.
        if (data.user && data.user.role == this.args) {
            return this.scope.render(data);
        }
        // Oh no. Didn't meet our criteria, so return empty string.
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

## Contributing

Let me know if you want to help out!