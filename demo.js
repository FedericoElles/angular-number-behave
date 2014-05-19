
angular.module('demo', [
  'angularNumberBehave'
])

.controller('DemoCtrl',function($scope){
  $scope.ctrl = {
    demo:'Test',
    radius:50,
    radius2:30,
    price:1
  };
})


;
