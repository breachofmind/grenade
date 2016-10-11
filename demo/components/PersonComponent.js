"use strict";

var grenade = require('grenade');

class PersonComponent extends grenade.Component
{
    constructor(tag)
    {
        super(tag);

        this.view = "components/person";
    }

    render(data)
    {
        this.data = this.params;
        return super.render(data);
    }
}

module.exports = PersonComponent;