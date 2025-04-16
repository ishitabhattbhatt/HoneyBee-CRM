angular.module('crmApp', [])

// Deals Controller
.controller('DealsController', function($scope, $http) {

  (function checkAccess() {
    const allowedRoles = ['Admin', 'Sales Team', 'Sales manager'];
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

  // ✅ Load managers from localStorage and filter Sales department only
  const storedManagers = localStorage.getItem('managers');
  const allManagers = storedManagers ? JSON.parse(storedManagers) : [];
  $scope.users = allManagers.filter(manager => manager.department === 'Sales');

  // ✅ Load from localStorage or generate dummy deals
  const storedDeals = localStorage.getItem('deals');
  $scope.deals = storedDeals ? JSON.parse(storedDeals) : [];

  // Optional fallback - fetch dummy users (only used to generate deals, not for dropdown)
  $http.get('https://jsonplaceholder.typicode.com/users')
    .then(function(response) {
      if ($scope.deals.length === 0) {
        $scope.deals = response.data.map((user, index) => ({
          id: index + 1,
          title: "Deal with " + user.name,
          customer: user.name,
          value: Math.floor(Math.random() * 10000 + 1000),
          stage: ['Negotiation', 'Proposal Sent', 'Won', 'Lost'][index % 4],
          assignedTo: user.id,
          created: new Date(2024, 1, index + 1, 10 + index, 0),
          notes: []
        }));
        saveDeals();
      }
    });

  function saveDeals() {
    localStorage.setItem('deals', JSON.stringify($scope.deals));
  }

  // Function to get user's name by their email
  $scope.getUserNameByEmail = function(email) {
    const user = $scope.users.find(u => u.email === email);
    return user ? user.name : 'Unassigned';
  };

  $scope.formatStageClass = function(stage) {
    return stage.toLowerCase().replace(/\s+/g, '-');
  };

  $scope.addNewDeal = function() {
    const newDeal = {
      id: Date.now(),
      title: '',
      customer: '',
      value: 0,
      stage: 'Negotiation',
      assignedTo: '',
      created: new Date(),
      notes: []
    };
    $scope.deals.push(newDeal);
    saveDeals();
    $scope.viewDeal(newDeal);
  };

  $scope.viewDeal = function(deal) {
    $scope.selectedDeal = angular.copy(deal);
    $scope.originalDeal = deal;
    $scope.activeTab = 'details';
    $scope.newNote = '';
  };

  $scope.backToList = function() {
    $scope.selectedDeal = null;
  };

  $scope.saveDeal = function() {
    Object.assign($scope.originalDeal, $scope.selectedDeal);
    saveDeals();
    alert("Deal saved!");
  };

  $scope.addNote = function() {
    if (!$scope.selectedDeal.notes) {
      $scope.selectedDeal.notes = [];
    }
    if ($scope.newNote.trim()) {
      $scope.selectedDeal.notes.push($scope.newNote.trim());
      $scope.newNote = '';
      $scope.saveDeal();
    }
  };

  $scope.stageFilter = '';
  $scope.setStageFilter = function(stage) {
    $scope.stageFilter = stage;
  };

  $scope.stages = ['Negotiation', 'Proposal Sent', 'Won', 'Lost'];


  $scope.editingNoteIndex = null;
$scope.editingEmailIndex = null;

// Enable note editing
$scope.enableNoteEdit = function(index) {
  $scope.editingNoteIndex = index;
};

// Disable note editing and save the changes
$scope.disableNoteEdit = function(index) {
  $scope.editingNoteIndex = null;
  $scope.saveDeal();
};

// Handle enter key while editing note
$scope.handleNoteKeyDown = function(event, index) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    $scope.disableNoteEdit(index);
  }
};

// Add a note to the history
$scope.addNote = function() {
  if (!$scope.newNote) return;

  if (!Array.isArray($scope.selectedDeal.notes)) {
    $scope.selectedDeal.notes = [];
  }

  $scope.selectedDeal.notes.push($scope.newNote);
  $scope.newNote = '';
  $scope.saveDeal();
};

// Enable email editing
$scope.enableEmailEdit = function(index) {
  $scope.editingEmailIndex = index;
};

// Disable email editing and save the changes
$scope.disableEmailEdit = function(index) {
  $scope.editingEmailIndex = null;
  $scope.saveDeal();
};

// Handle enter key while editing email
$scope.handleEmailKeyDown = function(event, index) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    $scope.disableEmailEdit(index);
  }
};

// Add a sent email to the history
$scope.sendEmail = function() {
  if (!$scope.newEmail) return;

  if (!Array.isArray($scope.selectedDeal.emails)) {
    $scope.selectedDeal.emails = [];
  }

  $scope.selectedDeal.emails.push({
    content: $scope.newEmail,
    timestamp: new Date().toLocaleString(),
    type: 'sent' // Mark as sent email
  });

  $scope.newEmail = '';
  $scope.saveDeal();
};

// Simulate receiving an email
$scope.receiveEmail = function() {
  if (!$scope.newEmail) return;

  if (!Array.isArray($scope.selectedDeal.emails)) {
    $scope.selectedDeal.emails = [];
  }

  $scope.selectedDeal.emails.push({
    content: $scope.newEmail,
    timestamp: new Date().toLocaleString(),
    type: 'received' // Mark as received email
  });

  $scope.newEmail = '';
  $scope.saveDeal();
};

$scope.convertToProject = function(deal) {
  if (confirm("Convert this deal to a project?")) {
    // Remove deal from deals list
    const index = $scope.deals.findIndex(d => d.id === deal.id);
    if (index !== -1) {
      $scope.deals.splice(index, 1);
      localStorage.setItem('deals', JSON.stringify($scope.deals));
    }

    // Load existing projects from localStorage
    const storedProjects = localStorage.getItem('projects');
    const projects = storedProjects ? JSON.parse(storedProjects) : [];

    // Create new project from deal
    const newProject = {
      id: Date.now(),
      title: deal.title + " (Converted)",
      customer: deal.customer,
      value: deal.value,
      stage: 'New',
      assignedTo: deal.assignedTo,
      created: new Date(),
      notes: deal.notes || [],
      emails: deal.emails || [],
      source: 'deal'
    };

    // Save the new project to localStorage
    projects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(projects));

    alert("Deal '" + deal.title + "' has been converted to a project!");
    $scope.backToList(); // Optional: go back to list view
  }
};

$scope.deleteDeal = function(id) {
  if (confirm('Are you sure you want to delete this deal?')) {
    $scope.deals = $scope.deals.filter(d => d.id !== id);
    saveDeals();
    $scope.backToList();
  }
};

});
