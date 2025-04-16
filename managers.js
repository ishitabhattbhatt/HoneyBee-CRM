angular.module('managersApp', [])
  .controller('ManagersController', function($scope, $http) {
    (function checkAccess() {
      const allowedRoles = ['Admin', 'HR Manager', 'HR Team'];
      const userRole = sessionStorage.getItem('userRole');
    
      const unauthorizedDiv = document.getElementById('unauthorized-message');
      const mainContent = document.querySelector('.container');
    
      if (!allowedRoles.includes(userRole)) {
        unauthorizedDiv.style.display = 'block';
        mainContent.style.display = 'none';
      } else {
        unauthorizedDiv.style.display = 'none';
        mainContent.style.display = 'block';
      }
    })();
    // Initialize managers array
    $scope.managers = JSON.parse(localStorage.getItem('managers')) || [];
    $scope.selectedManager = {};
    $scope.isEditMode = false;

    const departments = ['Sales', 'Marketing', 'Finance', 'HR', 'Product', 'Operations'];

    // Load data from API if localStorage is empty
    if ($scope.managers.length === 0) {
      $http.get('https://jsonplaceholder.typicode.com/users').then(function(response) {
        $scope.managers = response.data.map((user, index) => ({
          name: user.name,
          email: user.email,
          phone: user.phone,
          department: departments[index % departments.length]
        }));
        // Save data to localStorage after loading
        localStorage.setItem('managers', JSON.stringify($scope.managers));
      });
    }

    // Function to open the edit modal
    $scope.openEditModal = function(manager) {
      $scope.isEditMode = true;
      $scope.selectedManager = angular.copy(manager);
      $('#managerModal').modal('show');
    };

    // Function to open the add new manager modal
    $scope.openAddManagerModal = function() {
      $scope.isEditMode = false;
      $scope.selectedManager = {};
      $('#managerModal').modal('show');
    };

    // Function to save the manager (either add or update)
    $scope.saveManager = function() {
      if ($scope.isEditMode) {
        // Update existing manager
        const index = $scope.managers.findIndex(m => m.email === $scope.selectedManager.email);
        if (index !== -1) {
          $scope.managers[index] = angular.copy($scope.selectedManager);
        }
      } else {
        // Add new manager
        $scope.managers.push(angular.copy($scope.selectedManager));
      }
      // Save to localStorage after modifying data
      localStorage.setItem('managers', JSON.stringify($scope.managers));
      $('#managerModal').modal('hide');
    };
  });
