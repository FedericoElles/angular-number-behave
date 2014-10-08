"use strict";

angular.module( 'angularNumberBehave', [
])


.service('numberBehave', function() {


  //formats a number into a currency
  this.formatCurrency = function(viewValue) {
    var parts = (''+viewValue).split(',');
    if (parts.length > 1){
      parts[1] = (parts[1]+'00').substr(0,2);
    } else {
      parts.push('00');
    }
    return parts.join(',');
  };


  //parse any currency into a float
  this.parseCurrency = function(strValue){
    return parseFloat((''+strValue).replace(',','.'),10);
  };


  //make sure a number is between two bounderies
  this.maxBetween = function(num,min,max){
    var r = num;
    if (!isNaN(num)){
      if (typeof min !== 'undefined'){
        r = (r<min) ? min : r;
      }
      if (typeof max !== 'undefined'){
        r = (r>max) ? max : r;
      }
    }
    return r;
  };
})


.directive('validNumber', ['$parse', 'numberBehave', function($parse, numberBehave) {
  return {
    require: '?ngModel',
    link: function(scope, element, attrs, ngModelCtrl) {
      if(!ngModelCtrl) {
        return;
      }
      var parts;
      var flagEditing = false;
      var allowDecimal = (typeof attrs['allowDecimal'] !== 'undefined' &&
                        attrs['allowDecimal'] !== 'false');
      var isCurrency = (typeof attrs['currency'] !== 'undefined');
      var firstRun = true;
      var min;
      var max;

      ngModelCtrl.$setValidity('numberBehave', false);


      //console.log('allowDecimal',allowDecimal,attrs);

      scope.$watch(function(){return ngModelCtrl.$viewValue;},function(newVal,oldVal){
        //console.log('viewValue.change',oldVal,newVal);
        if (oldVal !== newVal || firstRun){
          firstRun = false;
          if ((newVal % 1 !== 0 || isCurrency) && !flagEditing){
            var clean = (''+newVal).replace(/\./g,',');
            if (isCurrency){
              clean = numberBehave.formatCurrency(clean);
            }

            ngModelCtrl.$setViewValue(clean);
            ngModelCtrl.$render();
          }
        }
      });

      ngModelCtrl.$parsers.push(function(val) {
        //console.log('format Model',val);
        var clean = val;
        var floatVal = 0;
        var floatValOriginal;
        if (allowDecimal){
          clean = clean.replace(/\./g,',');
          clean = clean.replace(/,,/g,',');
          clean = clean.replace( /[^0-9,]+/g, '');

          if (clean.length > 0){
            //first may not be ,
            while (clean.substr(0,1) === ',') {
              clean = clean.substr(1);
            }
            //prevent more than one comma
            clean = clean.replace(',','X');
            clean = clean.replace(/,/g,'');
            clean = clean.replace('X',',');

          }
        }else{
          clean = val.replace( /[^0-9]+/g, '');
        }

        if (val !== clean) {
          if (isCurrency && clean){
            clean = numberBehave.formatCurrency(clean);
          }
          ngModelCtrl.$setViewValue(clean);
          ngModelCtrl.$render();
        }

        //convert value to number
        floatVal = numberBehave.parseCurrency(clean);

        if (isNaN(floatVal)){
          floatVal = 0;
        }

        floatValOriginal = floatVal;
        min = scope.$eval(attrs.min);
        max = scope.$eval(attrs.max);
        floatVal = numberBehave.maxBetween(floatVal,min,max);
        //console.log('numberBehave', floatValOriginal, floatVal,'minmax',min,max);
        ngModelCtrl.$setValidity('numberBehave', floatValOriginal !== floatVal);

        //console.log('Number',ngModelCtrl.$viewValue,floatVal);
        return floatVal;
      }); //end parser


      element.bind('keypress', function(event) {
        if(event.keyCode === 32) {
          event.preventDefault();
        }
      });


      element.bind('focus', function(event) {
        flagEditing = true;
      });


      element.bind('blur', function(event) {
        flagEditing = false;

        //change viewValue if different from value
        if (ngModelCtrl.$modelValue !==
            numberBehave.parseCurrency(ngModelCtrl.$viewValue)){
          ngModelCtrl.$setViewValue(''+ngModelCtrl.$modelValue);
          ngModelCtrl.$render();
        }

        //format currency
        if (isCurrency){
          ngModelCtrl.$setViewValue(
            numberBehave.formatCurrency(ngModelCtrl.$viewValue)
          );
          ngModelCtrl.$render();
        }
      });
    }
  };
}])

.directive('increaseNumber', function($parse, numberBehave) {
  return {
    require: '?ngModel',
    //scope: {'ngModel':'='},
    link: function(scope, element, attrs, ngModelCtrl) {
      if(!ngModelCtrl) {
        return;
      }
      var rules,
          x,
          mod,
          min,
          max,
          val;

      element.bind('click', function(event) {
        rules = scope.$eval(attrs.increaseNumber);
        val = scope.$eval(attrs.ngModel);


        //console.log('rules',rules,scope.ngModel);
        for (x in rules){
          if (rules[x]){
            mod = parseFloat(x,10);
            //value must remain larger 0
            if (!isNaN(mod) && (val + mod >= 0)){
              //fix rounding errors when using decimals
              val = (Math.round(val*100) + Math.round(mod*100))/100;
              min = scope.$eval(attrs.min);
              max = scope.$eval(attrs.max);
              val = numberBehave.maxBetween(val,min,max);
              //set value
              scope.$eval(attrs.ngModel + "=" + val);
              scope.$apply();
            }
          }
        }
      });
    }
  }
})

;
