var grenade = require('../index');

var opts = {
    extension: "htm",
    rootPath: __dirname + "/views/",
    prettyPrint: true,
    //delimiter: grenade.utils.DELIM_HANDLEBARS
};

var data = {
    name: {
        get:function() { return "mike"; }
    },
    date: new Date(),
    title: "Grenade Demo",
    colors: ['red','green','blue'],
    items: [
        {name: "Item 1", numbers: [1,2,3]},
        {name: "Item 2", numbers: [4,5,6]},
        {name: "Item 3", numbers: [7,8,9]}
    ],
    hash: {
        id123: "ID 1",
        id253: "ID 2",
        id167: "ID 3",
    },
    html: "<div class='html'>My Html</div>"
};

grenade.load('index',opts, function(err,template) {

    console.log(template(data));
});