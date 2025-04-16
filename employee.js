angular.module('employeesApp', [])
  .controller('EmployeesController', function($scope, $http) {

    (function checkAccess() {
      const allowedRoles = ['Admin', 'HR Manager', 'HR Team'];
      const userRole = sessionStorage.getItem('userRole');

      const unauthorizedDiv = document.getElementById('unauthorized-message');
      const mainContent = document.querySelector('.main-content');

      if (!allowedRoles.includes(userRole)) {
        unauthorizedDiv.style.display = 'block';
        mainContent.style.display = 'none';
      } else {
        unauthorizedDiv.style.display = 'none';
        mainContent.style.display = 'block';
      }
    })();

    $scope.roles = [
      'Sales Team', 'Finance Team', 'Operation Team', 'Marketing Team', 'Product Team'
    ];

    $scope.employees = JSON.parse(localStorage.getItem('employees')) || [];
    $scope.searchText = '';
    $scope.selectedCompany = '';
    $scope.currentPage = 1;
    $scope.pageSize = 5;
    $scope.isEditMode = false;
    $scope.selectedEmployee = {};
    $scope.companies = [];

    if ($scope.employees.length === 0) {
      $http.get('https://jsonplaceholder.typicode.com/users').then(function(response) {
        $http.get('https://randomuser.me/api/?results=' + response.data.length).then(function(avatarResponse) {
          const avatars = avatarResponse.data.results;
          $scope.employees = response.data.map((emp, idx) => ({
            id: Date.now() + idx,
            name: emp.name,
            email: emp.email,
            phone: emp.phone,
            company: { name: emp.company.name },
            role: $scope.roles[Math.floor(Math.random() * $scope.roles.length)],
            photo: avatars[idx]?.picture.thumbnail || 'https://via.placeholder.com/60'
          }));
          updateCompanies();
          saveToLocalStorage();
        });
      });
    } else {
      updateCompanies();
    }

    function updateCompanies() {
      const companySet = new Set($scope.employees.map(e => e.company.name));
      $scope.companies = Array.from(companySet).sort();
    }

    function saveToLocalStorage() {
      localStorage.setItem('employees', JSON.stringify($scope.employees));
    }

    $scope.customFilter = function(emp) {
      const matchSearch = !$scope.searchText ||
        emp.name.toLowerCase().includes($scope.searchText.toLowerCase()) ||
        emp.email.toLowerCase().includes($scope.searchText.toLowerCase());
      const matchCompany = !$scope.selectedCompany || emp.company.name === $scope.selectedCompany;
      return matchSearch && matchCompany;
    };

    $scope.getPages = function() {
      const totalItems = ($scope.employees.filter($scope.customFilter)).length;
      $scope.totalPages = Math.ceil(totalItems / $scope.pageSize);
      return Array.from({ length: $scope.totalPages }, (_, i) => i + 1);
    };

    $scope.setPage = function(page) {
      if (page >= 1 && page <= $scope.totalPages) {
        $scope.currentPage = page;
      }
    };

    $scope.openAddModal = function() {
      $scope.isEditMode = false;
      $scope.selectedEmployee = { company: {}, role: '' };
      $('#employeeModal').modal('show');
    };

    $scope.openEditModal = function(emp) {
      $scope.isEditMode = true;
      $scope.selectedEmployee = angular.copy(emp);
      $scope.editIndex = $scope.employees.indexOf(emp);
      $('#employeeModal').modal('show');
    };

    $scope.saveEmployee = function() {
      if ($scope.selectedEmployee.name && $scope.selectedEmployee.email && $scope.selectedEmployee.company.name && $scope.selectedEmployee.role) {
        if ($scope.isEditMode) {
          $scope.employees[$scope.editIndex] = angular.copy($scope.selectedEmployee);
          saveToLocalStorage();
          $('#employeeModal').modal('hide');
        } else {
          $http.get('https://randomuser.me/api/').then(function(res) {
            $scope.selectedEmployee.photo = res.data.results[0].picture.thumbnail;
            $scope.selectedEmployee.id = Date.now();
            $scope.employees.push(angular.copy($scope.selectedEmployee));
            updateCompanies();
            saveToLocalStorage();
            $('#employeeModal').modal('hide');
          });
        }
      } else {
        alert('Please fill in all required fields.');
      }
    };

    $scope.deleteEmployee = function(emp) {
      if (confirm("Are you sure you want to delete this employee?")) {
        const index = $scope.employees.indexOf(emp);
        if (index !== -1) {
          $scope.employees.splice(index, 1);
          updateCompanies();
          saveToLocalStorage();
        }
      }
    };

  });
