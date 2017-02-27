(function() {
    'use strict';
    angular.module('myApp', [])
           .controller('myController', MyController)
           .service('listService', ListServiceController);

    MyController.$inject = ['listService'];
    function MyController(listService) {
      var vm = this;
      listService.getItems().then(function(response) {
        vm.items = response.data;
      });

      vm.itemName = "";
      vm.itemDescription = "";

      vm.addItem = function() {
        listService.addItem(vm.itemName, vm.itemDescription).then(function (response) {
          vm.items.push(response.data);
        })
      }
    }

    ListServiceController.$inject = ['$http'];
    function ListServiceController($http) {
      var service = this;

      service.addItem = function(name, description) {
        console.log("adding item: ", name, description)
        return $http.post('add-item', {name: name, description: description});
      }

      service.getItems = function() {
        console.log("getting items");
        return $http.get('get-items');
      }
    }

})();
