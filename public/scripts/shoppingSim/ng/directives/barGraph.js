//idea from here
//http://www.ng-newsletter.com/posts/d3-on-angular.html

SimApp.directive('barChart',['$window', function(){
    return{
        restrict:'A',
        scope:{
            data:"=",
            checked:"=",
            shown:"="
        },
        link:function(scope, element, attrs){

            var margin = parseInt(attrs.margin)||20;
            var barHeight = parseInt(attrs.barheight)|| 20;
            var barPadding = parseInt(attrs.barpadding)||5;

            var svg = d3.select(element[0]).append("svg")
                .style("width", '100%');

            //Browser Resize event
            window.onresize=function(){
                scope.$apply()
            };

            //watch for the resize event then rerender
            scope.$watch(function(){
                return angular.element(window)[0].innerWidth;
            }, function(){
                scope.render(scope.data)
            });

//            watch for data changes and re-render

            scope.$watch('data', function(newVals, oldVals) {
                if(scope.shown|| scope.shown===undefined){
                    return scope.render(newVals);
                }
            }, true);
            //watch for the tab switch
            if(scope.shown!==undefined) {//careful is shown is not a given value.
                scope.$watch('shown', function () {
                    if (scope.shown) {
                        return scope.render(scope.data);
                    }
                }, true);
            }

            console.log(scope);

            scope.render = function(data){//custom d3 code
                //remove all previous items before rerender
                svg.selectAll('*').remove();
                //if we dont pass any data, return out of the element
                if(scope.checked)data= _.where(data,{checked:true});
                if(!data) {return;}


                values = _.pluck(data,'Value');
                console.log(values);
                //variables
                var width = d3.select(element[0]).node().offsetWidth-margin,
                    height=data.length * (barHeight + barPadding), //change once we have more data
                    color = d3.scale.category20(),
                    xScale = d3.scale.linear()
                        .domain([0, d3.max(values, function(d){
                            return d
                        })])
                        .range([0, width]);


                svg.attr('height', height);


                svg.selectAll('rect')
                    .data(data).enter()
                    .append('rect')
                    .attr('height', barHeight)
                    .attr('width', 140)
                    .attr('x', Math.round(margin/2))
                    .attr('y', function(d,i){
                        return i * (barHeight+barPadding);
                    })
                    .attr('fill',function(d){
                        return color(d.Value)
                    })
                    .transition()
                    .duration(1000)
                    .attr('width', function(d){
                        return xScale(d.Value);
                    });

                //label
                svg.selectAll('text')
                    .data(data).enter()
                    .append('text')
                    .attr('fill','black')
                    .attr('y',function(d,i){
                        return i * (barHeight+barPadding)+15;
                    })
                    .attr('x',15)
                    .text(function(d){
                        return d.Name +"("+ d.Value+")";
                    })


            }
        }
    }
}]);
