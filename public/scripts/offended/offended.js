var OffendedApp = angular.module("OffendedApp", []);
OffendedApp.controller('mainCtrl', function ($scope) {
    $scope.puppy = function (txt) {
        if ($scope.offensive && $scope.text) {
            var offensive = $scope.offensive.split("\n");
            _.each(offensive, function (word) {
                if (word != "" && word != " ") {
                    var re = new RegExp(word, 'g');
                    var sub = "puppy";
                    if (word[word.length - 1] == "s" || word[word.length - 1] == "S") {
                        sub = "puppies"
                    }
                    txt = txt.replace(re, sub);
                }
            });
        }
        return txt
    };
    $scope.hover = false;
    $scope.display = function () {
        $scope.hover = !$scope.hover;
    }
});