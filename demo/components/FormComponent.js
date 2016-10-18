"use strict";

var grenade = require('grenade');

class FormComponent extends grenade.Component
{
    constructor(tag)
    {
        super(tag);

        this.data.method = "get";

        this.view = "components/form";
    }
}

module.exports = FormComponent;