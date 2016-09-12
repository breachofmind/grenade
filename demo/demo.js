"use strict";

var grenade = require('../index');

var data = {
    title: "Mike",
    test: function(title,arg)
    {
        return title + arg;
    },
    html: "<h1>My Html</h1>",
    footer: {
        title: "Footer Title!"
    },
    colors: [
        "red", "green", "blue"
    ],
    hash: {
        item1: "Hash 1",
        item2: "Hash 2",
        item3: "Hash 3",
    },
    items: [
        {name:"Item 1", id:1, people: [1,5,3]},
        {name:"Item 2", id:2, people: [1,9,3]},
        {name:"Item 3", id:3, people: [1,3,3]},
        {name:"Item 4", id:4, people: [1,9,3]},
    ]
};

var compiler = new grenade.Compiler({
    rootPath: __dirname+"/views/",
    extension: 'htm',
    prettyPrint: true,
    debug: true,
});

grenade.Filter.extend('toUpper', function(value,data) {
    return value.toUpperCase();
});

grenade.Filter.extend('currency', function(value,data) {
    return "$"+value;
});
grenade.Filter.extend('bold', function(value,data) {
    return "<strong>"+value+"</strong>";
});


compiler.load('content', function(err,template) {

    if (err) throw err;
    var str = template(data);

    console.log(str);
});
