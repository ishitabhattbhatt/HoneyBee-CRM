angular.module('projectApp', [])
  .controller('ProjectController', function ($scope) {

    (function checkAccess() {
      const allowedRoles = ['Admin', 'Operations Manager', 'Operations Team', 'Product Manager', 'Product Team'];
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

    const localKey = 'projectData';
    const dealsKey = 'projects';

    // Convert project deadlines to Date objects
    let savedProjects = JSON.parse(localStorage.getItem(localKey)) || [
      { name: 'CRM Build', client: 'ACME Corp', status: 'Ongoing', deadline: '2025-04-30', notes: '', description: '', assignedTo: '' },
      { name: 'Inventory System', client: 'BeeTech', status: 'Completed', deadline: '2025-03-25', notes: '', description: '', assignedTo: '' },
      { name: 'Website Redesign', client: 'SoftSpark', status: 'To Do', deadline: '2025-05-15', notes: '', description: '', assignedTo: '' }
    ];

    savedProjects.forEach(p => {
      if (typeof p.deadline === 'string') {
        p.deadline = new Date(p.deadline);
      }
    });

    const convertedDeals = JSON.parse(localStorage.getItem(dealsKey)) || [];

    convertedDeals.forEach(deal => {
      const validDeal = {
        name: deal.title || 'Unknown Project',
        client: deal.customer || 'Unknown Client',
        status: 'Not Started',
        deadline: new Date(deal.deadline || '2025-12-31'),
        notes: '',
        description: '',
        assignedTo: deal.assignedTo || '',
      };
      const alreadyExists = savedProjects.some(p => p.name === validDeal.name && p.client === validDeal.client);
      if (!alreadyExists) {
        savedProjects.unshift(validDeal);
      }
    });

    localStorage.setItem(localKey, JSON.stringify(savedProjects));
    $scope.projects = savedProjects;

    const savedManagers = localStorage.getItem('managers');
    const allManagers = savedManagers ? JSON.parse(savedManagers) : [];
    $scope.managers = allManagers.filter(mgr => mgr.department === 'Product');

    // UI State
    $scope.selectedProject = null;
    $scope.originalProject = null;
    $scope.activeTab = 'details';
    $scope.searchText = '';
    $scope.filterStatus = '';

    $scope.getManagerName = function (email) {
      const manager = $scope.managers.find(mgr => mgr.email === email);
      return manager ? manager.name : email;
    };

    $scope.customProjectFilter = function (project) {
      const matchText = !$scope.searchText ||
        project.name.toLowerCase().includes($scope.searchText.toLowerCase()) ||
        project.client.toLowerCase().includes($scope.searchText.toLowerCase());

      const matchStatus = !$scope.filterStatus || project.status === $scope.filterStatus;

      return matchText && matchStatus;
    };

    $scope.viewProject = function (project) {
      const projectCopy = angular.copy(project);
      if (typeof projectCopy.deadline === 'string') {
        projectCopy.deadline = new Date(projectCopy.deadline);
      }
      $scope.selectedProject = projectCopy;
      $scope.originalProject = project;
      $scope.activeTab = 'details';
    };

    $scope.backToProjectList = function () {
      $scope.selectedProject = null;
    };

    $scope.addNewProject = function () {
      $scope.selectedProject = {
        name: '',
        client: '',
        assignedTo: '',
        status: 'Not Started',
        deadline: null,
        notes: '',
        description: ''
      };
      $scope.originalProject = null;
      $scope.activeTab = 'details';
    };

    $scope.saveProject = function () {
      if ($scope.originalProject) {
        angular.extend($scope.originalProject, $scope.selectedProject);
      } else {
        $scope.projects.unshift(angular.copy($scope.selectedProject));
      }
      localStorage.setItem(localKey, JSON.stringify($scope.projects));
      $scope.selectedProject = null;
    };

    $scope.deleteProject = function () {
      if ($scope.originalProject) {
        const index = $scope.projects.indexOf($scope.originalProject);
        if (index > -1) {
          $scope.projects.splice(index, 1);
        }
        localStorage.setItem(localKey, JSON.stringify($scope.projects));
      }
      $scope.selectedProject = null;
    };

  });
