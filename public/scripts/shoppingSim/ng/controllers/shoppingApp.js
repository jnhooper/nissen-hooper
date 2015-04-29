/**
 * Created by John on 4/29/2015.
 */
var SimApp=angular.module("SimApp",[]);
SimApp.controller('mainCtrl', function($scope){
    var ids = _.uniq(_.pluck(testData, "Id"));
    $scope.batch_nums=ids;
    console.log($scope.batch_nums);
    var keys = [];

    _.each(ids, function(ID){
        if($scope["test"+ID]==undefined) {
            $scope["test" + ID]=_.where(testData,{Id: ID});
            if(keys.length==0){
                keys= _.keys($scope["test" + ID][0]);
            }

        }
    });

    console.log("scope", $scope);

    _.each(ids,function(batch){
        _.each($scope["test"+batch],function(test, index){
            var data = [];

            _.each(keys, function(key){//change structure
                if(!isNaN(parseFloat(test[key]))) {
                    data.push({Name: key, Value: parseFloat(test[key])})
                }
            });

            $scope["test"+batch][index]=data;
        })
    });

    console.log($scope);


    //_.each(keys, function(key){
    //    if(!isNaN(parseFloat(batch1[key]))){
    //        data.push({Name:key, Value:parseFloat(batch1[key])})
    //    }
    //});





    //select the one you click on
    $scope.selectData=function(mydata){
        mydata.checked= !mydata.checked;
        console.log(mydata);
    };

    $scope.dataTable=[];

    //select which batch of tests you want
    $scope.selectBatch=function(id){
        $scope.selectedBatch = $scope["test"+id];
        $scope.dataTable=[];

    };

    //select which test in the batch you want
    $scope.data;
    $scope.selectTest = function(test){
        var i =0;
        $scope.dataTable=[];
        for(i; i <test.length;i+=3){
            $scope.dataTable.push([test[i], test[i+1], test[i+2]])
        }
        for(i; i<test.length;i++){
            $scope.dataTable.push([test[i]]);
        }
        $scope.data=test;
        console.log($scope.dataTable);
    }





    //change background color
    $scope.bgSwap=function(d){
        var result="";
        if(d.checked){
            result="bg-success";
        }
        return result;
    }
});