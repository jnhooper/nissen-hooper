/* # `GeneralPlot(data, opts)`
 *
 * A 'virtual class' to derive new plots from. Provides useful 
 * functions for managing data associated with a plot.
 *
 * ## Requires
 *  - jQuery >= v1.9.1, _Note_: Other versions of jQuery should work too, 
 *  but v1.9.1 was used when writing the library.
 *  - d3 = v3
 *
 * ## Arguments
 *  - `data` : Data to be used by the plot. A JS object where each 
 *             key is a dataset and is mapped to an array of objects 
 *             representing the data. E.g.,
 *             `{ "key" : [ {x: <float>, y: <float>, id: <string>, type: <string>} ] }`
 *
 *  _Note_: The plotting tools in this library make heavy use of
 *  'accessor' functions. These functions receive one of the objects 
 *  from one of the datasets in `data` and are expected to return a
 *  value. This allows the data to remain in a complex form and only 
 *  be processed piece-by-piece as needed.
 *
 *  - `opts` : A JS object containing the options for the plot. 
 *             If a key/value is not specied, it will take on a default value
 *             unless noted otherwise.
 *
 *      __Keys:__
 *
 *      - `container`   : jQuery selector for the SVG tag to create the plot in.
 *      - `margin`      : An object for setting the margins. 
 *      - `width`       : The width of the plot in pixels.
 *      - `height`      : The height of the plot in pixels.
 *                        `{top: <float>, bot: <float>, left: <float>, right: <float>}`
 *      - `x`           : An accessor function. Should return the value to be used 
 *                        on the x-axis. Default returns d["x"].
 *      - `y`           : An accessor function. Should return the value to be used 
 *                        on the y-axis. Default returns d["y"].
 *      - `xsort`       : A compare function to be used if the data is ordinal. 
 *                        Receives two object from an array in `data` for comparison. 
 *                        See <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Description>
 *      - `ysort`       : A compare function to be used if the data is ordinal. 
 *                        Receives two object from an array in `data` for comparison. 
 *                        See <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Description>
 *      - `xconvert`    : A factor to multiply by each value returned by `x` before
 *                        plotting.
 *      - `yconvert`    : A factor to multiply by each value returned by `y` before
 *                        plotting.
 *      - `type`        : An accessor function. Should return the value to be used 
 *                        in the legend. Default returns d["type"].
 *      - `id:`         : An accessor function. Should return a unique ID for the 
 *                        piece of data. Default returns d["id"].
 *      - `label`       : An accessor function. Should return a string to be
 *                        used as a label.
 *      - `onClick`     : A function to be called when clicking on a particular
 *                        data object, if the plot is in 'inspect' mode. The function
 *                        is passed the data associated with that data object.
 *      - `showLegend`  : Boolean. Whether or not to show the legend. Default is true.
 *
 */
function GeneralPlot(data, opts){

    // -- Accessors -- 
    this.type = (opts.type) ? opts.type : function(d){ return d.type; };
    this.id = (opts.id) ? opts.id : function(d){ return d.id; };
    this.x = (opts.x) ? opts.x : function(d){ return d.x; };
    this.xsort = (opts.xsort) ? opts.xsort : undefined;
    this.y = (opts.y) ? opts.y : function(d){ return d.y; };
    this.ysort = (opts.ysort) ? opts.ysort : undefined;
    this.dataMouseClick = (opts.onClick) ? opts.onClick : function(){console.warn('No click function')};
    this.label = (opts.label) ? opts.label : function(){return "";};
    this.showlegend = (opts.showlegend!=undefined) ? opts.showlegend : true;
    this.topgroupoffset = {x: 0, y: 0};
    this.containeroffset = {x: 0, y: 0};

    this.xconvert = (opts.xconvert) ? opts.xconvert : 1;
    this.yconvert = (opts.yconvert) ? opts.yconvert : 1;
    this.factorX();
    this.factorY();

    this.setData(data);
    this.hidden = {
        right : false,
        left  : false,
        above : false,
        below : false
    }

    // -- Canvas --
    this.container = d3.select(opts.container);
    this.container.data([this]);

    this.legendwidth = this.getLegendWidth();

    this.margin = (opts.margin) ? opts.margin : {top: 30, right: 30, bottom: 30, left: 30};
    this.width = (opts.width) ? opts.width : $(opts.container).width();
    this.truewidth = this.width - this.margin.right - this.legendwidth - this.margin.left;
    this.height = (opts.height) ? opts.height : $(opts.container).height();
    this.trueheight = this.height-this.margin.top-this.margin.bottom;


    this.setupCanvas();
    this.setupColorScale();

    // Interaction
    this.onClick = null;
    this.zoomboxing = false;
    this.panning = false;
    this.radialopen = false;

    this.container.on('mousedown',this.clickDown);
    this.container.on('mousemove', this.mouseMove);
    this.container.on('mouseup',this.clickUp);

}

// -- Accessors {{

/* # `GeneralPlot.getDatakeys()`
 * # `GeneralPlot.getDatasets()`
 * ## Return
 *
 *  Returns an array of all the current dataset keys.
 *
 */
GeneralPlot.prototype.getDatakeys = function(){
    var keys = [];
    for (var key in this.data){
        keys.push(key);
    }
    return keys;
};
GeneralPlot.prototype.getDatasets = function(){
    var keys = [];
    for (var key in this.data){
        keys.push(key);
    }
    return keys;
};

/* # `GeneralPlot.getActiveDatasets()`
 *
 * ## Return
 *
 *  Returns an object whose keys are the dataset
 *  keys and whose value is whether or not the 
 *  dataset currently has any data in it.
 *
 */
GeneralPlot.prototype.getActiveDatasets = function(){
    var temp = new Object();
    var datasets = this.getDatasets();
    for (var i = 0; i<datasets.length; i++){
        temp[datasets[i]] = this.data[datasets[i]] != 0;
    }
    return temp;
};

/* # `GeneralPlot.getUniqueFromData(accessor)`
 *
 * Using the supplied accessor function, get all unique
 * values that it returns from the data in the plot.
 *
 * ## Arguments
 *  - `accessor`    : An accessor function which returns
 *                    a comparable value, e.g., a string.
 *
 *  ## Return
 *
 *   Returns an array of the unique values.
 *
 */
GeneralPlot.prototype.getUniqueFromData = function(accessor){
    var vals = d3.set();
    for (key in this.data){
        for (d in this.data[key]){
            val = accessor(this.data[key][d]);
            if (val instanceof Array){
                for (i in val){
                    vals.add(val[i]);
                }
            } else {
                vals.add(val);
            }
        }
    }
    return vals.values();
}

/* # `GeneralPlot.getLegendWidth()`
 *
 * Determines what the width of the legend will be.
 *
 * ## Return
 *
 *  Returns the width, in pixels, of the legend.
 *
 */
GeneralPlot.prototype.getLegendWidth = function(){
    // Construct temporary legend to determine the width it should be
    var dy = 20;
    var legend = this.container.append('g')
        .attr('class', 'temp_legend');
    var _this = this;

    legend.append('rect')
        .attr({
            x: 0, y: 0, rx: 4, ry: 4,
            width : 10,
            height : dy*this.datatypes.length
        });

    var items = legend.selectAll('g').data(this.datatypes).enter()
        .append('g');

    console.log(this);
//    var symbol="circle";
//    items.append('path')
//        .attr("d", d3.svg.symbol()
//            .type( function(d) {
//                console.log(this);
//                return symbol }).size(20))
//        .attr({
//            "x":10,
//            "y":function(d,i){return 10+i*dy;}
//        });
    items.append('circle')
        .attr({
            cx: 10, cy: function(d,i){return 10 + i*dy;},
            r: 4
        });
console.log(this);
    items.append('text')
        .attr('x', 20)
        .attr('y', function(d,i){return 9 + i*dy;})
        .attr('dy', '.35em')
        .style('text-anchor', 'left')
        .text(function(d){console.log(d); return d;});

    var maxwidth = 0;
    var texts = $('.temp_legend text').get();
    for (i in texts){
        var width = texts[i].getBBox().width + texts[i].getBBox().x;
        if (width > maxwidth){
            maxwidth = width;
        }
    }
    legend.remove();
    return maxwidth*1.1;
}

// -- }}

// -- Mutators {{

/* # `GeneralPlot.setXAccessor(x)`
 *
 * Change the x accessor for the plot. 
 *
 * ## Arguments
 *  - `x`   : An accessor function.
 *
 */
GeneralPlot.prototype.setXAccessor = function(x){
    this.x=x;
};
/* # `GeneralPlot.setYAccessor(y)`
 *
 * Change the y accessor for the plot. 
 *
 * ## Arguments
 *  - `y`   : An accessor function.
 *
 */
GeneralPlot.prototype.setYAccessor = function(y){
    this.y=y;
};

/* # `GeneralPlot.setYConvert(yconvert)`
 *
 * Change the y factor.
 *
 * ## Arguments
 *  - `yconvert` : A factor to multiply by each value returned by `y` before
 *                 plotting.
 *
 */
GeneralPlot.prototype.setYConvert = function(yconvert){
    if (typeof yconvert != "undefined"){
        this.yconvert = yconvert;
        if (this.yconvert != 1){
            var yy = this.y;
            var yc = this.yconvert;
            this.y = function(d) {
                return yy(d)*yc;
            }
        }
        if (this.yError != null){
            var ye = this.yError;
            this.yc = this.yconvert;
            this.yError = function(d) {
                return [ye(d)[0]*yc,ye(d)[1]*yc];
            }
        }
    }
}

/* # `GeneralPlot.setXConvert(xconvert)`
 *
 * Change the x factor.
 *
 * ## Arguments
 *  - `xconvert` : A factor to multiply by each value returned by `x` before
 *                 plotting.
 *
 */
GeneralPlot.prototype.setXConvert = function(xconvert){
    if (typeof xconvert != "undefined"){
        this.xconvert = xconvert;
        if (this.xconvert != 1){
            var xx = this.x;
            var xc = this.xconvert;
            this.x = function(d) {
                return xx(d)*xc;
            }
        }
        if (this.xError != null){
            var xe = this.xError;
            this.xc = this.xconvert;
            this.xError = function(d) {
                return [xe(d)[0]*xc,xe(d)[1]*xc];
            }
        }
    }
}

/* # `GeneralPlot.factorX()`
 *
 * __INTERNAL FUNCTION__
 *
 * Combine the current accessor function and the current factor
 * into a new accessor function.
 *
 */
GeneralPlot.prototype.factorX = function(){
    if (this.xconvert != 1){
        var xx = this.x;
        var xc = this.xconvert;
        this.x = function(d) {
            return xx(d)*xc;
        }
    }
}

/* # `GeneralPlot.factorY()`
 *
 * __INTERNAL FUNCTION__
 *
 * Combine the current accessor function and the current factor
 * into a new accessor function.
 *
 */
GeneralPlot.prototype.factorY = function(){
    if (this.yconvert != 1){
        var yy = this.y;
        var yc = this.yconvert;
        this.y = function(d) {
            return yy(d)*yc;
        }
    }
}

/* # `GeneralPlot.setXSort(xsort)`
 *
 * Change the compare function used for sorting ordinal data
 * on the x-axis.
 *
 * ## Arguments
 *  - `xsort`   : A compare function.
 *
 */
GeneralPlot.prototype.setXSort = function(xsort){
    this.xsort = xsort;
}
/* # `GeneralPlot.setYSort(ysort)`
 *
 * Change the compare function used for sorting ordinal data
 * on the y-axis.
 *
 * ## Arguments
 *  - `ysort`   : A compare function.
 *
 */
GeneralPlot.prototype.setYSort = function(ysort){
    this.ysort = ysort;
}

/* # `GeneralPlot.setData(data)`
 *
 * Change the data the plot is using and update the types
 * of data.
 *
 * ## Arguments
 *  - `data` : A new data object. See constructor.
 *
 */
GeneralPlot.prototype.setData = function(data){
    this.data = data;
    this.datatypes = d3.set(); // Will become an array

    // Get the types of the data (typically TR or RD, but can be anything)
    for (var key in this.data){
        for (var j = 0; j<data[key].length; j++){
            this.datatypes.add(this.type(data[key][j]));
        }
    }
    console.log(this.datatypes);
    this.datatypes = this.datatypes.values();
    console.log(this.datatypes);
};

/* # `GeneralPlot.setLabel(accessor)`
 *
 * Change the label accessor function.
 *
 * ## Arguments
 *  - `accessor` : An accessor function.
 *
 */
GeneralPlot.prototype.setLabel = function(accessor){
    this.label = accessor;
};

/* # `GeneralPlot.setupCanvas()`
 *
 * Prepare the canvas for drawing, removing an
 * old elements from previous plots.
 *
 */
GeneralPlot.prototype.setupCanvas = function(){
    if (this.canvas) this.canvas.remove();
    this.canvas = this.container.append('g');
};

/* # `GeneralPlot.setupColorScale()`
 *
 * __INTERNAL FUNCTION__
 *
 * Create a d3 color scale for color coding the different types.
 *
 */
GeneralPlot.prototype.setupColorScale = function(){
    this.color = d3.scale.category10();
    if (this.datatypes[0] == 'rd' && this.datatypes[1] == 'tr'){
        this.color.domain(['tr','rd']);
    } else {
        this.color.domain(this.datatypes);
    }
};

/* # `GeneralPlot.setOnClick(mode)`
 *
 * Change the mode of the plot.
 *
 * ## Arguments
 *  - `mode` : Mode of the plot to change to. Valid modes are:
 *             'inspect', 'zoom', and 'pan'.
 *
 */
GeneralPlot.prototype.setOnClick = function(mode){
    this.onClick = mode;
    if (mode == 'inspect'){
        this.elements.on('mousedown',this.dataMouseClick);
    } else {
        this.elements.on('mousedown',function(){});
    }
};

// -- }}

// -- Draw {{

/* # `GeneralPlot.draw()`
 *
 * Draw the plot. Draws the axes, then the data, then labels,
 * then legend.
 *
 */
GeneralPlot.prototype.draw = function(){
    this.drawAxes();
    this.drawData();
    this.drawLabels();
    if (this.showlegend){
        this.drawLegend();
    }
};
/* # `GeneralPlot.clearDraw()`
 *
 * Clears the plot for redrawing.
 *
 */
GeneralPlot.prototype.clearDraw = function(){
    d3.selectAll('.dataset').remove();
    d3.select('.legend').remove();
    d3.selectAll('.xaxis').remove();
    d3.selectAll('.yaxis').remove();
    d3.selectAll('defs').remove();
    d3.selectAll('.arrow').remove();
    d3.selectAll('.coordinates').remove();

    // Correct for any offsetting that was done to keep everything readable
    var x  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(this.container.select('g').attr('transform'));
    if (!x) x = 0;
    else x = x[1];
    var y  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(this.container.select('g').attr('transform'));
    if (!y) y = 0;
    else y = y[2];
    this.container.select('g').attr('transform', 'translate('+(x-this.topgroupoffset.x)+','+(y-this.topgroupoffset.y)+')');
    this.container.style('width', Number(this.container.style('width').slice(0,-2))-this.containeroffset.x);
    this.container.style('height', Number(this.container.style('height').slice(0,-2))-this.containeroffset.y);
    this.containeroffset.x=0;
    this.containeroffset.y=0;
    this.topgroupoffset.x=0;
    this.topgroupoffset.y=0;

};

/* # `GeneralPlot.drawLegend()`
 *
 * Draw the plot legend.
 *
 */
GeneralPlot.prototype.drawLegend = function(){
    var dy = 20;
    var legend = this.canvas.append('g')
        .attr('class', 'legend');
    var _this = this;
console.log(this);
    legend.append('rect')
        .attr({
            x: 0, y: 0, rx: 4, ry: 4,
            width : this.legendwidth-10,
            height : dy*this.datatypes.length,
            fill : 'rgba(120,120,120,0.3)'
//            stroke : '#000'
        });

    var items = legend.selectAll('g').data(this.datatypes).enter()
        .append('g');

    items.append('circle')
        .attr({
            cx: 10, cy: function(d,i){return 10 + i*dy;},
            r: 4,
            fill: this.color,
            stroke: function(d) { return darkenColor(_this.color(d),'3a');}
        });

    items.append('text')
        .attr('x', 20)
        .attr('y', function(d,i){return 9 + i*dy;})
        .attr('dy', '.35em')
        .style('text-anchor', 'left')
        .text(function(d){return d;});

    var maxwidth = 0;
    var texts = $('.legend text').get();
    for (i in texts){
        var width = texts[i].getBBox().width + texts[i].getBBox().x;
        if (width > maxwidth){
            maxwidth = width;
        }
    }
    this.legendwidth = maxwidth*1.1;

    legend.attr('transform', 'translate(' + (this.width-this.legendwidth) + ',' + this.margin.top + ')');

    legend.select('rect')
        .attr('width', this.legendwidth*0.95);
};

// -- }}

// -- Basic Interaction {{

/* # `GeneralPlot.clickDown(plot)`
 *
 * Trigger a mouse click down event on `plot`.
 *
 * ## Arguments
 *  - `plot` : The plot to trigger the event on.
 *
 */
GeneralPlot.prototype.clickDown = function(plot){
    var mouse = d3.mouse(this);
    if (plot.onClick == 'zoom'){
        plot.zoomBoxStart(mouse);
        plot.zoomboxing = true;
    } else if (plot.onClick == 'pan'){
        plot.panStart(mouse);
        plot.panning = true;
    } else {

    }
};

/* # `GeneralPlot.mouseMove(plot)`
 *
 * Trigger a mouse move event on `plot`.
 *
 * ## Arguments
 *  - `plot` : The plot to trigger the event on.
 *
 */
GeneralPlot.prototype.mouseMove = function(plot){
    var mouse = d3.mouse(this);
    if (plot.zoomboxing){
        plot.zoomBoxMove(mouse);
    } else if (plot.panning){
        plot.pan(mouse);
    }

    if (plot.onClick == 'pan'){
        $(this).css('cursor','move');
    } else if (plot.onClick == 'zoom'){
        $(this).css('cursor','crosshair');
    } else if (plot.onClick == 'inspect'){
        $(this).css('cursor','pointer');
    } else {
        $(this).css('cursor','default');
    }
};

/* # `GeneralPlot.clickUp(plot)`
 *
 * Trigger a mouse click release event on `plot`.
 *
 * ## Arguments
 *  - `plot` : The plot to trigger the event on.
 *
 */
GeneralPlot.prototype.clickUp = function(plot){
    var mouse = d3.mouse(this);
    if (plot.zoomboxing){
        plot.zoomBoxStop(mouse);
        plot.zoomboxing = false;
    } else if (plot.panning) {
        plot.panStop(mouse);
        plot.panning = false;
    } else {
    }
};

/* # `GeneralPlot.dataMouseOver(dot)`
 *
 * __INTERNAL FUNCTION__
 *
 * Called when the mouse moves over a data object `dot`
 * on the plot.
 *
 * ## Arguments
 *  - `dot` the data object that was moused over.
 *
 */
GeneralPlot.prototype.dataMouseOver = function(dot){
    var _this = d3.select(this.parentElement.parentElement.parentElement).data()[0]; // Get the plot data
    var thisG = d3.select(this);
    var thisDot = d3.select(this).select('.dot_circle');
    var fill = thisDot.style('fill');
    var stroke = thisDot.style('stroke');
    thisDot
        .attr('fill_color', fill)
        .style('fill', lightenColor(fill,'3a'))
        .attr('stroke_color', stroke)
        .style('stroke', lightenColor(stroke,'3a'));
    thisG.select('text').style('opacity',1);
    _this.container.append('g')
        .append('text')
        .text('x: '+_this.x(dot)+', y: '+_this.y(dot))
        .attr('text-anchor','start')
        .attr('x', 10)
        .attr('y', 15)
        .attr('class', 'coordinates');
};

/* # `GeneralPlot.dataMouseOut(dot)`
 *
 * __INTERNAL FUNCTION__
 *
 * Called when the mouse moves off a data object `dot`
 * on the plot.
 *
 * ## Arguments
 *  - `dot` the data object that the mouse is no longer over.
 *
 */
GeneralPlot.prototype.dataMouseOut = function(dot){
    var thisG = d3.select(this);
    var thisDot = d3.select(this).select('circle');
    thisDot.style('fill', d3.select(this).attr('fill_color'));
    thisDot.style('stroke', d3.select(this).attr('stroke_color'));
    thisG.select('text').style('opacity',0.4);
    d3.selectAll('.coordinates').remove();
};

/* # `GeneralPlot.radiallyDistribute(dot)`
 *
 * Temporarily spread out all the data objects around `dot` so they 
 * no longer overlap.
 *
 * ## Arguments
 *  - `dot` the data object at the center of the spread.
 *
 */
GeneralPlot.prototype.radiallyDistribute = function(dot){
    var _this = d3.select(this.parentElement.parentElement.parentElement).data()[0];
    if (_this.radialopen){
        _this.radialopen = false;
        d3.selectAll('.radiated').attr('transform', function (d){
            return 'translate(' + d3.select(this).attr('oldx') + ',' + d3.select(this).attr('oldy') + ')';
        })
            .attr('class', 'dot');
        d3.selectAll('.radial').remove();
        d3.select('.radial_area').remove();

    } else {
        _this.radialopen = true;
        $(this.parentElement).append(this);
        var thisG = d3.select(this);
        var thisDot = d3.select(this).select('circle');
        var thisGx  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(thisG.attr('transform'))[1];
        var thisGy  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(thisG.attr('transform'))[2];

        if (d3.select('.radial_area').empty()){

            // Get all nearby dots
            var nearbyDots = d3.selectAll('.dot').filter(function(d){
                var otherG = d3.select(this);
                var otherGx  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(otherG.attr('transform'))[1];
                var otherGy  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(otherG.attr('transform'))[2];

                return  (((Math.abs(thisGy - otherGy) < 7) && (Math.abs(thisGx - otherGx) < 7)) && (otherG[0][0]!=thisG[0][0]) );
            });

            if (!nearbyDots.empty()){
                var R = 30;
                var r = 20;
                //    var backdrop = d3.select(this.parentNode).insert('circle')
//                    .attr('r', R)
//                    .attr('class', 'radial_area')
//                    .attr('transform','translate('+thisGx+','+thisGy+')')[0][0];
                //   backdrop.ownerSVGElement.insertBefore(backdrop,backdrop.ownerSVGElement.firstChild);

                // Compute separation angle
                var delta = 2*Math.PI/nearbyDots[0].length;

                // Move hidden dots outward
                nearbyDots.attr('transform', function(d,i){
                    var dx = Number(thisGx)+r*Math.cos(i*delta+Math.PI/16);
                    var dy = Number(thisGy)+r*Math.sin(i*delta+Math.PI/16);
                    var oldx = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(d3.select(this).attr('transform'))[1];
                    var oldy = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(d3.select(this).attr('transform'))[2];
                    d3.select(this)
                        .attr('dx', r*Math.cos(i*delta+1.1*Math.PI/16))
                        .attr('dy', r*Math.sin(i*delta+1.1*Math.PI/16))
                        .attr('oldx', oldx)
                        .attr('oldy', oldy);
                    return 'translate(' + dx + ',' + dy + ')';
                })
                    .attr('class', 'dot radiated');

                // Connect outer dots to original location
                nearbyDots.append('line')
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('y2', function(d){ return -d3.select(this.parentNode).attr('dy');})
                    .attr('x2', function(d){ return -d3.select(this.parentNode).attr('dx'); })
                    .attr('class', 'radial');

                // Bring blocked dots forward
                for(var i = 0; i< nearbyDots[0].length; i++){
                    var d = nearbyDots[0][i];
                    d.parentNode.appendChild(d);
//                    $(nearbyDots[0][i].parentNode).append(nearbyDots[0][i]);
                }
//                $(thisDot[0][0].parentNode).append(thisDot[0][0]);

            }
        }
    }
}

// -- }}

/* # `TwoAxisPlot(data, opts)` 
 * ### inherits `GeneralPlot`
 *
 * A 'virutal class' for plotting data that uses two axes. Provides all
 * the expected functionality except actually drawing the data.
 *
 * ## Requires
 *  - jQuery >= v1.9.1, _Note_: Other versions of jQuery should work too, 
 *  but v1.9.1 was used when writing the library.
 *  - d3 = v3
 *
 * ## Arguments
 *  - `data` : See `GeneralPlot`
 *  - `opts` : Same as `GeneralPlot`, but adds the following options:
 *
 *      __Keys:__
 *
 *      - `xlabel`  : A string to display on the x-axis
 *      - `ylabel`  : A object which has the keys "text", and a background object
 *              -background: an array describing attributes to give the background.
 *      - `xError`  : An accessor function for retrieving uncertainty. 
 *                    Should return a two element array.
 *      - `yError`  : An accessor function for retrieving uncertainty. 
 *                    Should return a two element array.
 *
 */
function TwoAxisPlot(data, opts){
    GeneralPlot.call(this,data,opts);

    // Axes
    this.yaxis;
    this.xaxis;
    this.setupAxes();

    this.xlabel =(opts.xlabel) ? opts.xlabel : 'xaxis';
    this.xAxisLabelClick = (opts.xaxislabelclick) ? opts.xaxislabelclick : function(){console.log(this)};
    this.ylabel =(opts.ylabel) ? opts.ylabel : 'yaxis';
    this.yAxisLabelClick = (opts.yaxislabelclick) ? opts.yaxislabelclick : function(){console.log(this)};

    // Error
    this.xError = (opts.xError) ? opts.xError : null;
    this.yError = (opts.yError) ? opts.yError : null;

    if (!(this instanceof CurvePlot)){
        if (this.xError != null){
            var xe = this.xError;
            var xc = this.xconvert;
            this.xError = function(d) {
                return [xe(d)[0]*xc,xe(d)[1]*xc];
            }
        }
        if (this.yError != null){
            var ye = this.yError;
            var yc = this.yconvert;
            this.yError = function(d) {
                return [ye(d)[0]*yc,ye(d)[1]*yc];
            }
        }
    }
    if (this.yaxis instanceof DiscreteAxis){
        this.yError = null;
    }
    if (this.xaxis instanceof DiscreteAxis){
        this.xError = null;
    }


    // Zooming
    this.xaxisparentstack = new Array();
    this.yaxisparentstack = new Array();

    this.xviewstack = new Array();
    this.yviewstack = new Array();
}
// Javascript inheritance
TwoAxisPlot.prototype = Object.create(GeneralPlot.prototype);
TwoAxisPlot.prototype.constructor = TwoAxisPlot;

// -- Accessors {{

/* # `TwoAxisPlot.getActiveData()`
 *
 * Retrieve a new data object which only contains the data within
 * the current 'view', i.e. magnified region.
 *
 * ## Return
 *
 *  A data object of the same shape as passed in, but with only
 *  data that should be visible.
 *
 */
TwoAxisPlot.prototype.getActiveData = function(){
    var data = new Object();
    this.hidden = {
        right : false,
        left : false,
        above : false,
        below : false
    }
    for (key in this.data){
        data[key] = new Array();
        for (i in this.data[key]){
            var datum = this.data[key][i];
            if (this.yaxis.inDomain(this.y(datum)) && this.xaxis.inDomain(this.x(datum))){
                data[key].push(datum);
            } else {
                if (!this.hidden.right && this.xaxis.aboveDomain(this.x(datum))){
                    this.hidden.right = true;
                } else if (!this.hidden.left && this.xaxis.belowDomain(this.x(datum))){
                    this.hidden.left = true;
                }
                if (!this.hidden.below && this.yaxis.belowDomain(this.y(datum))){
                    this.hidden.below = true;
                } else if (!this.hidden.above && this.yaxis.aboveDomain(this.y(datum))){
                    this.hidden.above = true;
                }
            }
        }
        if (data[key].length == 0){
            delete data[key];
        }
    }
    return data;
};

/* # `TwoAxisPlot.dataIsBelow()`
 *
 * ## Return
 *
 *  Boolean. Whether data is below the current view.
 *
 */
TwoAxisPlot.prototype.dataIsBelow = function(){
    return this.hidden.below;
};
/* # `TwoAxisPlot.dataIsAbove()`
 *
 * ## Return
 *
 *  Boolean. Whether data is above the current view.
 *
 */
TwoAxisPlot.prototype.dataIsAbove = function(){
    return this.hidden.above;
};
/* # `TwoAxisPlot.dataIsLeft()`
 *
 * ## Return
 *
 *  Boolean. Whether data is left of the current view.
 *
 */
TwoAxisPlot.prototype.dataIsLeft = function(){
    return this.hidden.left;
};
/* # `TwoAxisPlot.dataIsRight()`
 *
 * ## Return
 *
 *  Boolean. Whether data is right of the current view.
 *
 */
TwoAxisPlot.prototype.dataIsRight = function(){
    return this.hidden.right;
};

// -- }}

// -- Mutators {{

/* # `TwoAxisPlot.setXLabel(xlabel)`
 *
 * ## Arguments
 *  - `xlabel`  : A string to label the x-axis with.
 *
 */
TwoAxisPlot.prototype.setXLabel = function(xlabel){
    this.xlabel = xlabel;
};
/* # `TwoAxisPlot.setYLabel(ylabel)`
 *
 * ## Arguments
 *  - `ylabel`  : A string to label the y-axis with.
 *
 */
TwoAxisPlot.prototype.setYLabel = function(ylabel){
    this.ylabel = ylabel;
};

/* # `TwoAxisPlot.setupAxes()`
 *
 * Use the current data to setup the axes including determining 
 * their type and range.
 *
 */
TwoAxisPlot.prototype.setupAxes = function(){
    // Flatten the data
    var concatdata = new Array();
    for (var key in this.data){
        for (var j=0; j<this.data[key].length; j++){
            concatdata.push(this.data[key][j]);
        }
    }

    var xrange = [0,this.truewidth];
    var yrange = [this.trueheight, 0];

    // Determine if axes should be ordinal or quantitative
    for (var i = 0; i<concatdata.length; i++){
        if (this.x(concatdata[i]) != null && this.x(concatdata[i]) != undefined){
            if (isNaN(this.x(concatdata[i]))){
                this.xaxis = new DiscreteAxis(concatdata, xrange, {
                    container : '.xaxis',
                    orient : 'bottom',
                    accessor : this.x,
                    sort : this.xsort
                });
            } else {
                this.xaxis = new ContinuousAxis(concatdata, xrange, {
                    container : '.xaxis',
                    orient : 'bottom',
                    accessor : this.x
                });
            }
            break;
        }
    }

    for (var i = 0; i<concatdata.length; i++){
        if (this.y(concatdata[i]) != null && this.y(concatdata[i]) != undefined){
            if (isNaN(this.y(concatdata[i]))){
                this.yaxis = new DiscreteAxis(concatdata, yrange, {
                    container : '.yaxis',
                    orient : 'left',
                    accessor : this.y,
                    sort: this.ysort
                });
            } else {
                this.yaxis = new ContinuousAxis(concatdata, yrange, {
                    container : '.yaxis',
                    orient : 'left',
                    accessor : this.y
                });
            }
            break;
        }
    }
};

/* # `TwoAxisPlot.setAxisDomains(x,y)`
 *
 * Manually change the axes domains. If the axis is quantitative,
 * the array should have two elements. If it is ordinal, it should
 * contain all unique elements for the axis.
 *
 * ## Arguments
 *  - `x` : An array. The new domain for the x-axis.
 *  - `y` : An array. The new domain for the y-axis.
 *
 */
TwoAxisPlot.prototype.setAxisDomains = function(x,y){
    this.setXAxisDomain(x);
    this.setYAxisDomain(y);
};
/* # `TwoAxisPlot.setYAxisDomain(y)`
 *
 * Manually change the y-axis domain.
 *
 * ## Arguments
 *  - `y` : An array. The new domain for the y-axis.
 *
 */
TwoAxisPlot.prototype.setYAxisDomain = function(y){
    // d3 axes
    this.yaxis.setDomain(y);
};
/* # `TwoAxisPlot.setXAxisDomain(x)`
 *
 * Manually change the x-axis domain.
 *
 * ## Arguments
 *  - `x` : An array. The new domain for the x-axis.
 *
 */
TwoAxisPlot.prototype.setXAxisDomain = function(x){
    // d3 axes
    this.xaxis.setDomain(x);
};

// -- }}

// -- Draw {{

/* # `TwoAxisPlot.drawAxes()`
 *
 * Draw the axes and grid lines for the plot without 
 * modifying their state.
 *
 */
TwoAxisPlot.prototype.drawAxes = function(){
    this.drawXAxis("x_axis_label");

//    if(this.ylabel.background && this.ylabel.background.length>0){
        this.drawYAxis('y_axis_label');
//        console.log("going")
//        this.drawBackgroundBox(d3.select('.baseLayerRemove')[0][0]);
//    }
//    this.drawYAxis();
    //console.log(this)

    this.drawGridLines(d3.select('.xaxis'), d3.select('.yaxis'));
};



/*
 *This gets teh data types from two axis plots
*/
TwoAxisPlot.prototype.setData = function(data){
    this.data = data;
    var datatypes=[];
    this.datatypes = []; // Will become an array
    for (var key in this.data){
        for( var k in this.data[key]) {
                datatypes.push({
                    text:k,
                    symbol: this.data[key][k].symbol
                });
        }
    }
    this.datatypes =datatypes;// this.datatypes.values();
};
/*
 *This will handle the uniqe data structure required to get the shapes form a two axis plot
 */
TwoAxisPlot.prototype.drawLegend = function(){
    var dy = 20;
    var legend = this.canvas.append('g')
        .attr('class', 'legend');
    var _this = this;
    legend.append('rect')
        .attr({
            x: 0, y: 0, rx: 4, ry: 4,
            width : this.legendwidth-10,
            height : dy*this.datatypes.length,
            fill : 'rgba(120,120,120,0.3)'
//            stroke : '#000'
        });

    var items = legend.selectAll('g').data(this.datatypes).enter()
        .append('g');


    items.append('path')
        .attr("d", d3.svg.symbol()
            .type( function(d) {
                var symbol="circle";
                if(d.symbol!=undefined) {
                    symbol = d.symbol;
                }
                return symbol }).size(20))
        .attr({
            "transform":function(d, i){return "translate( 10, "+(10+i*dy)+")";},
            // "x":10,
            //"y":function(d,i){console.log(10+i*dy);return 10+i*dy;},
            "fill":function(d){return _this.color(d.text);},
            stroke: function(d) { return darkenColor(_this.color(d.text),'3a');}
        });
//
//    items.append('circle')
//        .attr({
//            cx: 10, cy: function(d,i){return 10 + i*dy;},
//            r: 4,
//            fill: function(d){return _this.color(d.text);},
//
//        });

    items.append('text')
        .attr('x', 20)
        .attr('y', function(d,i){return 9 + i*dy;})
        .attr('dy', '.35em')
        .style('text-anchor', 'left')
        .text(function(d){
            return d.text;});

    var maxwidth = 0;
    var texts = $('.legend text').get();
    for (i in texts){
        var width = texts[i].getBBox().width + texts[i].getBBox().x;
        if (width > maxwidth){
            maxwidth = width;
        }
    }
    this.legendwidth = maxwidth*1.1;

    legend.attr('transform', 'translate(' + (this.width-this.legendwidth) + ',' + this.margin.top + ')');

    legend.select('rect')
        .attr('width', this.legendwidth*0.95);
};
/*
 * creates a fake legend to size it properly
 */
TwoAxisPlot.prototype.getLegendWidth = function(){
    // Construct temporary legend to determine the width it should be
    var dy = 20;
    var legend = this.container.append('g')
        .attr('class', 'temp_legend');
    var _this = this;

    legend.append('rect')
        .attr({
            x: 0, y: 0, rx: 4, ry: 4,
            width : 10,
            height : dy*this.datatypes.length
        });

    var items = legend.selectAll('g').data(this.datatypes).enter()
        .append('g');

    var symbol="circle";
    items.append('path')
        .attr("d", d3.svg.symbol()
            .type( function(d) {
                if(d.symbol!=undefined) {
                    symbol = d.symbol;
                }
                return symbol }).size(20))
        .attr({
            "x":10,
            "y":function(d,i){return 10+i*dy;}
        });
//    items.append('circle')
//        .attr({
//            cx: 10, cy: function(d,i){return 10 + i*dy;},
//            r: 4
//        });

    items.append('text')
        .attr('x', 20)
        .attr('y', function(d,i){return 9 + i*dy;})
        .attr('dy', '.35em')
        .style('text-anchor', 'left')
        .text(function(d){return d.text;});

    var maxwidth = 0;
    var texts = $('.temp_legend text').get();
    for (i in texts){
        var width = texts[i].getBBox().width + texts[i].getBBox().x;
        if (width > maxwidth){
            maxwidth = width;
        }
    }
    legend.remove();
    return maxwidth*1.1;
}


/* TwoAxisPlot.drawBackgroundBox()
 *
 * draw a background box around an element.
 *
 */
TwoAxisPlot.prototype.drawBackgroundBox=function(element, attrs){
    var bbox = element.getBBox();
//    var ctm = element.getCTM();

//    var setTM = function(element, m) {
//        return element.transform.baseVal.initialize(element.ownerSVGElement.createSVGTransformFromMatrix(m));
//    };

//    console.log(ctm);
    var parent = d3.select(element.parentNode);
    var className="."+$(element).attr("class");
    var rect= parent.insert("rect",className)
        .attr("x", bbox.x)
        .attr("y", bbox.y)
        .attr("width", bbox.width)
        .attr("height", bbox.height)
        .attr("fill","White")
        .attr(attrs);        ;
//        .attr("transform", transform);

//    setTM(rect[0][0], ctm);

}
/* # `TwoAxisPlot.drawXAxis()`
 *
 * Draw the x-axis, without modifying its state.
 *
 */
TwoAxisPlot.prototype.drawXAxis = function(className){
    // Create the svg containers for the axes
    var xtransform = 'translate(' + this.margin.left + ',' + (this.height - this.margin.bottom) + ')';

    var xaxisg = this.canvas.append('g')
        .attr('transform', xtransform)
        .attr('class', 'xaxis');
    this.xaxis.drawAxis();

    xaxisg.selectAll('text')
        .attr('transform', 'rotate(75)translate(15,-10)')
        .style('text-anchor', 'start');

    var xlabeltransform = 'translate('
        + (this.truewidth - this.xlabel.text.length*6)
        + ',-8)';

    var text = xaxisg.append('text')
        .text(this.xlabel.text)
        .attr('transform', xlabeltransform)
        .attr('class', className);

    var backgroundAttrs = this.xlabel.background;
    backgroundAttrs.transform =xlabeltransform;
    this.drawBackgroundBox(text[0][0], backgroundAttrs );
    // Interaction
    $(this.xaxis.container + ' .tick.major').on('click', this.xAxisLabelClick);

    // Check to see if the labels on the axes are hidden and fix them if they are
    var oversize = 0;

    // Get the height of the area currently allocated for displaying tick labels
    var xaxisy = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(xaxisg.attr('transform'))[2];
    var padding = Math.abs(Number(this.container.style('height').slice(0,-2)) - xaxisy);

    xaxisg.selectAll('text').each(function(){
        // Compare the current height with how much is needed, finding the largest deficiency if one exists
        var h = Math.abs(this.getBBox().width)+10;
        if (h > padding) {
            var temp = Math.abs(h - padding);
            if (temp > oversize){
                oversize = temp;
            }
        }
    });
    if (oversize > 0){
        // Grow the top level SVG group so we can see everything
        this.container.style('height', Number(this.container.style('height').slice(0,-2))+oversize);
        this.containeroffset.y+=oversize;
    }
};
/* # `TwoAxisPlot.drawYAxis()`
 *
 * Draw the y-axis, without modifying its state.
 *
 */
TwoAxisPlot.prototype.drawYAxis = function(labelClassName){
    if(!labelClassName){
        labelClassName="yAxisLabel";
    }

    //console.log(this);
    var ytransform = 'translate('
        + this.margin.left
        + ','
        + this.margin.top
        + ') ';
    var yaxisg = this.canvas.append('g')
        .attr('transform', ytransform)
        .attr('class', 'yaxis yaxisLabelGroup');
    this.yaxis.drawAxis();
    var labelTransform = 'rotate(90)translate(0,-8)'
    var text = yaxisg.append('text')
        .text(this.ylabel.text)
        .attr('transform', labelTransform )
        .attr('class',labelClassName);

    var backgroundAttrs = this.ylabel.background;
    backgroundAttrs.transform = labelTransform;
    this.drawBackgroundBox(text[0][0], backgroundAttrs );
    // Interaction
    $(this.yaxis.container + ' .tick.major').on('click', this.yAxisLabelClick);

    // Get the width of the area currently allocated for displaying tick labels on the yaxis
    var yaxisx = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(yaxisg.attr('transform'))[1];

    // Check to see if the labels on the axes are hidden and fix them if they are
    var oversize = 0;
    yaxisg.selectAll('text').each(function(){
        // Compare the current width available with how much is needed, finding the largest deficiency if one exists
        if (Math.abs(this.getBBox().x) > yaxisx) {
            var temp = Math.abs(Math.abs(this.getBBox().x) - yaxisx);
            if (temp > oversize){
                oversize = temp;
            }
        }
    });
    if (oversize > 0){
        // Get the current displacement of the top svg group
        var transform = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(this.container.select('g').attr('transform'));
        if (!transform) transform = [0,0,0];
        //  Compute the new displacement
        var x = Number(oversize) + Number(transform[1]);
        var y = transform[2];
        // Translate the top svg group 
        this.container.select('g').attr('transform', 'translate('+x+','+y+')');
        // Grow the top level SVG element so we can see everything
        this.container.style('width', Number(this.container.style('width').slice(0,-2))+x);
        // Update the offset of the top svg group and the svg element
        this.topgroupoffset.x+=x;
        this.containeroffset.x+=x;
    }
};
/* # `TwoAxisPlot.drawGridLines(xaxisg, yaxisg)`
 *
 * Draw the plot gridlines.
 *
 * ## Arguments
 *  - `xaxisg` : The container that holds the x-axis.
 *  - `yaxisg` : The container that holds the y-axis.
 *
 */
TwoAxisPlot.prototype.drawGridLines = function(xaxisg, yaxisg){
    this.drawXGridLines(xaxisg);
    this.drawYGridLines(yaxisg);
};
/* # `TwoAxisPlot.drawXGridLines(xaxisg)`
 *
 * Draw gridlines perpindicular to the x-axis.
 *
 * ## Arguments
 *  - `xaxisg` : The container that holds the x-axis.
 *
 */
TwoAxisPlot.prototype.drawXGridLines = function(xaxisg){
    xaxisg.selectAll('g').append('line')
        .attr('class', 'gridline')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', -this.trueheight)
        .style('stroke','#aaa');
};
/* # `TwoAxisPlot.drawYGridLines(yaxisg)`
 *
 * Draw gridlines perpindicular to the y-axis.
 *
 * ## Arguments
 *  - `yaxisg` : The container that holds the y-axis.
 *
 */
TwoAxisPlot.prototype.drawYGridLines = function(yaxisg){
    yaxisg.selectAll('g').append('line')
        .attr('class', 'gridline')
        .attr('x1', 0)
        .attr('x2', this.truewidth)
        .attr('y1', 0)
        .attr('y2', 0)
        .style('stroke','#aaa');
};

// -- }}

// -- Interaction {{

/* # `TwoAxisPlot.zoom(xview, yview)`
 *
 * Magnify the plot to only show the view specified by `xview`
 * and `yview`. Will redraw the plot.
 *
 * ## Arguments
 *  - `xview` : An array containing the endpoints of the new
 *              view for the x-axis. 
 *  - `yview` : An array containing the endpoints of the new
 *              view for the y-axis. 
 *
 *  __Note__  : If the axis is continuous, expects numbers. If
 *              discrete, it expects discrete values that belong in 
 *              the domain.
 *
 */
TwoAxisPlot.prototype.zoom = function(xview, yview){
    this.xZoom(xview);
    this.yZoom(yview);
    this.clearDraw();
    this.draw();
};
/* # `TwoAxisPlot.xZoom(xview)`
 *
 * Magnify the x-axis  to only show the view specified by `xview`.
 * Recomputes the panning scale for smooth panning and pushes the 
 * current xview onto the view stack.
 *
 * ## Arguments
 *  - `xview` : An array containing the endpoints of the new
 *              view for the x-axis. 
 *
 */
TwoAxisPlot.prototype.xZoom = function(xview){
    var xaxisparent = this.xaxis;

    this.xaxisparentstack.push(xaxisparent);

    this.xaxis = xaxisparent.getSubAxis(xview);

    xaxisparent.computePanScale(this.xaxis);

    if (isNaN(xview[0])){
        xview = [xaxisparent.scale(xview[0]),xaxisparent.scale(xview[1])];
    }
    this.xviewstack.push(xview);
};
/* # `TwoAxisPlot.yZoom(yview)`
 *
 * Magnify the y-axis  to only show the view specified by `yview`.
 * Recomputes the panning scale for smooth panning and pushes the 
 * current yview onto the view stack.
 *
 * ## Arguments
 *  - `yview` : An array containing the endpoints of the new
 *              view for the y-axis. 
 *
 */
TwoAxisPlot.prototype.yZoom = function(yview){
    var yaxisparent = this.yaxis;

    this.yaxisparentstack.push(yaxisparent);

    this.yaxis = yaxisparent.getSubAxis(yview);

    yaxisparent.computePanScale(this.yaxis);

    if (isNaN(yview[0])){
        yview = [yaxisparent.scale(yview[0]),yaxisparent.scale(yview[1])];
    }

    this.yviewstack.push(yview);
};
/* # `TwoAxisPlot.zoomOut()`
 *
 * Set the view to either the view on the top of the view stack or,
 * if the view stack is empty, recompute the axes' domains to ensure
 * all data is visible (useful for when changing the dataset).
 *
 * ## Return
 *
 *  Returns true if the view changed, false otherwise.
 *
 */
TwoAxisPlot.prototype.zoomOut = function(){
    if (this.xaxisparentstack.length != 0 && this.yaxisparentstack.length != 0 && this.xviewstack.length != 0 && this.yviewstack.length != 0){
        this.xaxis = this.xaxisparentstack.pop();
        this.yaxis = this.yaxisparentstack.pop();

        this.xviewstack.pop();
        this.yviewstack.pop();

        this.clearDraw();
        this.draw();

        return true;
    } else {
        for (var key in this.data){
            for (var i in this.data[key]){
                if(!this.xaxis.inDomain(this.x(this.data[key][i])) || !this.yaxis.inDomain(this.y(this.data[key][i])))
                {
                    this.clearDraw();
                    this.setupAxes();
                    this.draw();
                    return true;
                }
            }
        }
        return false;
    }
};

/* # `TwoAxisPlot.zoomBoxStart(d3mouseevent)`
 *
 * Start tracking mouse motion and create the view box 
 * for selecting a new view. 
 *
 * ## Arguments
 *  - `d3mouseevent` : The d3 on click mouse event corresponding to 
 *                     the start coordinates of the new view.
 *
 */
TwoAxisPlot.prototype.zoomBoxStart = function(d3mouseevent){
    var loc = d3mouseevent;
    this.container.append('line')
        .attr('id', 'zoom_box_left')
        .attr('class', 'select_line')
        .attr('x1', loc[0])
        .attr('y1', loc[1])
        .attr('x2', loc[0])
        .attr('y2', loc[1]);
    this.container.append('line')
        .attr('id', 'zoom_box_top')
        .attr('class', 'select_line')
        .attr('x1', loc[0])
        .attr('y1', loc[1])
        .attr('x2', loc[0])
        .attr('y2', loc[1]);
    this.container.append('line')
        .attr('id', 'zoom_box_right')
        .attr('class', 'select_line')
        .attr('x1', loc[0])
        .attr('y1', loc[1])
        .attr('x2', loc[0])
        .attr('y2', loc[1]);
    this.container.append('line')
        .attr('id', 'zoom_box_bot')
        .attr('class', 'select_line')
        .attr('x1', loc[0])
        .attr('y1', loc[1])
        .attr('x2', loc[0])
        .attr('y2', loc[1]);
    this.zoomStart = loc;
};

/* # `TwoAxisPlot.zoomBoxMove(d3mouseevent)`
 *
 * Track the mouse motion and update the view box
 * around the view currently selected by the mouse.
 *
 * ## Arguments
 *  - `d3mouseevent` : The d3 on move mouse event corresponding to 
 *                     the new position of the mouse.
 *
 */
TwoAxisPlot.prototype.zoomBoxMove = function(d3mouseevent){
    var left = d3.select('#zoom_box_left');
    var top = d3.select('#zoom_box_top');
    var right = d3.select('#zoom_box_right');
    var bot = d3.select('#zoom_box_bot');
    if (!left.empty()){
        var loc = d3mouseevent;
        left.attr('y2', loc[1]);
        top.attr('x2', loc[0]);
        bot.attr('y1', loc[1]).attr('y2', loc[1]).attr('x2', loc[0]);
        right.attr('x1', loc[0]).attr('x2', loc[0]).attr('y1', loc[1]);
    }
};

/* # `TwoAxisPlot.zoomBoxStop(d3mouseevent)`
 *
 * Process the selected view as a new view for the plot and zoom
 * the plot into this view.
 *
 * ## Arguments
 *  - `d3mouseevent` : The d3 on release mouse event corresponding to 
 *                     the end coordinates of the new view.
 *
 */
TwoAxisPlot.prototype.zoomBoxStop = function(d3mouseevent){
    var loc = d3mouseevent;
    var y = d3.select('#zoom_box_left');
    var x = d3.select('#zoom_box_top');

    var y_min = Number(y.attr('y1')) - this.margin.top;
    var y_max = Number(y.attr('y2')) - this.margin.top;
    var x_min = Number(x.attr('x1')) - this.margin.left - this.topgroupoffset.x;
    var x_max = Number(x.attr('x2')) - this.margin.left - this.topgroupoffset.x;

    d3.selectAll('.select_line').remove();
    if (Math.abs(y_min-y_max) > 3 && Math.abs(x_min-x_max) > 3){
        this.zoom([x_min,x_max],[y_min,y_max]);
    }
};

/* # `TwoAxisPlot.zoomMAD(devs)`
 *
 * Compute the median absolute deviation for any continuous scales
 * and change the view to display data within `devs` deviations 
 * of the MAD. <http://en.wikipedia.org/wiki/Median_absolute_deviation>
 *
 * ## Arguments
 *  - `devs`    : Number of deviations to show. Defaults to 1.4826.
 *
 */
TwoAxisPlot.prototype.zoomMAD = function(devs){
    if (!devs) devs = 1.4826;
    this.zoom(this.getMADx(devs),this.getMADy(devs));
};
/* # `TwoAxisPlot.getMADx(devs)`
 *
 * If the x-axis is continuous, compute the median absolute deviation
 * and return the view to display data within `devs` deviations 
 * of the MAD. Otherwise return the current view.
 *
 * ## Arguments
 *  - `devs`    : Number of deviations to show. Defaults to 1.4826.
 *
 * ## Return
 * 
 *  The new computed view.
 *
 */
TwoAxisPlot.prototype.getMADx = function(devs){
    if (this.xaxis instanceof ContinuousAxis){
        var domain = this.xaxis.computeMADRange(devs);
        var x_min = this.xaxis.scale(domain[0]);
        var x_max = this.xaxis.scale(domain[1]);
        return [x_min,x_max];
    } else {
        return this.xaxis.getRange();
    }
};
/* # `TwoAxisPlot.getMADy(devs)`
 *
 * If the y-axis is continuous, compute the median absolute deviation
 * and return the view to display data within `devs` deviations 
 * of the MAD. Otherwise return the current view.
 *
 * ## Arguments
 *  - `devs`    : Number of deviations to show. Defaults to 1.4826.
 *
 * ## Return
 * 
 *  The new computed view.
 * ## Arguments
 *
 * ## Return
 *
 */
TwoAxisPlot.prototype.getMADy = function(devs){
    if (this.yaxis instanceof ContinuousAxis){
        var domain = this.yaxis.computeMADRange(devs);
        var y_min = this.yaxis.scale(domain[0]);
        var y_max = this.yaxis.scale(domain[1]);
        return [y_min,y_max];
    } else {
        return this.yaxis.getRange();
    }
};
/* # `TwoAxisPlot.zoomIQR()`
 *
 * Change the view of any continuous axes to show only data that 
 * falls within the interquartile range.
 *
 */
TwoAxisPlot.prototype.zoomIQR = function(){
    this.zoom(this.getIQRx(),this.getIQRy());
};
/* # `TwoAxisPlot.getIQRx()`
 *
 * Compute the xview that only shows data within the interquartile
 * range if the x-axis is continuous. Otherwise return the current 
 * view.
 *
 * ## Return
 *
 *  The new view.
 *
 */
TwoAxisPlot.prototype.getIQRx = function(){
    if (this.xaxis instanceof ContinuousAxis){
        var domain = this.xaxis.computeIQR();
        var x_min = this.xaxis.scale(domain[0]);
        var x_max = this.xaxis.scale(domain[1]);
        return [x_min,x_max];
    } else {
        return this.xaxis.getRange();
    }
};
/* # `TwoAxisPlot.getIQRy()`
 *
 * Compute the yview that only shows data within the interquartile
 * range if the y-axis is continuous. Otherwise return the current 
 * view.
 *
 * ## Return
 *
 *  The new view.
 *
 */
TwoAxisPlot.prototype.getIQRy = function(){
    if (this.yaxis instanceof ContinuousAxis){
        var domain = this.yaxis.computeIQR();
        var y_min = this.yaxis.scale(domain[0]);
        var y_max = this.yaxis.scale(domain[1]);
        return [y_min,y_max];
    } else {
        return this.yaxis.getRange();
    }
};
/* # `TwoAxisPlot.zoomDiscrete()`
 *
 * If an axis is discrete and its currently visible domain contains
 * edge values for which no data is displayed, change the view so it
 * no longer displays those edge values.
 *
 */
TwoAxisPlot.prototype.zoomDiscrete = function(){
    this.zoom(this.getDiscreteZoomX(),this.getDiscreteZoomY());
};
/* # `TwoAxisPlot.getDiscreteZoomX()`
 *
 * Change the view so it no longer displays those edge values if the
 * x-axis is discrete.
 * 
 * ## Return
 *
 *  The new view.
 *
 */
TwoAxisPlot.prototype.getDiscreteZoomX = function(){
    if (this.xaxis instanceof DiscreteAxis){
        var data = plot.getActiveData();
        var xvals = new Array();
        for (var key in data){
            for (var i in data[key]){
                xvals.push(this.x(data[key][i]));
            }
        }
        xvals.sort(this.xsort);
        return [xvals[0],xvals[xvals.length-1]];
    } else {
        return this.xaxis.getRange();
    }
};
/* # `TwoAxisPlot.getDiscreteZoomY()`
 *
 * Change the view so it no longer displays those edge values if the
 * y-axis is discrete.
 * 
 * ## Return
 *
 *  The new view.
 *
 */
TwoAxisPlot.prototype.getDiscreteZoomY = function(){
    if (this.yaxis instanceof DiscreteAxis){
        var data = plot.getActiveData();
        var yvals = new Array();
        for (var key in data){
            for (var i in data[key]){
                yvals.push(this.y(data[key][i]));
            }
        }
        yvals.sort(this.ysort);
        return [yvals[0],yvals[yvals.length-1]];
    } else {
        return this.yaxis.getRange();
    }
};
/* # `TwoAxisPlot.panStart(xpanstart,ypanstart)`
 *
 * Put the plot into panning mode and record the initial position of the
 * mouse as `xpanstart` and `ypanstart`.
 *
 * ## Arguments
 *  - `xpanstart`   : The initial x-coordinate of the mouse.
 *  - `ypanstart`   : The initial y-coordinate of the mouse.
 *
 */
TwoAxisPlot.prototype.panStart = function(xpanstart,ypanstart){
    if (xpanstart instanceof Array){
        ypanstart = xpanstart[1];
        xpanstart = xpanstart[0];
    }
    this.xpanstart = xpanstart;
    this.ypanstart = ypanstart;
    $('.arrow').animate({opacity:0.6},150);
};

/* # `TwoAxisPlot.pan(xpan, ypan)`
 *
 * Update the plot to show the new view based on the distance the mouse
 * has moved from its position when `panStart()` was called.
 *
 * ## Arguments
 *  - `xpan`    : The new mouse x-coordinate.
 *  - `ypan`    : The new mouse y-coordinate.
 *
 */
TwoAxisPlot.prototype.pan = function(xpan, ypan){
    if (xpan instanceof Array){
        ypan = xpan[1];
        xpan = xpan[0];
    }
    this.xPan(xpan);
    this.yPan(ypan);
    this.clearDraw();
    this.draw();
};
/* # `TwoAxisPlot.xPan(xpan)`
 *
 * Compute the new xview based on the x displacement of the mouse and 
 * update the x-axis with new view.
 *
 * ## Arguments
 *  - `xpan`    : The new mouse x-coordinate.
 *
 */
TwoAxisPlot.prototype.xPan = function(xpan){
    // Change in pixel coordinates
    var deltax = - (xpan - this.xpanstart);
    // Edge of the subset of points corresponding to the zoomed in area, 
    // where the parent set is the previous zoom
    var xends = this.xviewstack[this.xviewstack.length - 1];
    // Axes from the previous zoom
    var xaxisparent = this.xaxisparentstack[this.xaxisparentstack.length - 1];
    // Want to convert deltax/deltay to what deltax/deltay would be in 
    // the previous zoom if the domain changed the same amount.
    deltax*=xaxisparent.panscale;
    this.xaxis = xaxisparent.getSubAxis([xends[0]+deltax,xends[1]+deltax]);
};
/* # `TwoAxisPlot.yPan(ypan)`
 *
 * Compute the new yview based on the y displacement of the mouse and 
 * update the y-axis with new view.
 *
 * ## Arguments
 *  - `ypan`    : The new mouse x-coordinate.
 *
 */
TwoAxisPlot.prototype.yPan = function(ypan){
    var deltay = - (ypan - this.ypanstart);
    var yends = this.yviewstack[this.yviewstack.length - 1];
    var yaxisparent = this.yaxisparentstack[this.yaxisparentstack.length - 1];
    deltay*=yaxisparent.panscale;
    this.yaxis = yaxisparent.getSubAxis([yends[0]+deltay,yends[1]+deltay]);
};

/* # `TwoAxisPlot.panStop(xpan,ypan)`
 *
 * Stop panning the plot and reset for panning again.
 *
 * ## Arguments
 *  - `xpan`    : The final x-coordinate of the mouse.
 *  - `ypan`    : The final y-coordinate of the mouse.
 *
 */
TwoAxisPlot.prototype.panStop = function(xpan,ypan){
    if (xpan instanceof Array){
        ypan = xpan[1];
        xpan = xpan[0];
    }
    this.xPanStop(xpan);
    this.yPanStop(ypan);

    $('.arrow').animate({opacity:0.15},1500);
};
/* # `TwoAxisPlot.xPanStop(xpan)`
 *
 * Stop panning the plot and reset for panning again.
 *
 * ## Arguments
 *  - `xpan`    : The final x-coordinate of the mouse.
 *
 */
TwoAxisPlot.prototype.xPanStop = function(xpan){
    var xends = this.xviewstack[this.xviewstack.length - 1];
    var deltax = - (xpan - this.xpanstart);
    // Axes from the previous zoom
    var xaxisparent = this.xaxisparentstack[this.xaxisparentstack.length - 1];
    deltax*=xaxisparent.panscale;
    this.xviewstack[this.xviewstack.length - 1] = [xends[0]+deltax,xends[1]+deltax];
};
/* # `TwoAxisPlot.yPanStop(ypan)`
 *
 * Stop panning the plot and reset for panning again.
 *
 * ## Arguments
 *  - `ypan`    : The final y-coordinate of the mouse.
 *
 */
TwoAxisPlot.prototype.yPanStop = function(ypan){
    var yends = this.yviewstack[this.yviewstack.length - 1];
    var deltay = - (ypan - this.ypanstart);
    var yaxisparent = this.yaxisparentstack[this.yaxisparentstack.length - 1];
    deltay*=yaxisparent.panscale;
    this.yviewstack[this.yviewstack.length - 1] = [yends[0]+deltay,yends[1]+deltay];
};

// -- }}

/* # `ScatterPlot(data, opts)` 
 * ### inherits `TwoAxisPlot`
 *
 * A 'class' representing an interactive scatter plot. Adds draw functions
 * to TwoAxisPlot.
 *
 * ## Requires
 *  - jQuery >= v1.9.1, _Note_: Other versions of jQuery should work too, 
 *  but v1.9.1 was used when writing the library.
 *  - d3 = v3
 *
 * ## Arguments
 *  - `data` : See `GeneralPlot`
 *  - `opts` : Same as `TwoAxisPlot`.
 *
 */
function ScatterPlot(data, opts){
    TwoAxisPlot.call(this,data,opts);

}

// Javascript inheritance
ScatterPlot.prototype = Object.create(TwoAxisPlot.prototype);
ScatterPlot.prototype.constructor = ScatterPlot;

/* # `ScatterPlot.drawData()`
 *
 * Draw points on the plot for every active data point. Draw arrows to indicate
 * data that isn't shown in the current view. Draw error bars if active.
 *
 */
ScatterPlot.prototype.drawData = function(){

    var xaxis = this.xaxis;
    var yaxis = this.yaxis;
    var x = this.x;
    var y = this.y;
    var t = this.type;
    var id = this.id;
    var margin = this.margin;

    // SVG Arrow Paths
    var horizontal_arrow = 'm0,10.25203l108.89204,-10.25203l109.3175,10.25203l-54.55241,0l0,5.04587l-109.10472,0l0,-5.04587l-54.55241,0z';
    var vertical_arrow = 'm-100,113.25203l108.89204,-10.25203l109.3175,10.25203l-54.55241,0l0,5.04588l-109.10472,0l0,-5.04588l-54.55241,0z';

    var data = this.getActiveData();

    if (this.dataIsAbove()){
        var arrow = this.canvas.append('g')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'arrow');
        arrow.append('path')
            .attr('stroke', 'none')
            .attr('opacity', 0.8)
            .attr('d', horizontal_arrow)
            .attr('fill', '#7f7f7f')
            .attr('transform', 'translate(' +
                (this.width/2 -
                    this.margin.right -
                    this.margin.left -
                    this.legendwidth) +
                ',' + this.margin.top + ')');
    }
    if (this.dataIsBelow()){
        var arrow = this.canvas.append('g')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'arrow');
        arrow.append('path')
            .attr('stroke', 'none')
            .attr('opacity', 0.8)
            .attr('d', horizontal_arrow)
            .attr('fill', '#7f7f7f')
            .attr('transform', 'translate(' +
                (this.width/2 -
                    this.margin.right -
                    this.margin.left -
                    this.legendwidth) +
                ',' + (this.trueheight) +
                ')rotate(180 109.105 7.64895)');
    }
    if (this.dataIsRight()){
        var arrow = this.canvas.append('g')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'arrow');
        arrow.append('path')
            .attr('stroke', 'none')
            .attr('opacity', 0.8)
            .attr('d', vertical_arrow)
            .attr('fill', '#7f7f7f')
            .attr('transform', 'translate(' +
                (this.truewidth) + ',' +
                (this.height/2-this.margin.top-110) +
                ')rotate(90 9.10478 110.649)');
    }
    if (this.dataIsLeft()){
        var arrow = this.canvas.append('g')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'arrow');
        arrow.append('path')
            .attr('stroke', 'none')
            .attr('opacity', 0.8)
            .attr('d', vertical_arrow)
            .attr('fill', '#7f7f7f')
            .attr('transform', 'translate(' +
                (this.margin.left) + ',' +
                (this.height/2-this.margin.top-110) +
                ')rotate(-90 9.10478 110.649)');
    }

    // Append data point groups
    for (var key in data){
        var dots = this.canvas.append('g').attr('class', 'dataset')
            .selectAll('g').data(data[key]).enter()
            .append('g')
            .attr('transform', function(d){
                return 'translate(' +
                    (xaxis.scale(x(d)) +
                        margin.left) + ',' +
                    (yaxis.scale(y(d)) +
                        margin.top) + ')';
            })
            .attr('_id', function(d){
                return id(d);
            })
            .attr('class','dot');

        var _this = this;
        var type = this.type;
        // Draw Error bars (first so they are behind everything)
        if (this.xError){
            dots.append('line')
                .attr('x1', function(d){
                    return _this.xaxis.scale(_this.xError(d)[0]+x(d)) - _this.xaxis.scale(x(d));
                })
                .attr('x2', function(d){
                    return _this.xaxis.scale(_this.xError(d)[1]+x(d)) - _this.xaxis.scale(x(d));
                })
                .attr('y1', 0)
                .attr('y2', 0)
                .attr('stroke', '#000')
                .attr('class', 'errorbar');
            dots.append('line')
                .attr('x1', function(d){
                    return _this.xaxis.scale(_this.xError(d)[0]+x(d)) - _this.xaxis.scale(x(d));
                })
                .attr('x2', function(d){
                    return _this.xaxis.scale(_this.xError(d)[0]+x(d)) - _this.xaxis.scale(x(d));
                })
                .attr('y1', 5)
                .attr('y2', -5)
                .attr('stroke', '#000')
                .attr('class', 'errorbar');
            dots.append('line')
                .attr('x1', function(d){
                    return _this.xaxis.scale(_this.xError(d)[1]+x(d)) - _this.xaxis.scale(x(d));
                })
                .attr('x2', function(d){
                    return _this.xaxis.scale(_this.xError(d)[1]+x(d)) - _this.xaxis.scale(x(d));
                })
                .attr('y1', 5)
                .attr('y2', -5)
                .attr('stroke', '#000')
                .attr('class', 'errorbar');
        }
        if (this.yError){
            dots.append('line')
                .attr('y1', function(d){
                    return _this.yaxis.scale(_this.yError(d)[0]+y(d)) - _this.yaxis.scale(y(d));
                })
                .attr('y2', function(d){
                    return _this.yaxis.scale(_this.yError(d)[1]+y(d)) - _this.yaxis.scale(y(d));
                })
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('stroke', '#000')
                .attr('class', 'errorbar');
            dots.append('line')
                .attr('y1', function(d){
                    return _this.yaxis.scale(_this.yError(d)[0]+y(d)) - _this.yaxis.scale(y(d));
                })
                .attr('y2', function(d){
                    return _this.yaxis.scale(_this.yError(d)[0]+y(d)) - _this.yaxis.scale(y(d));
                })
                .attr('x1', 5)
                .attr('x2', -5)
                .attr('stroke', '#000')
                .attr('class', 'errorbar');
            dots.append('line')
                .attr('y1', function(d){
                    return _this.yaxis.scale(_this.yError(d)[1]+y(d)) - _this.yaxis.scale(y(d));
                })
                .attr('y2', function(d){
                    return _this.yaxis.scale(_this.yError(d)[1]+y(d)) - _this.yaxis.scale(y(d));
                })
                .attr('x1', -5)
                .attr('x2', 5)
                .attr('stroke', '#000')
                .attr('class', 'errorbar');
        }
        // Dots
        dots.append('circle')
            .attr('fill', function(d){
//                console.log("HERE I AM ",this, d);
                return _this.color(type(d));
            })
            .attr('r', 4)
            .attr('class','dot_circle')
            .attr('stroke', function(d){ return darkenColor(_this.color(type(d)),'3a');});
        // Interaction
        dots
            .on('mouseover', this.dataMouseOver)
            .on('mouseout', this.dataMouseOut)
            .on('dblclick', this.radiallyDistribute);
    }
    this.dots = d3.selectAll('.dataset').selectAll('.dot');
    this.elements = this.dots;

    $('.arrow').animate({opacity:0.15},2000)
};

/* # `ScatterPlot.drawLabels()`
 *
 * Label the data points using the label accessor if specified.
 *
 */
ScatterPlot.prototype.drawLabels = function(){
    var _this = this;
    // Labels
    this.dots.append('text')
        .text(function(d){ return _this.label(d);})
        .attr('class','dotlabel')
        .attr('x', 5 )
        .attr('y', -2 )
        .style('text-anchor','left')
        .attr('stroke','none')
        .attr('fill','#000');
};

/* # `GridPlot(data, opts)` 
 * ### inherits `TwoAxisPlot`
 *
 * A 'class' representing interactive grid plots. Adds draw functions
 * to TwoAxisPlot for drawing data with two discrete values.
 *
 * ## Requires
 *  - jQuery >= v1.9.1, _Note_: Other versions of jQuery should work too, 
 *  but v1.9.1 was used when writing the library.
 *  - d3 = v3
 *
 * ## Arguments
 *  - `data` : See `GeneralPlot`. Both x and y fields must contain
 *            non-numeric data.
 *  - `opts` : Same as `TwoAxisPlot`.
 *
 */
function GridPlot(data, opts){
    TwoAxisPlot.call(this,data,opts);
}

// Javascript inheritance
GridPlot.prototype = Object.create(TwoAxisPlot.prototype);
GridPlot.prototype.constructor = GridPlot;

GridPlot.prototype.drawData = function(){

    var xaxis = this.xaxis;
    var yaxis = this.yaxis;
    var x = this.x;
    var y = this.y;
    var t = this.type;
    var id = this.id;
    var margin = this.margin;

    var data = this.getActiveData();

    var rectwidth =  this.xaxis.getTickSeparation();
    var rectheight = this.yaxis.getTickSeparation();

    // Append data point groups
    for (var key in data){
        var boxes = this.canvas.append('g').attr('class', 'dataset')
            .selectAll('g').data(data[key]).enter()
            .append('g')
            .attr('transform', function(d){
                return 'translate(' + (xaxis.scale(x(d)) + margin.left) + ',' + (yaxis.scale(y(d)) + margin.top) + ')';
            })
            .attr('_id', function(d){
                return id(d);
            })
            .attr('class','box');

        var _this = this;
        var type = this.type;

        // Rects
        boxes.append('rect')
            .attr('fill', function(d){ return _this.color(type(d));})
            .attr('x', -rectwidth/2)
            .attr('y', -rectheight/2)
            .attr('width', rectwidth)
            .attr('height', rectheight)
            .style('stroke', '#000');
        // Interaction
        boxes
            .on('mouseover', this.dataMouseOver)
            .on('mouseout', this.dataMouseOut)
            .on('dblclick', this.radiallyDistribute);
    }
    this.boxes = d3.selectAll('.dataset').selectAll('.box');
    this.elements = this.boxes;
};

GridPlot.prototype.drawLabels = function(){
    var _this = this;
    // Labels
    this.boxes.append('text')
        .text(function(d){ return _this.label(d);})
        .attr('class','boxlabel')
        .attr('x', 0 )
        .attr('y', 0 )
        .style('text-anchor','middle');
};

GridPlot.prototype.drawGridLines = function(xaxisg,yaxisg){

    var hsep = this.xaxis.getTickSeparation();
    var vsep = this.yaxis.getTickSeparation();

    xaxisg.selectAll('g').append('line')
        .attr('class', 'gridline')
        .attr('x1', hsep/2)
        .attr('x2', hsep/2)
        .attr('y1', 0)
        .attr('y2', -this.trueheight)
        .style('stroke','#aaa');
    yaxisg.selectAll('g').append('line')
        .attr('class', 'gridline')
        .attr('x1', 0)
        .attr('x2', this.truewidth)
        .attr('y1', vsep/2)
        .attr('y2', vsep/2)
        .style('stroke','#aaa');

};

/* # `CurvePlot(data, opts)` 
 * ### inherits `ScatterPlot`
 *
 * A 'class' representing an interactive curve plot.
 *
 * ## Requires
 *  - jQuery >= v1.9.1, _Note_: Other versions of jQuery should work too, 
 *  but v1.9.1 was used when writing the library.
 *  - d3 = v3
 *
 * ## Arguments
 *  - `data` : Should be the same shape as specified in `GeneralPlot`, 
 *            except the x and y fields should contain arrays of 
 *            values to be plotted that represent a single curve
 *            and the number of elements in the x and y arrays 
 *            must be equal.
 *  - `opts` : Same as `ScatterPlot`.
 *
 */
function CurvePlot(data, opts){
//    console.log(data)
    ScatterPlot.call(this,data,opts);
}

// Javascript inheritance
CurvePlot.prototype = Object.create(ScatterPlot.prototype);
CurvePlot.prototype.constructor = CurvePlot;

// Override 
CurvePlot.prototype.setupAxes = function(){
    var yc = this.yconvert;
    var xc = this.xconvert;

    // Flatten the data
//    console.log(this.data)

    var concatarraydata = new Array();
    for (var key in this.data){
//        console.log(key)
        for (var i in this.data[key]){
//            console.log(this.data[key][i])
//            console.log(this.x(this.data[key][i]))
            var length = this.x(this.data[key][i]).length;
//            console.log(length)
            for (var j = 0; j<length; j++){
                concatarraydata.push({
                    x: this.x(this.data[key][i])[j]*xc,
                    y: this.y(this.data[key][i])[j]*yc
                });
            }
        }
    }
//    console.log(concatarraydata)

    var xrange = [0,this.truewidth];
    var yrange = [this.trueheight, 0];

    this.xaxis = new ContinuousAxis(concatarraydata, xrange, {
        container : '.xaxis',
        orient : 'bottom',
        accessor : function(d) { return d.x; }
    });
    this.yaxis = new ContinuousAxis(concatarraydata, yrange, {
        container : '.yaxis',
        orient : 'left',
        accessor : function(d) { return d.y; }
    });
};

// Override 
CurvePlot.prototype.setYConvert = function(yconvert){
    if (typeof yconvert != "undefined"){
        this.yconvert = yconvert;
    }
}
// Override 
CurvePlot.prototype.setXConvert = function(xconvert){
    if (typeof xconvert != "undefined"){
        this.xconvert = xconvert;
    }
}
// Override 
CurvePlot.prototype.factorX = function(){
}
// Override 
CurvePlot.prototype.factorY = function(){
}

// Override 
CurvePlot.prototype.getActiveData = function(){
    var data = new Object();
    var activedatasets = this.getActiveDatasets();
    for (var key in this.data){
        if (key in activedatasets){
            data[key] = new Array();
            for (i in this.data[key]){
                data[key].push(this.data[key][i]);
            }
            if (data[key].length == 0){
                delete data[key];
            }
        }
    }
    return data;
};

// Override 
CurvePlot.prototype.setOnClick = function(str){
    this.onClick = str;
    if (str == 'inspect'){
        this.gs.on('mousedown',this.dataMouseClick);
    } else {
        this.gs.on('mousedown',function(){});
    }
};

/* # `CurvePlot.drawData()`
 *
 * Draw curves on the plot for every active data object. Only shows points
 * of the curve that fall within the current view. 
 *
 */
// Override 
CurvePlot.prototype.drawData = function(){
    var xaxis = this.xaxis;
    var yaxis = this.yaxis;
    var x = this.x;
    var y = this.y;
    var xc = this.xconvert;
    var yc = this.yconvert;
    var t = this.type;
    var id = this.id;
    var margin = this.margin;
    var _this = this;
    var type = this.type;

    var data = this.getActiveData();

    var line = d3.svg.line()
        .x(function(d){  return xaxis.scale(d.x)+margin.left;  })
        .y(function(d){  return yaxis.scale(d.y)+margin.top;  })
        .interpolate('linear');

    this.container.select('g')
        .append('defs')
        .append('clipPath')
        .attr('id', 'insideGrid')
        .append('rect')
        .attr('x',margin.left)
        .attr('y',margin.right)
        .attr('width',this.truewidth)
        .attr('height',this.trueheight);

    // Append data point groups
    for (var key in data){
        var gs = this.canvas.append('g').attr('class', 'dataset')
            .selectAll('g').data(data[key]).enter()
            .append('g')
            .attr('_id', function(d){
                return id(d);
            })
            .attr('class','curve')
            .attr('clip-path', 'url(#insideGrid)')
            .each(function(d){
                xdata = x(d);
                ydata = y(d);
                length = xdata.length;
                var color = _this.color(type(d));
                var symbol = "circle"
                if (d.symbol){
                    symbol = d.symbol;
                }
                var curve = new Array();
                for (var i = 0; i<length; i++){
                    curve.push({
                        x: xdata[i]*xc,
                        y: ydata[i]*yc
                    });
                }

                d3.select(this).append('path')
                    .attr('d', line(curve))
                    .attr('fill', 'none')
                    .attr('stroke', color);
                d3.select(this).selectAll('.dataPoint').data(curve).enter()
                    .append('path')
                    .attr("d", d3.svg.symbol()
                        .type( function(d) {
                            return symbol }).size(10))
                    .attr('fill', color)
                    .attr('class',"dataPoint")
                    .attr('r', 4)
                    .style('stroke', darkenColor(color,'3a'))
                    .attr('transform', function(d){
                        return 'translate(' + (xaxis.scale(d.x) + margin.left) + ',' + (yaxis.scale(d.y) + margin.top) + ')';
                    }
                );
            }
        );
        gs.on('mouseover', this.dataMouseOver)
            .on('mouseout', this.dataMouseOut);
    }
    this.gs = d3.selectAll('.curve');
    this.gs.on('mouseover',this.dataMouseOver);
};

/* # `CurvePlot.drawLabels()`
 *
 * Label the curves using the label accessor if specified. Labels the first visible 
 * point that doesn't cause another label to be overlapped.
 *
 */
// Override 
CurvePlot.prototype.drawLabels = function(className){
    if(!className){
        className = "curvelabel";//use this for eventual background box
    }
    var labels = new Array();
    var _this = this;
    var gs = this.gs[0];

    var topLabels =[];
    for (var g = 0; g<gs.length; g++){
        var dots = d3.select(gs[g]).selectAll('.dataPoint')[0];
        for (var dot = 0; dot<dots.length; dot++){
            var pos = $(dots[dot]).attr('transform').split('(')[1].split(')')[0].split(',');
            pos = { top : Number(pos[1])-4, left : Number(pos[0])+4 };
            var collision = false;
            for (label in labels){
                if (Math.abs(labels[label].top-pos.top) < 15 && Math.abs(labels[label].left - pos.left) < 15){
                    collision = true;
                }
            }
            if (!collision){
                d3.select(gs[g]).insert('text').text(function(d){
                    return _this.label(d);
                })
                    .attr('class',className)
                    .attr('x', pos.left+5 )
                    .attr('y', pos.top-2 )
                    .style('text-anchor','start')
                    .attr("fill",function(d){return _this.color(_this.type(d));});

                labels.push(pos);
                break;
            }
        }
    }
    //////////////////////////////////////////////////////////////
    //not ideal but i cant figure out a better way now.
    //essentially you go through and delete all the labels we JUST
    //made and put them outside of the parent class so they can break
    //the cliping mask of the graph
    //////////////////////////////////////////////////////////////

    var dataSet = d3.select('.dataset');

    for(var i = 0; i<labels.length; i++){
        var label = d3.select('.'+className).remove();
        dataSet.append(function(){
            return label[0][0];
        })

    }


};

/* # `CurvePlot.dataMouseOver()`
 *
 * __INTERNAL FUNCTION__
 *
 * Called when the mouse moves over a curve
 * on the plot.
 *
 */
// Override 
CurvePlot.prototype.dataMouseOver = function(){
    var g = d3.select(this);

    g.selectAll('path.dataPoint')
        .attr('fill_color', function(){ return d3.select(this).style('fill');})
        .style('fill', function(){ var fill = d3.select(this).style('fill'); return lightenColor(fill, '3a');})
        .attr('stroke_color',function(){ return d3.select(this).style('stroke');})
        .style('stroke', function(){ var stroke = d3.select(this).style('stroke'); return lightenColor(stroke, '3a');});
    g.select('path')
        .attr('stroke_color',function(){ return d3.select(this).style('stroke');})
        .style('stroke', function(){ var stroke = d3.select(this).style('stroke'); return lightenColor(stroke, '3a');});
    g.select('text').style('opacity',1);
}

/* # `GeneralPlot.dataMouseOut()`
 *
 * __INTERNAL FUNCTION__
 *
 * Called when the mouse moves off a curve
 * on the plot.
 *
 */
// Override 
CurvePlot.prototype.dataMouseOut = function(){
    var g = d3.select(this);

    g.selectAll('.dataPoint')
        .style('fill', function(){ return d3.select(this).attr('fill_color');})
        .style('stroke',function(){ return d3.select(this).attr('stroke_color');})
    g.select('path')
        .style('stroke',function(){ return d3.select(this).attr('stroke_color');})
    g.select('text').style('opacity',0.4);
}

/* # `MultiAxisPlot(data, opts)` 
 * ### inherits `TwoAxisPlot`
 *
 * A 'virutal class' for plotting data that uses multiple axes. Each data
 * set (key in the `data` object) is plotted against its own y-axis, and each
 * y-axis is placed along the x-axis and labeled with the set's key.
 *
 * ## Requires
 *  - jQuery >= v1.9.1, _Note_: Other versions of jQuery should work too, 
 *  but v1.9.1 was used when writing the library.
 *  - d3 = v3
 *
 * ## Arguments
 *  - `data` : See `GeneralPlot`
 *  - `opts` : Same as `TwoAxisPlot`, except the following:
 *
 *      __Keys:__
 *
 *      - `xError`  : Not used.
 *      - `x`       : Not used.
 *      - `y`       : An object whose keys match the keys in `data`
 *                    and whose values are accessor functions for 
 *                    the set.
 *
 */
function MultiAxisPlot(data, opts){
    this.yaxis = new Object();
    TwoAxisPlot.call(this,data,opts);

    // There are multiple yaxes in this plot instead of just one
}
// Javascript inheritance
MultiAxisPlot.prototype = Object.create(TwoAxisPlot.prototype);
MultiAxisPlot.prototype.constructor = MultiAxisPlot;

MultiAxisPlot.prototype.setXLabel = function(xlabel){
    this.xlabel = xlabel;
};
MultiAxisPlot.prototype.setYLabel = function(ylabel){
    this.ylabel = ylabel;
};

// Override 
MultiAxisPlot.prototype.setupAxes = function(){
    var xrange = [0,this.width-this.margin.left-this.margin.right-this.legendwidth];
    var yrange = [this.height-this.margin.top-this.margin.bottom, 0];

    var keys = this.getDatakeys();

    this.xaxis = new DiscreteAxis(keys, xrange, {
        container : '.xaxis',
        orient : 'bottom',
        sort : this.xsort
    });

    for (i in keys){
        var yaxis = new ContinuousAxis(this.data[keys[i]], yrange, {
            container : '.yaxis.'+keys[i],
            orient : 'left',
            accessor : this.y[keys[i]]
        });
        this.yaxis[keys[i]]=yaxis;
    }
};

// Override
MultiAxisPlot.prototype.setYAxisDomain = function(y){
    for (var key in this.yaxis){
        this.yaxis[key].setDomain(y[key]);
    }
};

// Override
MultiAxisPlot.prototype.drawYAxis = function(){ // Override
    var xsep = this.xaxis.getTickSeparation();
    var xslide = (!isNaN(xsep)) ? xsep*0.2 : this.width/2 - this.margin.left - this.margin.right - this.legendwidth;

    for (var key in this.yaxis){
        if (this.xaxis.inDomain(key)){
            var ytransform = 'translate(' + (this.margin.left + this.xaxis.scale(key) - xslide) + ',' + this.margin.top + ') ';

            var yaxisg = this.canvas.append('g')
                .attr('transform', ytransform)
                .attr('class', 'yaxis '+key);

            this.yaxis[key].drawAxis();
            yaxisg.append('text')
                .text(this.ylabel[key])
                .attr('transform', 'rotate(90)translate(0,-8)')
                .attr('class','yaxisLabel');

            // Interaction
            $(this.yaxis[key].container + ' .tick.major').on('click', this.yAxisLabelClick);
        }
    }

    // TODO: Add label overlap checking
};

// Override
MultiAxisPlot.prototype.getActiveData = function(){
    var data = new Object();
    var activedatasets = this.getActiveDatasets();
    this.hidden = {
        right : false,
        left : false,
        above : false,
        below : false
    }
    for (var key in activedatasets){
        if (this.xaxis.inDomain(key)){
            data[key] = new Array();

            for (i in this.data[key]){
                var datum = this.data[key][i];
                if (this.yaxis[key].inDomain(this.y[key](datum))){
                    data[key].push(datum);
                } else {
                    if (!this.hidden.below && this.yaxis[key].belowDomain(this.y[key](datum))){
                        this.hidden.below = true;
                    } else if (!this.hidden.above && this.yaxis[key].aboveDomain(this.y[key](datum))){
                        this.hidden.above = true;
                    }
                }
            }
            if (data[key].length == 0){
                delete data[key];
            }
        } else {
            if (!this.hidden.right && this.xaxis.aboveDomain(key)){
                this.hidden.right = true;
            } else if (!this.hidden.left && this.xaxis.belowDomain(key)){
                this.hidden.left = true;
            }
        }
    }
    return data;
};
// Override
MultiAxisPlot.prototype.yZoom = function(yview){
    var yaxisparent = new Object();
    for (var key in this.yaxis){
        yaxisparent[key] = this.yaxis[key].getCopy();
    }
    this.yaxisparentstack.push(yaxisparent);

    if (yview instanceof Array){
        y_min = yview[1];
        y_max = yview[0];
        for (key in yaxisparent){
            if (yaxisparent[key].backwards){
                this.yaxis[key] = yaxisparent[key].getSubAxis([y_min,y_max]);
            } else {
                this.yaxis[key] = yaxisparent[key].getSubAxis(yview);
            }
        }
    } else {
        for (var key in yaxisparent){
            if (yaxisparent[key].backwards){
                y_min = yview[key][1];
                y_max = yview[key][0];
                this.yaxis[key] = yaxisparent[key].getSubAxis([y_min,y_max]);
            } else {
                this.yaxis[key] = yaxisparent[key].getSubAxis(yview);
            }
        }
    }
    this.yviewstack.push(yview);
};
// Override
MultiAxisPlot.prototype.getMADx = function(devs){
    return this.xaxis.getRange();
};
// Override
MultiAxisPlot.prototype.getMADy = function(devs){
    var yviews = new Object();
    for (var key in this.yaxis){
        domain = this.yaxis[key].computeMADRange(devs);
        var y_min = this.yaxis[key].scale(domain[0]);
        var y_max = this.yaxis[key].scale(domain[1]);
        yviews[key] = [y_min,y_max];
    }
    return yviews;
};
// Override
MultiAxisPlot.prototype.getIQRx = function(){
    return this.xaxis.getRange();
};
// Override
MultiAxisPlot.prototype.getIQRy = function(){
    var yviews = new Object();
    for (var key in this.yaxis){
        domain = this.yaxis[key].computeIQR();
        var y_min = this.yaxis[key].scale(domain[0]);
        var y_max = this.yaxis[key].scale(domain[1]);
        yviews[key] = [y_min,y_max];
    }
    return yviews;
};
// Override
MultiAxisPlot.prototype.yPan = function(ypan){
    var deltay = - (ypan - this.ypanstart);
    var yends = this.yviewstack[this.yviewstack.length - 1];
    var yaxisparent = this.yaxisparentstack[this.yaxisparentstack.length - 1];

    if (yends instanceof Array){
        var ybox = [yends[0]+dy,yends[1]+dy];

        for (var key in this.yaxis){
            var dy = deltay * yaxisparent[key].panscale;

            this.yaxis[key] = yaxisparent[key].getSubAxis(ybox);
        }
    } else {
        for (var key in this.yaxis){
            var dy = deltay * yaxisparent[key].panscale;
            var ybox = [yends[key][0]+dy,yends[key][1]+dy];

            this.yaxis[key] = yaxisparent[key].getSubAxis(ybox);
        }
    }
};
// Override
MultiAxisPlot.prototype.yPanStop = function(ypan){
    var deltay = - (ypan - this.ypanstart);
    var yends = this.yviewstack[this.yviewstack.length - 1];
    var yaxisparent = this.yaxisparentstack[this.yaxisparentstack.length - 1];

    if (yends instanceof Array){
        this.yviewstack[this.yviewstack.length - 1] = [yends[0]+deltay,yends[1]+deltay];
    } else {
        var ybox = new Object();
        for (var key in this.yaxis){
            var dy = deltay * yaxisparent[key].panscale;
            ybox[key] = [yends[key][0]+dy,yends[key][1]+dy];
        }
        this.yviewstack[this.yviewstack.length - 1] = ybox;
    }
};
// Override
MultiAxisPlot.prototype.dataMouseOver = function(dot){

    // Get the plot, since this is an event and 'this' no longer points to the plot
    var _this = d3.select(this.parentElement.parentElement.parentElement).data()[0];
    var thisG = d3.select(this);
    var thisDot = d3.select(this).select('.dot_circle');
    var fill = thisDot.style('fill');
    var stroke = thisDot.style('stroke');
    thisDot
        .attr('fill_color', fill)
        .style('fill', lightenColor(fill,'3a'))
        .attr('stroke_color', stroke)
        .style('stroke', lightenColor(stroke, '3a'));
    thisG.select('text').style('opacity',1);
    _this.container.append('g')
        .append('text')
        .text('x: '+_this.x(dot)+', y: '+_this.y[dot.key](dot))
        .attr('text-anchor','start')
        .attr('x', 10)
        .attr('y', 15)
        .attr('class', 'coordinates');
};

/* # `MultiScatterPlot(data, opts)` 
 * ### inherits `MultiAxisPlot`
 *
 * A 'class' representing an interactive scatter plot with multiple axes. 
 * Adds draw functions to MultiAxisPlot.
 *
 * ## Requires
 *  - jQuery >= v1.9.1, _Note_: Other versions of jQuery should work too, 
 *  but v1.9.1 was used when writing the library.
 *  - d3 = v3
 *
 * ## Arguments
 *  - `data` : See `MultiAxisPlot`
 *  - `opts` : See `MultiAxisPlot`.
 *
 */
function MultiScatterPlot(data, opts){
    MultiAxisPlot.call(this,data,opts);
}

// Javascript inheritance
MultiScatterPlot.prototype = Object.create(MultiAxisPlot.prototype);
MultiScatterPlot.prototype.constructor = MultiScatterPlot;

// Override
MultiScatterPlot.prototype.drawData = function(){

    var xaxis = this.xaxis;
    var yaxis = this.yaxis;
    var x = this.x;
    var y = this.y;
    var t = this.type;
    var id = this.id;
    var margin = this.margin;

    var data = this.getActiveData();

    // Append data point groups
    for (var key in data){
        var dots = this.canvas.append('g').attr('class', 'dataset')
            .selectAll('g').data(data[key]).enter()
            .append('g')
            .attr('transform', function(d){
                return 'translate(' +
                    (xaxis.scale(key) + margin.left) + ',' +
                    (yaxis[key].scale(y[key](d)) + margin.top) + ')';
            })
            .attr('_id', function(d){
                return id(d);
            })
            .attr('class','dot')
            .each(function(d){ d.key = key; });

        var _this = this;
        var type = this.type;

        if (this.yError){
            dots.append('line')
                .attr('y1', function(d){
                    return _this.yaxis[d.key].scale(_this.yError(d)[0]+y[key](d)) - _this.yaxis[d.key].scale(y[key](d));
                })
                .attr('y2', function(d){
                    return _this.yaxis[d.key].scale(_this.yError(d)[1]+y[key](d)) - _this.yaxis[d.key].scale(y[key](d));
                })
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('stroke', '#000')
                .attr('class', 'errorbar');
            dots.append('line')
                .attr('y1', function(d){ return _this.yaxis[d.key].scale(_this.yError(d)[0]+y[key](d)) - _this.yaxis[key].scale(y[key](d));})
                .attr('y2', function(d){ return _this.yaxis[d.key].scale(_this.yError(d)[0]+y[key](d)) - _this.yaxis[key].scale(y[key](d));})
                .attr('x1', 5)
                .attr('x2', -5)
                .attr('stroke', '#000')
                .attr('class', 'errorbar');
            dots.append('line')
                .attr('y1', function(d){ return _this.yaxis[d.key].scale(_this.yError(d)[1]+y[key](d)) - _this.yaxis[d.key].scale(y[key](d));})
                .attr('y2', function(d){ return _this.yaxis[d.key].scale(_this.yError(d)[1]+y[key](d)) - _this.yaxis[d.key].scale(y[key](d));})
                .attr('x1', -5)
                .attr('x2', 5)
                .attr('stroke', '#000')
                .attr('class', 'errorbar');
        }

        // Dots
        dots.append('circle')
            .attr('fill', function(d){ return _this.color(type(d));})
            .attr('r', 4)
            .attr('class','dot_circle')
            .attr('stroke', function(d){ return darkenColor(_this.color(type(d)),'3a');});
        // Interaction
        dots
            .on('mouseover', this.dataMouseOver)
            .on('mouseout', this.dataMouseOut)
            .on('dblclick', this.radiallyDistribute);
    }
    this.dots = d3.selectAll('.dataset').selectAll('.dot');
    this.elements = this.dots;
};

// Override
MultiScatterPlot.prototype.drawLabels = function(){
    var _this = this;
    // Labels
    this.dots.append('text')
        .text(function(d){ return _this.label(d);})
        .attr('class','dotlabel')
        .attr('x', 5 )
        .attr('y', -2 )
        .style('text-anchor','left');
};

/* # `ComparePlot(data, opts)` 
 * ### inherits `TwoAxisPlot`
 *
 * A 'class' representing an interactive percentage difference bar graph. 
 * Shows the percentage difference between two elements for multiple sets 
 * of data. Adds draw functions to TwoAxisPlot.
 *
 * ## Requires
 *  - jQuery >= v1.9.1, _Note_: Other versions of jQuery should work too, 
 *  but v1.9.1 was used when writing the library.
 *  - d3 = v3
 *
 * ## Arguments
 *  - `data` : Each key in `data` contain an object with two keys, 'base'
 *            and 'compare'. 'base' should contain a single data object,
 *            which all other data objects will be compared to. Compare
 *            should contain an array array of data objects as specified
 *            in `GeneralPlot`. The percentage difference will be 
 *            computed for each of these data objects in comparison to
 *            the base.
 *  - `opts` : Same as `TwoAxisPlot`.
 *
 */
function ComparePlot(data, opts){
    TwoAxisPlot.call(this,data,opts);
}

// Javascript inheritance
ComparePlot.prototype = Object.create(TwoAxisPlot.prototype);
ComparePlot.prototype.constructor = ComparePlot;

// Override
ComparePlot.prototype.setData = function(data){
    GeneralPlot.prototype.setData.call(this, data);
    // Store the passed in accessor object, which has accessors for each type of data
    this.yy = this.y;
    // New accessor just accesses the new fields in the data which we'll create
    this.y = function(d) { return d.percentdiff; }

    this.datatypes = d3.set(); // Will become an array
    for (var key in this.data){
        for (var j = 0; j<data[key].compare.length; j++){
            this.datatypes.add(this.type(data[key].compare[j]));
        }
    }
    this.datatypes = this.datatypes.values();

    for (var key in this.data){
        var compare = this.data[key].compare;
        var base = this.data[key].base;
        for (var i = 0; i<compare.length; i++){
            // Compute the percent difference of this datum compared to the datum in data[key].base
            var pdiff = (this.yy[key](compare[i]) - this.yy[key](base)) / this.yy[key](compare[i]) * 100;
            this.data[key].compare[i]['percentdiff'] = pdiff;
            this.data[key].compare[i]['base'] = base;
        }
    }
};

// Override
ComparePlot.prototype.setupAxes = function(){
    // Flatten the data
    var concatdata = new Array();
    for (var key in this.data){
        for (var j=0; j<this.data[key].compare.length; j++){
            concatdata.push(this.data[key].compare[j]);
        }
    }

    var xrange = [0,this.truewidth];
    var yrange = [this.trueheight, 0];

    var keys = this.getDatakeys();
    this.xaxis = new DiscreteAxis(keys, xrange, {
        container : '.xaxis',
        orient : 'bottom',
        sort : this.xsort
    });

    this.yaxis = new PercentDiffAxis(concatdata, yrange, {
        container : '.yaxis',
        orient : 'left',
        accessor : this.y
    });
};

// Override
ComparePlot.prototype.getActiveData = function(){
    var data = new Object();
    var activedatasets = this.getActiveDatasets();
    this.hidden = {
        right : false,
        left : false,
        above : false,
        below : false
    }
    for (var key in activedatasets){
        if (this.xaxis.inDomain(key)){
            data[key] = new Array();

            for (var i in this.data[key].compare){
                var datum = this.data[key].compare[i];

                if (this.yaxis.inDomain(this.y(datum))){
                    data[key].push(datum);
                } else {
                    if (!this.hidden.below && this.yaxis.belowDomain(this.y(datum))){
                        this.hidden.below = true;
                    } else if (!this.hidden.above && this.yaxis.aboveDomain(this.y(datum))){
                        this.hidden.above = true;
                    }
                }
            }
            if (data[key].length == 0){
                delete data[key];
            }
        } else {
            if (!this.hidden.right && this.xaxis.aboveDomain(key)){
                this.hidden.right = true;
            } else if (!this.hidden.left && this.xaxis.belowDomain(key)){
                this.hidden.left = true;
            }
        }
    }
    return data;
};

/* # `ComparePlot.drawData()`
 *
 * Draw signed bars for each data object in the 'compare' key for each
 * set of data in `data`. The y-axis is label with percentages and the 
 * x-axis is labeled with the set's key.
 *
 */
ComparePlot.prototype.drawData = function(){
    var _this = this;
    var xaxis = this.xaxis;
    var yaxis = this.yaxis;
    var x = this.x;
    var y = this.y;
    var t = this.type;
    var id = this.id;
    var margin = this.margin;
    var type = this.type;

    var data = this.getActiveData();

    // Append data point groups
    for (var key in data){
        var bars = this.canvas.append('g').attr('class', 'dataset')
            .selectAll('g').data(data[key]).enter()
            .append('g')
            .attr('transform', function(d){
                return 'translate(' +
                    (xaxis.scale(key) + margin.left) + ',' +
                    (margin.top) + ')';
            })
            .attr('_id', function(d){
                return id(d);
            })
            .attr('class','bar')
            .each(function(d){ d.key = key; });

        // Bars
        var w = this.xaxis.getTickSeparation();
        var dw = w/data[key].length;
        bars.append('rect')
            .attr({
                'fill': function(d){
                    return _this.color(type(d));
                },
                'x': function(d,i){
                    return dw*i-w/2;
                },
                'width': dw,
                'dw': dw,
                'w': w,
                'key':key,
                'height':function(d){
                    return Math.abs(yaxis.scale(y(d)) - yaxis.scale(0));
                },
                'y': function(d){
                    if (yaxis.scale(y(d)) - yaxis.scale(0) > 0) {
                        return yaxis.scale(0);
                    } else {
                        return yaxis.scale(y(d));
                    }
                },
                'class':'bar_rect',
                'stroke': function(d){ return darkenColor(_this.color(type(d)),'3a');}
            });
        // Interaction
    }
    this.bars = d3.selectAll('.dataset').selectAll('.bar');
    this.bars.on('mouseover',this.dataMouseOver)
        .on('mouseout', this.dataMouseOut);
    this.elements = this.bars;
};
// Override
ComparePlot.prototype.dataMouseOver = function(bar){
    var _this = d3.select(this.parentElement.parentElement.parentElement).data()[0]; // Getting access to the plot, since this is an event and 'this' no longer points to the plot.
    var thisG = d3.select(this);
    var thisBar = d3.select(this).select('.bar_rect');
    var thisData = thisBar.data()[0];
    var fill = thisBar.style('fill');
    var stroke = thisBar.style('stroke');
    thisBar
        .attr('fill_color', fill)
        .style('fill', lightenColor(fill,'3a'))
        .attr('stroke_color', stroke)
        .style('stroke', lightenColor(stroke, '3a'));
//    thisG.select('text').style('opacity',1);
    _this.container.append('g')
        .append('text')
        .text('% DIFF: '+ _this.y(thisData) +
            '; VALUE/BASE: '+_this.yy[thisData.key](thisData) +
            ' / ' + _this.yy[thisData.key](thisData['base']) +
            '; TYPE: '+_this.type(thisData)
    )
        .attr('text-anchor','start')
        .attr('x', 10)
        .attr('y', 15)
        .attr('class', 'coordinates');
};
// Override
ComparePlot.prototype.dataMouseOut = function(bar){
    var thisG = d3.select(this);
    var thisBar = d3.select(this).select('.bar_rect');
    thisBar.style('fill', d3.select(this).attr('fill_color'));
    thisBar.style('stroke', d3.select(this).attr('stroke_color'));
    thisG.select('text').style('opacity',0.4);
    d3.selectAll('.coordinates').remove();
};
// Override
ComparePlot.prototype.drawLabels = function(){
    //var yy = this.yy;
    //var y = this.y;
    //yaxis = this.yaxis;

    //var labels = this.bars.append('g')
    //.attr({
    //x: function(d,i){
    //var dw = Number(d3.select(this.parentElement).select('rect').attr('dw'));
    //var w = Number(d3.select(this.parentElement).select('rect').attr('w'));
    //return dw*i-w/2+3;
    //},
    //y: function(d){
    //if (yaxis.scale(y(d)) - yaxis.scale(0) > 0) {
    //var dy = -10;
    //} else {
    //var dy = 15;
    //}
    //return yaxis.scale(y(d))+dy;
    //},
    //'transform': function(d){
    //return 'translate('+$(this).attr('x')+','+$(this).attr('y')+')';
    //}
    //});
    //labels.append('text')
    //.attr({
    //fill: function(d){
    //if (yaxis.scale(y(d)) - yaxis.scale(0) > 0) {
    //return '#f00';
    //} else {
    //return '#0f0';
    //}
    //}
    //})
    //.text(function(d){
    //var key = d3.select(this.parentElement.parentElement).select('rect').attr('key');
    //var diff = (d.percentdiff*yy[key](d)/100).toString();
    //if (diff.length >10) {
    //diff = diff.slice(0,11) + '...';
    //}
    //if (yaxis.scale(y(d)) - yaxis.scale(0) < 0) {
    //diff = '+'+diff;
    //}
    //return diff
    //}
    //);
    //labels.append('rect')
    //.attr({
    //'fill': '#fff',
    //'opacity': 0.8,
    //'width': function(){ return $(this).parent().children('text').width(); },
    //'y' : function(){ return -$(this).parent().children('text').height(); },
    //'height': function(){ return $(this).parent().children('text').height()*1.1; }
    //});
    //var txt = labels.selectAll('text');
    //for (var i=0; i<txt.length; i++){
    //$(txt[i]).parent().append(txt[i]);
    //}

};
// Override
ComparePlot.prototype.drawXGridLines = function(xaxisg){
    var width = this.xaxis.getTickSeparation();
    xaxisg.selectAll('g').append('line')
        .attr({
            'class': 'gridline',
            'x1': width/2,
            'x2': width/2,
            'y1': 0,
            'y2': -this.trueheight,
            'stroke':'#aaa'
        });
    xaxisg.append('line')
        .attr({
            'class':'gridline center',
            'y1': this.yaxis.scale(0) - this.trueheight,
            'y2': this.yaxis.scale(0) - this.trueheight,
            'x1': 0,
            'x2': this.truewidth,
            'stroke':'#000',
            'stroke-width': 3
        });
};


/* # `GeneralAxis(input range, opts)`
 *
 * A 'virtual class' representing an axis. The axis maps 
 * the values of `input` to a number within `range`.
 *
 * ## Requires
 *  - d3 = v3
 *
 * ## Arguments
 *  - `input` : An array of all data points to be shown on the
 *            axis.
 *  - `range` : An array containing the output range of the
 *            axis. [min, max] 
 *  - `opts`  : An object containing the options for the axis.
 *
 *      __Keys:__
 *
 *      - `container`   : jQuery selector for the SVG 'g' element 
 *                        to hold the axis
 *      - `orient`      : 'bottom' | 'left'
 *      - `accessor`    : An optional accessor if the elements in
 *                        input are objects.
 */
function GeneralAxis(input, range, opts){

    this.input = input;
    this.range = range;
    this.backwards = (this.range[0] > this.range[1]);

    this.container = (opts.container) ? opts.container : null;
    this.orient = (opts.orient) ? opts.orient : 'bottom';

    this.accessor = (opts.accessor) ? opts.accessor : function(d) {return d;};
    this.xconvert = (opts.xconvert) ? opts.xconvert : 1;
    this.yconvert = (opts.yconvert) ? opts.yconvert : 1;

    this.domain = new Array();
    this.scale;
    this.d3scale;
    this.panscale = 1;

}

// -- Accessors {{

/* # `GeneralAxis.getInput() ` 
 *
 * ## Return
 *
 *  Return the original data passed as `input`.
 *
 */
GeneralAxis.prototype.getInput = function() {
    return this.input;
};
/* # `GeneralAxis.getRange()`
 *
 * ## Return
 *
 *  Return the original `range` passed.
 *
 */
GeneralAxis.prototype.getRange = function(){
    return this.range;
};
/* # `GeneralAxis.getDomain()`
 *
 * ## Return
 *
 *  Return the domain computed by the axis.
 *
 */
GeneralAxis.prototype.getDomain = function(){
    return this.domain;
};
/* # `GeneralAxis.getContainer()`
 *
 * ## Return
 *
 *  Return the container passed to the axis.
 *
 */
GeneralAxis.prototype.getContainer = function(){
    if (this.container){
        return '.' + d3.select(this.container).attr('class');
    } else {
        return null;
    }
};
/* # `GeneralAxis.getAccessor()`
 *
 * ## Return
 *
 *  Return the accessor passed.
 *
 */
GeneralAxis.prototype.getAccessor = function(){
    return this.accessor;
};

GeneralAxis.getCopy = getClone;
GeneralAxis.prototype.getCopy = getClone;

// -- }}

// -- Mutators {{

/* # `GeneralAxis.computeAxis()`
 *
 * Uses `range` and `input` to setup the axis.
 *
 */
GeneralAxis.prototype.computeAxis = function(){
    this.axis = d3.svg.axis()
        .scale(this.d3scale)
        .orient(this.orient);
};

// -- }}

// -- Draw {{

/* # `GeneralAxis.drawAxis()`
 *
 * Draw the axis.
 *
 */
GeneralAxis.prototype.drawAxis = function(){
    var tempcontainer = (typeof this.container === "string" || this.container instanceof String) ? d3.select(this.container) : this.container;
    tempcontainer
        .call(this.axis);
};

// -- }}

/* # `ContinuousAxis(input range, opts)` 
 * ### inherits `GeneralAxis`
 *
 * A 'class' representing a continuous axis. The axis maps 
 * the domain passed as `input` to `range`.
 *
 * ## Requires
 *  - d3 = v3
 *
 * ## Arguments
 *  - `input` : See `GeneralAxis`. Must contain numeric values.
 *  - `range` : See `GeneralAxis`.
 *  - `opts`  : See `GeneralAxis`.
 *
 */
function ContinuousAxis(input, range, opts){
    GeneralAxis.call(this, input, range, opts);

    this.computeDomain();
    this.computeScale();
    this.computeAxis();
}
ContinuousAxis.prototype = Object.create(GeneralAxis.prototype);
ContinuousAxis.prototype.constructor = ContinuousAxis;

// -- Accessors {{

/* # `ContinuousAxis.scale(d)`
 *
 * Convert the value `d` from within the domain to its 
 * mapped value.
 *
 * ## Arguments
 *  - `d`   : The value to be converted.
 *
 * ## Return
 *
 *  The value `d` is mapped to.
 *
 */
ContinuousAxis.prototype.scale = function(d){
    // Domain Value -> Range Value
    return this.d3scale(d);
};

/* # `ContinuousAxis.inverseScale(d)`
 *
 * Convert the value `d` from the output range to
 * the value that maps to it.
 *
 * ## Arguments
 *  - `d`   : The value to be converted.
 *
 * ## Return
 *
 *  The value from which `d` is mapped.
 *
 */
ContinuousAxis.prototype.inverseScale = function(d){
    // Range Value -> Domain Value
    return this.d3scale.invert(d);
};

/* # `ContinuousAxis.inDomain(d)`
 *
 * ## Arguments
 *  - `d`   : A value possibly within the domain.
 *
 * ## Return
 * 
 *  True if `d` is in the domain. False otherwise. 
 *
 */
ContinuousAxis.prototype.inDomain = function(d){
    var domain = this.getDomain();
    return (d >= domain[0] && d <= domain[1]);
};
/* # `ContinuousAxis.aboveDomain(d)`
 *
 * ## Arguments
 *  - `d`   : A value possibly within the domain.
 *
 * ## Return
 *
 *  True if `d` is above the domain. False otherwise. 
 *
 */
ContinuousAxis.prototype.aboveDomain = function(d){
    var domain = this.getDomain();
    return (d > domain[1]);
};
/* # `ContinuousAxis.belowDomain(d)`
 *
 * ## Arguments
 *  - `d`   : A value possibly within the domain.
 *
 * ## Return
 *
 *  True if `d` is below the domain. False otherwise. 
 *
 */
ContinuousAxis.prototype.belowDomain = function(d){
    var domain = this.getDomain();
    return (d < domain[0]);
};

/* # `ContinuousAxis.getSubdomain(min,max,range_or_domain)`
 *
 * Get a new domain either from an output range or a domain.
 *
 * ## Arguments
 *  - `min`             : The lower bound of the domain.
 *  - `max`             : The upper bound of the domain.
 *  - `range_or_domain` : Whether `min` and `max` are domain
 *                        or range values.
 *
 * ## Return
 *
 *  A new domain.
 *
 */
ContinuousAxis.prototype.getSubdomain = function(min,max,range_or_domain){
    if (min instanceof Array){
        max = min[1];
        min = min[0];
    }
    if (!range_or_domain || range_or_domain == 'r'){
        return [this.inverseScale(min), this.inverseScale(max)]
    } else if (range_or_domain == 'd') {
        return [min,max];
    }
};

/* # `ContinuousAxis.getSubAxis(subrangemin, subrangemax)`
 *
 * Create a new axis which maps only the values of the domain which map
 * to values within `subrangemin` and `subrangemax` to the original
 * range. 
 *
 * ## Arguments
 *  - `subrangemin` : The lower bound of the range.
 *  - `subrangemax` : The upper bound of the range.
 *
 * ## Return
 *
 *  A new axis object.
 *
 */
ContinuousAxis.prototype.getSubAxis = function(subrangemin, subrangemax){
    if (subrangemin instanceof Array){
        subrangemax = subrangemin[1];
        subrangemin = subrangemin[0];
    }
    if (this.backwards && subrangemax > subrangemin){
        var temp = subrangemin;
        subrangemin = subrangemax;
        subrangemax = temp;
    } else if (!this.backwards && subrangemin > subrangemax){
        var temp = subrangemax;
        subrangemax = subrangemin;
        subrangemin = temp;
    }
    var subdomain = this.getSubdomain(subrangemin,subrangemax);
    var subaxis = this.getCopy();
    subaxis.domain = subdomain;
    subaxis.computeScale(1);
    subaxis.computeAxis();

    return subaxis;
};

// -- }}

// -- Mutators {{

/* # `ContinuousAxis.computePanScale(subaxis)`
 *
 * Computes the ratio between motion on this axis and motion
 * on `subaxis` assuming `subaxis` was derived from this axis.
 *
 * ## Arguments
 *  - `subaxis` : A derived axis.
 *
 * ## Return
 *
 *  The movement factor.
 *
 */
ContinuousAxis.prototype.computePanScale = function(subaxis){
    var subdomain = subaxis.getDomain();
    this.panscale = Math.abs(this.scale(subdomain[1])-this.scale(subdomain[0]))/Math.abs(subaxis.scale(subdomain[1])-subaxis.scale(subdomain[0]));
};

/* # `ContinuousAxis.computeDomain()`
 *
 * Compute the axis domain from `input`.
 *
 */
ContinuousAxis.prototype.computeDomain = function(){
    this.domain = [d3.min(this.input, this.accessor), d3.max(this.input, this.accessor)];
    if (this.domain[0] == this.domain[1]) {
        this.domain [0] = 0;
    }
};

/* # `ContinuousAxis.computeIQR()`
 *
 * Compute the interquartile range of the data in `input`.
 *
 * ## Return
 *
 *  The interquartile range (of the domain) as an array. 
 *  [lower_bound, upper_bound]
 *
 */
ContinuousAxis.prototype.computeIQR = function(){
    var data = new Array();
    for (var i in this.input){
        if (this.inDomain(this.accessor(this.input[i]))){
            data.push(this.accessor(this.input[i]));
        }
    }
    data.sort(function(a,b){
        if (a>b) return 1;
        else return -1;
    });
    var median = Math.round(data.length/2);
    var lowerQdata = data.slice(0,median);
    var upperQdata = data.slice(median, data.length);
    var lowerQ = Math.round(lowerQdata.length/2);
    var upperQ = Math.round(upperQdata.length/2)+median;

    return [data[lowerQ-1],data[upperQ-1]];
};

/* # `ContinuousAxis.computeMADRange(devs)`
 *
 * Compute the range which falls within `devs` deviations of 
 * the median absolute deviation.
 *
 * ## Arguments
 *  - `devs`    : Number of deviations to include.
 *
 * ## Return
 *   
 *   The lower and upper bound of the domain containing the
 *   range, as an array. [lower_bound, upper_bound]
 *
 */
ContinuousAxis.prototype.computeMADRange = function(devs){
    var data = new Array();
    for (var i in this.input){
        if (this.inDomain(this.accessor(this.input[i]))){
            data.push(this.accessor(this.input[i]));
        }
    }
    data.sort(function(a,b){
        if (a>b) return 1;
        else return -1;
    });
    var median = data[Math.round(data.length/2)];
    var ADs = new Array();
    for (i in data){
        ADs.push(Math.abs(data[i]-median))
    }
    ADs.sort(function(a,b){
        if (a>b) return 1;
        else return -1;
    });
    MAD = ADs[Math.round(ADs.length/2)];

    return [median - devs*MAD, median + devs*MAD];
};

/* # `ContinuousAxis.computeScale(notnice)`
 *
 * Compute the scale for the axis, i.e., which values in the
 * domain map to which values in the range. By default, adds
 * padding to make drawing the axis look nice.
 *
 * ## Arguments
 *  - `notnice` : True if no padding should be included.
 *
 */
ContinuousAxis.prototype.computeScale = function(notnice){
    var drawingdomain = this.getDomain();
    if (notnice){
        this.d3scale = d3.scale.linear()
            .domain(drawingdomain)
            .range(this.range);
    } else {
        var padding = (drawingdomain[1]-drawingdomain[0])*0.01;
        drawingdomain = [drawingdomain[0]-padding,drawingdomain[1]+padding];
        this.d3scale = d3.scale.linear()
            .domain(drawingdomain)
            .range(this.range)
            .nice();
    }
};

// -- PercentDiffAxis -- \\
/* # `PercentDiffAxis(input range, opts)` 
 * ### inherits `ContinuousAxis`
 *
 * A variation of ContinuousAxis where the domain is +/- the greatest 
 * value passed, assuming these values represent percent differences. 
 * The value 0 will always be at the center.
 *
 * ## Requires
 *  - d3 = v3
 *
 * ## Arguments
 *  - `input` : See `ContinuousAxis`.
 *  - `range` : See `ContinuousAxis`.
 *  - `opts`  : See `ContinuousAxis`.
 *
 */
function PercentDiffAxis(input, range, opts){
    ContinuousAxis.call(this, input, range, opts);

};
PercentDiffAxis.prototype = Object.create(ContinuousAxis.prototype);
PercentDiffAxis.prototype.constructor = PercentDiffAxis;

// Override
PercentDiffAxis.prototype.computeDomain = function(){
    var min = d3.min(this.input, this.accessor);
    var max = d3.max(this.input, this.accessor);
    var maxdiff = (max > Math.abs(min)) ? max : Math.abs(min);

    this.domain = [-maxdiff, maxdiff];
};
// Override
PercentDiffAxis.prototype.drawAxis = function(){
    ContinuousAxis.prototype.drawAxis.call(this);
    d3.select(this.getContainer()).selectAll('.tick').selectAll('text')
        .text(function(d){
            return d3.select(this).text() + '%';
        })
};

/* # `DiscreteAxis(input range, opts)` 
 * ### inherits `GeneralAxis`
 *
 * A 'virtual class' representing a discrete axis. The axis maps 
 * each value of the domain passed as `input` to a single value
 * in the output `range`.
 *
 * ## Requires
 *  - d3 = v3
 *
 * ## Arguments
 *  - `input` : See `GeneralAxis`.
 *  - `range` : See `GeneralAxis`.
 *  - `opts`  : Same as `GeneralAxis`, but adds:
 *
 *      __Keys:__
 *
 *      - `sort`    : A compare function for comparing two values 
 *                    in input.
 *      - `padding` : How much padding to use on either end of the
 *                    axis, in pixels.
 *
 */
function DiscreteAxis(input, range, opts){
    GeneralAxis.call(this, input, range, opts);

    this.sort = (opts.sort) ? opts.sort : function(a,b){
        if (typeof(a) != "undefined" && typeof(b) != "undefined"){
            a = a.toString();
            b = b.toString();
            if (a>b) return 1;
            else if (a<b) return -1;
            else return 0;
        } else {
            if (typeof(a) == "undefined"){
                return 1;
            } else if (typeof(b) == "undefined"){
                return -1;
            }
        }
    };

    this.padding = (opts.padding) ? opts.padding : 1.0;

    this.computeDomain();
    this.computeScale();
    this.computeAxis();
}
DiscreteAxis.prototype = Object.create(GeneralAxis.prototype);
DiscreteAxis.prototype.constructor = DiscreteAxis;

// Accessors

// Override
DiscreteAxis.prototype.getDomain = function(){
    return this.sorteddomain;
};

/* # `DiscreteAxis.scale(d)`
 *
 * Convert the value `d` from within the domain to its 
 * mapped value.
 *
 * ## Arguments
 *  - `d`   : The value to be converted.
 *
 * ## Return
 *
 *  The value `d` is mapped to.
 *
 */
DiscreteAxis.prototype.scale = function(item){
    if (this.domain.has(item)){
        return this.d3scale(item);
    } else {
        // try to guess the number, will give the same number for multiple inputs though
        var domain = this.getDomain();
        for (var i = 0; i<domain.length; i++){
            if (this.sort(item,domain[i]) < 0) // startVal is 'greater than' the value in the domain returned by inverseScale, according to the sort function
                return (this.d3scale(domain[i]) + this.d3scale(domain[i-1]))/2;
        }
        return undefined;
    }
};

/* # `DiscreteAxis.inverseScale(d)`
 *
 * Convert the value `d` from the output range to
 * the value that maps to it.
 *
 * ## Arguments
 *  - `d`   : The value to be converted.
 *
 * ## Return
 *
 *  The value from which `d` is mapped.
 *
 */
DiscreteAxis.prototype.inverseScale = function(num, round){
    // Given some number, find the item closest to it
    var domainvalues = this.getDomain();
    for (var i = 0; i<domainvalues.length; i++){
        if (this.scale(domainvalues[i]) >= num){
            if (this.scale(domainvalues[i]) == num){
                return domainvalues[i];
            } else if (i==0) {
                return domainvalues[i];
            } else if (round == 'up') {
                return domainvalues[i];
            } else if (round == 'down') {
                return domainvalues[i-1];
            } else {
                if (Math.abs(this.scale(domainvalues[i])-num) > Math.abs(this.scale(domainvalues[i-1])-num)){
                    return domainvalues[i-1];
                } else {
                    return domainvalues[i];
                }
            }
        }
    }
    return domainvalues[domainvalues.length-1];
};

/* # `DiscreteAxis.inDomain(d)`
 *
 * ## Arguments
 *  - `d`   : A value possibly within the domain.
 *
 * ## Return
 * 
 *  True if `d` is in the domain. False otherwise. 
 *
 */
DiscreteAxis.prototype.inDomain = function(d){
    return this.domain.has(d);
};
/* # `DiscreteAxis.aboveDomain(d)`
 *
 * ## Arguments
 *  - `d`   : A value possibly within the domain.
 *
 * ## Return
 *
 *  True if `d` is above the domain. False otherwise. 
 *
 */
DiscreteAxis.prototype.aboveDomain = function(d){
    var domain = this.getDomain();
    return this.sort(d,domain[domain.length-1]) > 0;
};
/* # `DiscreteAxis.belowDomain(d)`
 *
 * ## Arguments
 *  - `d`   : A value possibly within the domain.
 *
 * ## Return
 *
 *  True if `d` is below the domain. False otherwise. 
 *
 */
DiscreteAxis.prototype.belowDomain = function(d){
    var domain = this.getDomain();
    return this.sort(d,domain[0]) < 0;
};

/* # `DiscreteAxis.getSubdomain(min,max,range_or_domain)`
 *
 * Get a new domain either from an output range or a domain.
 *
 * ## Arguments
 *  - `min`             : The lower bound of the domain.
 *  - `max`             : The upper bound of the domain.
 *  - `range_or_domain` : Whether `min` and `max` are domain
 *                        or range values.
 *
 * ## Return
 *
 *  A new domain.
 *
 */
DiscreteAxis.prototype.getSubdomain = function(min,max,range_or_domain){
    if (min instanceof Array){
        max = min[1];
        min = min[0];
    }
    var domain = this.getDomain();
    if (!range_or_domain || range_or_domain == 'r'){
        var startVal = this.inverseScale(min,'up');
        var endVal = this.inverseScale(max,'down');
    } else if (range_or_domain == 'd'){
        var startVal = min;
        var endVal = max;
    }
    var startIndex = null, endIndex = null;
    for (var i = 0, end = domain.length - 1; i<domain.length; i++){
        if (startIndex == null && this.sort(startVal,domain[i]) <= 0) // startVal is 'greater than' the value in the domain returned by inverseScale, according to the sort function
            startIndex = i;
        if (endIndex == null && this.sort(endVal,domain[end - i]) >= 0) // endVal is 'less than' the value in the domain returned by inverseScale, according to the sort function
            endIndex = end-i;
    }
    return domain.slice(startIndex,endIndex+1);
};

/* # `DiscreteAxis.getSubAxis(subrangemin, subrangemax)`
 *
 * Create a new axis which maps only the values of the domain which map
 * to values within `subrangemin` and `subrangemax` to the original
 * range. 
 *
 * ## Arguments
 *  - `subrangemin` : The lower bound of the range.
 *  - `subrangemax` : The upper bound of the range.
 *
 * ## Return
 *
 *  A new axis object.
 *
 */
DiscreteAxis.prototype.getSubAxis = function(submin, submax){
    if (submin instanceof Array){
        submax = submin[1];
        submin = submin[0];
    }
    var subaxis = this.getCopy();
    if (!(isNaN(submin) || isNaN(submax))){
        if (submin > submax){
            var temp = submax;
            submax = submin;
            submin = temp;
        }
        var subdomain = this.getSubdomain(submin,submax);
    } else {
        if (this.sort(submin,submax)>0){
            var temp = submax;
            submax = submin;
            submin = temp;
        }
        var subdomain = this.getSubdomain(submin,submax,'d');
    }
    subaxis.domain = d3.set(subdomain);
    subaxis.sorteddomain = subdomain;
    subaxis.computeScale();
    subaxis.computeAxis();

    return subaxis;
};

// Mutators

/* # `DiscreteAxis.computePanScale(subaxis)`
 *
 * Computes the ratio between motion on this axis and motion
 * on `subaxis` assuming `subaxis` was derived from this axis.
 *
 * ## Arguments
 *  - `subaxis` : A derived axis.
 *
 * ## Return
 *
 *  The movement factor.
 *
 */
DiscreteAxis.prototype.computePanScale = function(subaxis){
    var subdomain = subaxis.getDomain();
    this.panscale = Math.abs(this.scale(subdomain[subdomain.length-1])-this.scale(subdomain[0]))/Math.abs(subaxis.scale(subdomain[subdomain.length-1])-subaxis.scale(subdomain[0]))*4;
};

/* # `DiscreteAxis.computeDomain()`
 *
 * Compute the axis domain from `input`.
 *
 */
DiscreteAxis.prototype.computeDomain = function(){
    this.domain = d3.set();
    for (var i = 0; i<this.input.length; i++){
        this.domain.add(this.accessor(this.input[i]));
    }
    this.sorteddomain = this.domain.values().sort(this.sort);
};

/* # `DiscreteAxis.computeScale()`
 *
 * Compute the scale for the axis, i.e., which values in the
 * domain map to which values in the range. By default, adds
 * padding to make drawing the axis look nice.
 *
 * ## Arguments
 *  - `notnice` : True if no padding should be included.
 *
 */
DiscreteAxis.prototype.computeScale = function(){
    this.d3scale = d3.scale.ordinal()
        .domain(this.domain.values().sort(this.sort))
        .rangePoints(this.range, this.padding);
};

/* # `DiscreteAxis.getTickSeparation()`
 *
 * ## Return
 *
 *  Return the distance, in pixels, between values on the
 *  x-axis.
 *
 */
DiscreteAxis.prototype.getTickSeparation = function(){
    // Get the distance in pixels between major ticks
    // Relies on the assumption that all ticks are spaced equally
    var domain = this.getDomain();
    if (domain.length > 1) {
        return Math.abs(this.scale(domain[0])-this.scale(domain[1]));
    } else {
        var range = this.getRange();
        return Math.abs(range[1]-range[0])*0.5;
    }
};

var FFFFFF = parseInt("0xFFFFFF");
function invColor(color){
    if (color){
        if (color[0] == '#') {
            color = color.slice(1,color.length);
            if (color.length == 6 || color.length == 3){
                if (color.length == 3){
                    var color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
                }
                var inv = (FFFFFF - parseInt("0x"+color)).toString(16);
                while (inv.length < 6) inv = '0'+inv;
                return '#'+inv;
            } else {
                return '#'+color;
            }
        } else if (color.search('rgb') == 0){
            var components = color.split('(')[1].split(')')[0].split(',');
            var r = -(components[0]-255);
            var g = -(components[1]-255);
            var b = -(components[2]-255);
            return 'rgb('+r+','+g+','+b+')';
        } else {
            return color;
        }
    } else {
        return color;
    }
}
function lightenColor(color,lighter){
    if (color){
        if (color[0] == '#') {
            color = color.slice(1,color.length);
            if (color.length == 6 || color.length == 3){
                if (color.length == 3){
                    var color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
                }
                var lighter = parseInt("0x" + lighter);
                var r = parseInt("0x"+color.slice(0,2)) + parseInt("0x"+lighter);
                var g = parseInt("0x"+color.slice(2,4)) + parseInt("0x"+lighter);
                var b = parseInt("0x"+color.slice(4,6)) + parseInt("0x"+lighter);
                if (r > 255) r = 255; if (g > 255) g = 255; if (b > 255) b = 255;
                r = r.toString(16);
                g = g.toString(16);
                b = b.toString(16);
                if (r.length==1) r = '0'+r;
                if (g.length==1) g = '0'+g;
                if (b.length==1) b = '0'+b;
                return '#' + (r+g+b);
            } else {
                return '#'+color;
            }
        } else if (color.search('rgb') == 0){
            var components = color.split('(')[1].split(')')[0].split(',');
            var r = (components[0]+lighter);
            var g = (components[1]+lighter);
            var b = (components[2]+lighter);
            if (r > 255) r = 255; if (g > 255) g = 255; if (b > 255) b = 255;
            return 'rgb('+r+','+g+','+b+')';
        } else {
            return color;
        }
    } else {
        return color;
    }
}
function darkenColor(color,darker){
    if (color){
        if (color[0] == '#') {
            color = color.slice(1,color.length);
            if (color.length == 6 || color.length == 3){
                if (color.length == 3){
                    var color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
                }
                var darker = parseInt("0x" + darker);
                var r = parseInt("0x"+color.slice(0,2)) - parseInt("0x"+darker);
                var g = parseInt("0x"+color.slice(2,4)) - parseInt("0x"+darker);
                var b = parseInt("0x"+color.slice(4,6)) - parseInt("0x"+darker);
                if (r < 0) r = 0; if (g < 0) g = 0; if (b < 0) b = 0;
                r = r.toString(16);
                g = g.toString(16);
                b = b.toString(16);
                if (r.length==1) r = '0'+r;
                if (g.length==1) g = '0'+g;
                if (b.length==1) b = '0'+b;
                return '#' + (r+g+b);
            } else {
                return '#'+color;
            }
        } else if (color.search('rgb') == 0){
            var components = color.split('(')[1].split(')')[0].split(',');
            var r = (components[0]-darker);
            var g = (components[1]-darker);
            var b = (components[2]-darker);
            if (r < 0) r = 0; if (g < 0) g = 0; if (b < 0) b = 0;
            return 'rgb('+r+','+g+','+b+')';
        } else {
            return color;
        }
    } else {
        return color;
    }
}

function Clone() { }
function getClone(){
    // Thanks to http://oranlooney.com/functional-javascript for the fast cloning idea.
    Clone.prototype = this;
    return new Clone();
};
