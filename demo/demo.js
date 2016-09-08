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



factory.rootPath = __dirname+"/views/";
factory.extension = "htm";
factory.prettyPrint = true;

factory.load(factory.filepath('content'), function(err,template) {

    var str = template(data);

    console.log(str);
});
