var Test = Backbone.Model.extend({});

var TestView = Backbone.View.extend({
    el:".bar_charts",
    initialize:function(){
        d3.select("body").append("svg");
        this.render();
    },
    template:function(){
        var keys = _.keys(this.model.attributes);
        var html="<div class='data'>";
        var max = 0;
        var self = this;
        _.each(keys, function(key){
           if(parseFloat(self.model.get(key))!=NaN && self.model.get(key)>max){
               max=self.model.get(key);
           }
        });
        console.log(max);
        _.each(keys, function(key){
            html+="<div class='"+key+" 'style='background-color:red' width:"
            +((parseFloat(self.model.get(key))/max)*100)+"% height:'20px'> </div><br><div>"+key
            +" "+self.model.get(key)+"</div>";
        });
        html+="</div>";
        //.attr("width", 50).attr("height", 50).append("circle").attr("cx", 25).attr("cy", 25).attr("r", 25).style("fill", "purple");
        return html;
    },
    render:function(){

        console.log(this.model.attributes);
        this.$el.html(this.template());
        this.drawSVG();
    },
    drawSVG:function(){
        var keys =_.keys(this.model.attributes);
        var data =[];
        var self = this;
        _.each(keys, function(key, i){
            var d = self.model.get(key);
            if(parseFloat(d)!=NaN) {
                data[i] = d;
            }
        });

        var x = d3.scale.linear()
            .domain([0, d3.max(data)])
            .range([0, 800]);

        d3.select(".chart")
            .selectAll("div")
            .data(data)
            .enter().append("div")
            .style("width", function(d) { return x(d) + "px"; })
            .text(function(d) { return d; });
    }
});


















