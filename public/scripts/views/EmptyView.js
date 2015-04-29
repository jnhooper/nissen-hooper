/**
 * Created by John on 4/9/2015.
 */
var View = famous.core.View;//require('famous/core/View');
var Surface = famous.core.Surface;//require('famous/core/Surface');
var Transform = famous.core.Transform;//require('famous/core/Transform');
var StateModifier = famous.modifiers.StateModifier;//require('famous/modifiers/StateModifier');

// Constructor function for our EmptyView class
function EmptyView() {

    // Applies View's constructor function to EmptyView class
    View.apply(this, arguments);
}

// Establishes prototype chain for EmptyView class to inherit from View
EmptyView.prototype = Object.create(View.prototype);
EmptyView.prototype.constructor = EmptyView;

// Default options for EmptyView class
EmptyView.DEFAULT_OPTIONS = {};

// Define your helper functions and prototype methods here

module.exports = EmptyView;