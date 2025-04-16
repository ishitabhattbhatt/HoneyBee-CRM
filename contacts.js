angular.module('crmApp', [])
      .controller('ContactController', function($scope, $http) {

        (function checkAccess() {
          const allowedRoles = ['Admin', 'HR Manager', 'HR Team'];
          const userRole = sessionStorage.getItem('userRole');
        
          const unauthorizedDiv = document.getElementById('unauthorized-message');
          const mainContent = document.querySelector('.main');
        
          if (!allowedRoles.includes(userRole)) {
            unauthorizedDiv.style.display = 'block';
            mainContent.style.display = 'none';
          } else {
            unauthorizedDiv.style.display = 'none';
            mainContent.style.display = 'block';
          }
        })();
        $scope.selectedContact = null;

        $http.get('https://jsonplaceholder.typicode.com/users')
          .then(function(response) {
            const data = response.data;
            $scope.contacts = data.map(user => ({
              name: user.name,
              email: user.email,
              phone: user.phone,
              company: user.company.name,
              city: user.address.city
            }));
          });

        $scope.addNewContact = function() {
          const newContact = {
            name: '',
            email: '',
            phone: '',
            company: '',
            city: ''
          };
          $scope.contacts.push(newContact);
          $scope.viewContact(newContact);
        };

        $scope.viewContact = function(contact) {
          $scope.selectedContact = angular.copy(contact);
          $scope.originalContact = contact;
        };

        $scope.backToList = function() {
          $scope.selectedContact = null;
        };

        $scope.saveContact = function() {
          Object.assign($scope.originalContact, $scope.selectedContact);
          alert('Contact saved!');
        };
      });