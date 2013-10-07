function Blinky(options) {
    // default options
    var defaults = {
        target:          $('body'),
        numberOfColumns: chance.natural({ min: 5, max: 50 })
    }

    // merge given options with the defaults
    $.extend(defaults, options);

    // set options to properties
    this.target          = defaults.target;
    this.numberOfColumns = defaults.numberOfColumns;

    // private properties
    this._elements                = [];
    this._numberOfRows            = 0;
    this._lengthOfElementInPixel  = 0;
    this._widthDifferenceInPixel  = 0;
    this._heightDifferenceInPixel = 0;

    // draw rectangles
    this.draw();

    // add listener for resize-event to target
    this.target.resize($.proxy(this.draw, this));
}


Blinky.prototype.calculateLength = function() {
    var width  = this.target.width();
    var height = this.target.height();

    this._lengthOfElementInPixel  = Math.ceil(width / this.numberOfColumns);
    this._widthDifferenceInPixel  = this._lengthOfElementInPixel * this.numberOfColumns - width;
    this._numberOfRows            = Math.ceil(height / this._lengthOfElementInPixel);
    this._heightDifferenceInPixel = this._lengthOfElementInPixel * this._numberOfRows - height;

    if (this._widthDifferenceInPixel > this._lengthOfElementInPixel) {
        this.numberOfColumns   += 1;
        this.calculateLength();
    }
}


Blinky.prototype.draw = function() {
    this.calculateLength();

    // remove elements
    if (this._elements.length > 0) {
        $(this._elements).each(function(index, el) {
            el.jq.remove();
        });

        this._elements = [];
    }

    // create some elements
    var numberOfElements = this._numberOfRows * this.numberOfColumns;

    for (var i = 0; i <= numberOfElements - 1; i++) {
        var isLastColumn = false;
        var isLastRow    = false;

        if ( (i + 1) % this.numberOfColumns == 0) {
            isLastColumn = true;
        }

        if (i + 1 > numberOfElements - this.numberOfColumns) {
            isLastRow = true;
        }

        // create element
        var element = new Element(this._lengthOfElementInPixel, this._lengthOfElementInPixel);

        // correct width
        if (isLastColumn) {
            element.jq.width(this._lengthOfElementInPixel - this._widthDifferenceInPixel);
        }

        // correct height
        if (isLastRow) {
            element.jq.height(this._lengthOfElementInPixel - this._heightDifferenceInPixel);
        }

        element.jq.appendTo(this.target);
        this._elements.push(element);
    }
}


function Element(width, height) {
    this._width    = width;
    this._height   = height;
    this.jq  = $('<div />')
        .addClass('item')
        .width(this._width)
        .height(this._height)
        .css('cursor', 'pointer')
        .css('float', 'left')
    ;

    // change background color
    this.changeBackgroundColor();

    // set inverval for changing background color
    setInterval($.proxy(this.changeBackgroundColor, this), chance.natural({min: 500, max: 1500}));

    // click listener
    this.jq.click($.proxy(function() {
        this.changeBackgroundColor();
    }, this));
}


Element.prototype.changeBackgroundColor = function() {
    this.jq.css('backgroundColor', chance.color());
}


// register Blinky as jQuery plugin
$.fn.extend({
    blinky: function(options) {
        this.each(function() {
            options = $.extend(options, { target: $(this) });
            new Blinky(options);
        });

        return this;
    }
});