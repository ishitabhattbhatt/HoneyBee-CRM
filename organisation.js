angular.module('crmApp', [])
      .controller('OrgController', function($scope, $http) {

        (function checkAccess() {
          const allowedRoles = ['Admin', 'Marketing Manager', 'Marketing Team','Sales Manager', 'Sales Team'];
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

        $scope.selectedOrg = null;

        $http.get('https://jsonplaceholder.typicode.com/users')
          .then(function(response) {
            const data = response.data;
            $scope.orgs = data.map(user => ({
              company: user.company.name,
              email: user.email,
              phone: user.phone,
              website: user.website,
              city: user.address.city
            }));
          });

        $scope.addNewOrg = function() {
          const newOrg = {
            company: '',
            email: '',
            phone: '',
            website: '',
            city: ''
          };
          $scope.orgs.push(newOrg);
          $scope.viewOrg(newOrg);
        };

        $scope.viewOrg = function(org) {
          $scope.selectedOrg = angular.copy(org);
          $scope.originalOrg = org;
        };

        $scope.backToList = function() {
          $scope.selectedOrg = null;
        };

        $scope.saveOrg = function() {
          Object.assign($scope.originalOrg, $scope.selectedOrg);
          alert('Organisation saved!');
        };
      });