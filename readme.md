# Grenade
A template library for Node and Express, based on Taylor Otwell's "Blade" template engine for Laravel.

## Why do we need another templater?

We don't. I just happen to have a lot of requirements for my template libraries and I've always liked the way Blade feels.

This was designed to work with the server and supports a number of features:

- Layouts, using the @extends('file') syntax.
- Escaped, unescaped, and comment variables.
- Make Function calls with arguments.
- Ability to extend with custom tags.
- Plugs into Express easily.
- Easy to write and read, unobtrusive syntax.
- Scoping of data structures, like Angular. (ie. @foreach((i,item) in items))
- Ability to precompile templates, like handlebars or EJS.
- Can work with Angular or other handlebars templaters on the client, since this library doesn't use handlebars delimiters.

## What's with the name?

Evolution of a name. "Blade-for-node" -> "Node-Blade" -> "Nade" -> "Grenade".

## Performance

Still looking into performance. Not quite ready for production yet.

## Contributing

Let me know if you want to help out!