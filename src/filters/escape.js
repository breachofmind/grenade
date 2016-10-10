var Filter = require('../Filter');

/**
 * Escapes the value, to prevent XSS.
 */
Filter.extend('escape', function(value,data) {
    return value.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
});

