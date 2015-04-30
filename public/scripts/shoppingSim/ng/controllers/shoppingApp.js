/**
 * Created by John on 4/29/2015.
 */
var SimApp=angular.module("SimApp",[]);
SimApp.controller('mainCtrl', function($scope){

    //things we dont care about graphing
    var ignore = ["FIELD23", "Id", "Run Time", "Lanes","self-Bag ", "Express Lanes"];

    var ids = _.uniq(_.pluck(testData, "Id"));
    $scope.raw = testData;
    $scope.batch_nums=ids;
    console.log($scope.batch_nums);
    var keys = [];

    _.each(ids, function(ID){
        if($scope["test"+ID]==undefined) {
            $scope["test" + ID]=_.where(testData,{Id: ID});
            if(keys.length==0){
                keys= _.difference(_.keys($scope["test" + ID][0]), ignore);
            }

        }
    });

    console.log("scope", $scope);
    ///////////////////////////////////////////////
    //get the averages
    $scope.averages=[];
    _.each(ids,function(num){
        var sameTest =_.where($scope.raw, {I:num});
        //averages for this test
        var avgTest = {Id:num, data:[]};
        _.each(keys,function(key){
            var values = _.pluck(sameTest,key);
            var sum = 0;
            _.each(values, function(){
                sum+=values;
            });
            var avg = sum/values.length;
            //add the averages
            avgTest.data.push({Name:key, Value:avg});
        });
        $scope.averages.push(avgTest);
    });
    console.log($scope.averages);




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



    //_.each(keys, function(key){
    //    if(!isNaN(parseFloat(batch1[key]))){
    //        data.push({Name:key, Value:parseFloat(batch1[key])})
    //    }
    //});


    $scope.setDetail = function(data){
        $scope.detail=data;
        $scope.$apply()
    };


    //select the one you click on
    $scope.selectData=function(mydata){
        mydata.checked= !mydata.checked;
        console.log(mydata);
    };

    $scope.dataTable=[];

    //select which batch of tests you want
    $scope.selectBatch=function(id){
        console.log("here!",id);
        if(id==undefined){
            id=$scope.selectedBatch;
        }

        $scope.selectedBatch = $scope["test"+id];

        $scope.batch_info= _.findWhere(testData, {Id:id});
        //    id:id,
        //    lanes:$scope.selectedBatch[0].Lanes,
        //    express: _.findWhere($scope.selectedBatch[0],{Name:"Express Lanes"}),
        //    self_bag:$scope.selectedBatch[0]["Self-Bag"],
        //    arrival:$scope.selectedBatch[0]["Arrival Rate"]
        //};
        console.log($scope.batch_info);
        $scope.dataTable=[];
        $scope.data=[];

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

//TODO MAKE IT SO THEY CAN COMPARE THE SAME VALUE ACROSS TESTS