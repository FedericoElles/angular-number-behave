angular-number-behave
=====================

Imput field directive to easily format and modify a number or currency value

## Example ##

    <button type="button" ng-model="ctrl.num"
            increase-number="{'-0.1':ctrl.num<=1,'-1':ctrl.num>1}">-</button>
     <input ng-model="ctrl.num"
            type="text"
            valid-number
            allow-decimal
            currency
            maxlength="4"
            class="span12" type="text">
      <button type="button" ng-model="ctrl.num"
              increase-number="{'0.1':ctrl.num<1,'1':ctrl.num>=1}">+</button>