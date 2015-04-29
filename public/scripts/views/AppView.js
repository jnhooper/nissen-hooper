/**
 * Created by John on 4/9/2015.
 */
/**
 * Created by John on 4/9/2015.
 */

    var View = famous.core.View;//require('famous/core/View');
    var Surface = famous.core.Surface;//require('famous/core/Surface');
    var Transform = famous.core.Transform;//require('famous/core/Transform');
    var StateModifier = famous.modifiers.StateModifier;//require('famous/modifiers/StateModifier');

// Constructor function for our AppView class
    function AppView() {

        // Applies View's constructor function to AppView class
        View.apply(this, arguments);
    }

// Establishes prototype chain for AppView class to inherit from View
    AppView.prototype = Object.create(View.prototype);
    AppView.prototype.constructor = AppView;

// Default options for AppView class
    AppView.DEFAULT_OPTIONS = {};

// Define your helper functions and prototype methods here

    module.exports = AppView;
