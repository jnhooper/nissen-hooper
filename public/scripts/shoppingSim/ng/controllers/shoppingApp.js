/**
 * Created by John on 4/29/2015.
 */
var SimApp=angular.module("SimApp",[]);
console.log("testing");
SimApp.controller('mainCtrl', function($scope){
   $scope.test="test";
    console.log("hello");
    var keys=_.keys(batch1);
    var data =[];
    _.each(keys, function(key){
        if(!isNaN(parseFloat(batch1[key]))){
            data.push({Name:key, Value:parseFloat(batch1[key])})
        }
    });
    console.log(data);
    $scope.dataTable=[];
    var i =0
    for(i; i <data.length;i+=3){
        $scope.dataTable.push([data[i], data[i+1], data[i+2]])
    }
    for(i; i<data.length;i++){
        $scope.dataTable.push([data[i]]);
    }
    $scope.data=data;

    $scope.selectData=function(mydata){
        mydata.checked= !mydata.checked;
        console.log(mydata);
    };
    $scope.bgSwap=function(d){
        var result="";
        if(d.checked){
            result="bg-success";
        }
        return result;
    }
});