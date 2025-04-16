angular.module('teamsApp', [])
  .controller('TeamsController', function($scope) {
    (function checkAccessAndFilterTeams() {
  const allowedRoles = [
    'Admin', 'Operations Manager', 'HR Manager',
    'Product Manager', 'Sales Manager', 'Finance Manager', 'Marketing Manager'
  ];
  const userRole = sessionStorage.getItem('userRole');
  const userEmail = sessionStorage.getItem('userEmail'); // assume this is set on login

  const unauthorizedDiv = document.getElementById('unauthorized-message');
  const mainContent = document.querySelector('.main-content');

  if (!allowedRoles.includes(userRole)) {
    // Filter out all managers except the one that includes this user in their team
    $scope.$watchGroup(['managers', 'allEmployees'], function() {
      if ($scope.managers.length > 0) {
        $scope.managers = $scope.managers.filter(manager => {
          return manager.team && manager.team.some(member => member.email === userEmail);
        });
      }
    });

    // Optional: hide "Add New Team" button
    document.querySelector('button[ng-click="openAddTeamModal()"]').style.display = 'none';
  }

  unauthorizedDiv.style.display = 'none';
  mainContent.style.display = 'block';
})();

(function checkAccessAndFilterTeams() {
  const allowedRoles = [
    'Admin', 'Operations Manager', 'HR Manager',
    'Product Manager', 'Sales Manager', 'Finance Manager', 'Marketing Manager'
  ];
  const userRole = sessionStorage.getItem('userRole');
  const userEmail = sessionStorage.getItem('userEmail'); // assume this is set on login

  const unauthorizedDiv = document.getElementById('unauthorized-message');
  const mainContent = document.querySelector('.main-content');

  if (!allowedRoles.includes(userRole)) {
    // Filter out all managers except the one that includes this user in their team
    $scope.$watchGroup(['managers', 'allEmployees'], function() {
      if ($scope.managers.length > 0) {
        $scope.managers = $scope.managers.filter(manager => {
          return manager.team && manager.team.some(member => member.email === userEmail);
        });
      }
    });

    // Optional: hide "Add New Team" button
    document.querySelector('button[ng-click="openAddTeamModal()"]').style.display = 'none';
  }

  unauthorizedDiv.style.display = 'none';
  mainContent.style.display = 'block';
})();

    $scope.managers = [];
    $scope.allEmployees = [];
    $scope.modalMode = 'Add';
    $scope.selectedManager = null;
    $scope.selectedMember = {};
    $scope.selectedTeamManager = null;

    const departments = ['Sales', 'Marketing', 'Finance', 'HR', 'Product', 'Operations'];

    // Load Managers
    loadManagers();
    // Load Employees
    loadEmployees();

    function loadManagers() {
      const savedManagers = localStorage.getItem('managers');
      if (savedManagers) {
        $scope.managers = JSON.parse(savedManagers);
      }
    }

    function loadEmployees() {
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        $scope.allEmployees = JSON.parse(savedEmployees);
      }
    }

    function saveManagers() {
      localStorage.setItem('managers', JSON.stringify($scope.managers));
    }

    $scope.getUnassignedEmployees = function() {
      if (!$scope.allEmployees || !$scope.selectedManager) return [];

      const assignedEmails = $scope.managers.flatMap(m => 
        (m.team || []).map(t => t.email)
      );

      return $scope.allEmployees.filter(emp => {
        const notAssigned = !assignedEmails.includes(emp.email);
        const empTeam = emp.role ? emp.role.toLowerCase() : '';
        const mgrDept = $scope.selectedManager.department ? $scope.selectedManager.department.toLowerCase() : '';
        const departmentMatch = empTeam.includes(mgrDept); // "Sales Team" includes "sales"
        return notAssigned && departmentMatch;
      });
    };

    $scope.openAssignModal = function(manager) {
      $scope.modalMode = 'Add';
      $scope.selectedManager = manager;
      $scope.selectedMember = {};
      $('#memberModal').modal('show');
    };

    $scope.populateSelectedMemberDetails = function() {
      if ($scope.selectedMember) {
        $scope.selectedMember.email = $scope.selectedMember.email;
        $scope.selectedMember.phone = $scope.selectedMember.phone;
      }
    };

    $scope.openEditModal = function(manager, member) {
      $scope.modalMode = 'Edit';
      $scope.selectedManager = manager;
      $scope.selectedMember = angular.copy(member);
      $('#memberModal').modal('show');
    };

    $scope.saveMember = function() {
      if ($scope.modalMode === 'Add') {
        if (!$scope.selectedManager.team) $scope.selectedManager.team = [];

        const newMember = {
          name: $scope.selectedMember.name,
          email: $scope.selectedMember.email,
          phone: $scope.selectedMember.phone
        };

        $scope.selectedManager.team.push(newMember);

      } else if ($scope.modalMode === 'Edit') {
        const index = $scope.selectedManager.team.findIndex(m => m.email === $scope.selectedMember.email);
        if (index > -1) {
          $scope.selectedManager.team[index] = angular.copy($scope.selectedMember);
        }
      }

      saveManagers();
      $('#memberModal').modal('hide');
    };

    $scope.openAddTeamModal = function() {
      $scope.selectedTeamManager = null;
      $('#teamModal').modal('show');
    };

    $scope.confirmAddTeam = function() {
      if ($scope.selectedTeamManager) {
        const newManager = {
          id: $scope.selectedTeamManager.id,
          name: $scope.selectedTeamManager.name,
          email: $scope.selectedTeamManager.email,
          phone: $scope.selectedTeamManager.phone,
          department: 'New Department',
          team: []
        };
        $scope.managers.push(newManager);
        saveManagers();
        $('#teamModal').modal('hide');
      }
    };

    $scope.removeMember = function(manager, member) {
      const idx = manager.team.indexOf(member);
      if (idx > -1) {
        manager.team.splice(idx, 1);
        saveManagers();
      }
    };
  });