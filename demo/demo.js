"use strict";

var factory = require('../index');

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
    items: [
        {name:"Item 1", id:1, people: [1,5,3]},
        {name:"Item 2", id:2, people: [1,9,3]},
        {name:"Item 3", id:3, people: [1,3,3]},
        {name:"Item 4", id:4, people: [1,9,3]},
    ]
};

factory.setRootPath(__dirname+"/views/");
factory.ext = "htm";
factory.debug(true);
var template = factory.load('content');
//console.log(template);

console.log(template(data));
