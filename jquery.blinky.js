/* jshint nonew: false */
/* global $, chance */

(function () {
    "use strict";

    function Blinky(options) {
        // default options
        var defaults = {
            target:          $('body'),
            numberOfColumns: chance.natural({ min: 5, max: 50 }),
            blinking:        true
        };

        // merge given options with the defaults
        $.extend(defaults, options);

        // set options to properties
        this.target          = defaults.target;
        this.numberOfColumns = defaults.numberOfColumns;
        this.blinking        = defaults.blinking;

        // private properties
        this.elements                = [];
        this.numberOfRows            = 0;
        this.lengthOfElementInPixel  = 0;
        this.widthDifferenceInPixel  = 0;
        this.heightDifferenceInPixel = 0;

        // draw rectangles
        this.draw();

        // add listener for resize-event to target
        this.target.resize($.proxy(this.draw, this));
    }


    Blinky.prototype.calculateLength = function () {
        var width  = this.target.width(),
            height = this.target.height();

        this.lengthOfElementInPixel  = Math.ceil(width / this.numberOfColumns);
        this.widthDifferenceInPixel  = this.lengthOfElementInPixel * this.numberOfColumns - width;
        this.numberOfRows            = Math.ceil(height / this.lengthOfElementInPixel);
        this.heightDifferenceInPixel = this.lengthOfElementInPixel * this.numberOfRows - height;

        if (this.widthDifferenceInPixel > this.lengthOfElementInPixel) {
            this.numberOfColumns   += 1;
            this.calculateLength();
        }
    };


    Blinky.prototype.draw = function () {
        this.calculateLength();

        // remove elements
        if (this.elements.length > 0) {
            $(this.elements).each(function () {
                this.jq.remove();
            });

            this.elements = [];
        }

        // create some elements
        var numberOfElements = this.numberOfRows * this.numberOfColumns;

        for (var i = 0; i <= numberOfElements - 1; i++) {
            var isLastColumn = false;
            var isLastRow    = false;

            if ( (i + 1) % this.numberOfColumns === 0) {
                isLastColumn = true;
            }

            if (i + 1 > numberOfElements - this.numberOfColumns) {
                isLastRow = true;
            }

            // create element
            var element = new Element(this.lengthOfElementInPixel, this.lengthOfElementInPixel, this.blinking);

            // correct width
            if (isLastColumn) {
                element.jq.width(this.lengthOfElementInPixel - this.widthDifferenceInPixel);
            }

            // correct height
            if (isLastRow) {
                element.jq.height(this.lengthOfElementInPixel - this.heightDifferenceInPixel);
            }

            element.jq.appendTo(this.target);
            this.elements.push(element);
        }
    };


    function Element(width, height, blinking) {
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
        if (blinking) {
            setInterval($.proxy(this.changeBackgroundColor, this), chance.natural({min: 500, max: 1500}));
        }

        // click listener
        this.jq.click($.proxy(function() {
            this.changeBackgroundColor();
        }, this));
    }


    Element.prototype.changeBackgroundColor = function() {
        this.jq.css('backgroundColor', chance.color());
    };


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

}());