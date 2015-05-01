var OffendedApp=angular.module("OffendedApp",[]);
OffendedApp.controller('mainCtrl', function($scope){
    $scope.puppy=function(txt){
        if($scope.offensive && $scope.text) {
            var offensive = $scope.offensive.split("\n");
            _.each(offensive,function(word){
                if(word!="" &&word!=" "){
                var re = new RegExp(word, 'g');
                txt = txt.replace(re, 'puppies ');
                }
            });
        }
        return txt
    };
    $scope.hover=false;
    $scope.display=function(){
        $scope.hover = !$scope.hover;
    }
});