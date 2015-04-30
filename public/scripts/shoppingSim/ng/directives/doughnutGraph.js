SimApp.directive('moneyPie',['$window', function() {
    return{
        restrict: 'A',
        scope: {
            data: "=",
            hoverData:'&',
            checked:"="
        },
        link: function (scope, element, attrs) {

            var innerRadius = 50,
                outerRadius = 100,
                padding=20;

            var svg = d3.select(element[0]).append("svg")
                .style("width", '100%').attr("height",outerRadius*2 + padding*2);

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
                return scope.render(newVals);
            }, true);

            scope.render = function(data){
                //remove all previous items before rerender
                svg.selectAll('*').remove();
                //if we dont pass any data, return out of the element
                if(scope.checked)data= _.where(data,{checked:true});
                if(!data) {return;}

                var values = _.pluck(data,'Value'),
                    sum= _.reduce(values,function(sum, num){
                        return sum+num
                    }),

                    dScale = d3.scale.linear().domain([0, sum]).range([0,2*Math.PI]),
                    color = d3.scale.category20(),
                    angleCount=0,
                    arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius)
                        .startAngle(function(d,i){
                            return angleCount
                        }).endAngle(function(d){
                            angleCount+=dScale(d.Value);
                            return angleCount
                        });


                svg.selectAll("path").data(data).enter()
                    .append("path")
                    .attr("transform", "translate("+(outerRadius+padding)+","+(outerRadius+padding)+")")
                    .on("mouseover",function(d, i ){
                        return scope.hoverData({data:d})
                    })
                    .attr("d",arc) .transition()
                    .duration(1000)
                    .style("fill", function(d){
                        return color(d.Value)//TODO change this so similar values dont have the same color
                    })






            }
        }
    }
}]);