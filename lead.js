angular.module('crmApp', [])
  .controller('LeadListController', function($scope, $http) {

    (function checkAccess() {
      const allowedRoles = ['Admin', 'Marketing Manager', 'Marketing Team'];
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
    

    $scope.selectedLead = null;
    $scope.activeTab = 'details';

    const LEADS_KEY = 'crmLeads';
    const DEALS_KEY = 'crmDeals';

    function loadData() {
      const storedLeads = localStorage.getItem(LEADS_KEY);
      const storedDeals = localStorage.getItem(DEALS_KEY);
      const storedManagers = localStorage.getItem('managers');

      $scope.leads = storedLeads ? JSON.parse(storedLeads) : [];
      $scope.deals = storedDeals ? JSON.parse(storedDeals) : [];
      $scope.managers = storedManagers ? JSON.parse(storedManagers) : [];

      if ($scope.leads.length === 0) {
        $http.get('https://jsonplaceholder.typicode.com/users')
          .then(function(response) {
            const data = response.data;
            $scope.leads = data.map((user, index) => ({
              name: user.name,
              company: user.company.name,
              email: user.email,
              phone: user.phone,
              status: ['New', 'Contacted', 'Qualified'][index % 3],
              assignedTo: user.username,
              created: new Date(2024, 0, index + 1, 9 + index, 15),
              notes: [],
              emailHistory: []  // Initialize email history per lead
            }));
            saveData();
          });
      }

      if ($scope.managers.length === 0) {
        $http.get('https://jsonplaceholder.typicode.com/users')
          .then(function(response) {
            const data = response.data;
            const departments = ['Sales', 'Marketing', 'Finance', 'HR', 'Product', 'Operations'];
            $scope.managers = data.map((user, index) => ({
              name: user.name,
              email: user.email,
              phone: user.phone,
              department: departments[index % departments.length]
            }));
            localStorage.setItem('managers', JSON.stringify($scope.managers));
          });
      }
    }

    function saveData() {
      localStorage.setItem(LEADS_KEY, JSON.stringify($scope.leads));
      localStorage.setItem(DEALS_KEY, JSON.stringify($scope.deals));
      localStorage.setItem('managers', JSON.stringify($scope.managers));
    }

    $scope.addNewLead = function() {
      const newLead = {
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'New',
        assignedTo: '',
        created: new Date(),
        notes: [],
        emailHistory: []
      };
      $scope.leads.push(newLead);
      $scope.viewLead(newLead);
      saveData();
    };

    $scope.deleteLead = function(lead) {
      if (confirm("Are you sure you want to delete this lead?")) {
        const index = $scope.leads.indexOf(lead);
        if (index !== -1) {
          $scope.leads.splice(index, 1);
          $scope.selectedLead = null;
          saveData();
        }
      }
    };

    $scope.convertToDeal = function(lead) {
      if (confirm("Convert this lead to a deal?")) {
        // Remove from leads
        const index = $scope.leads.indexOf(lead);
        if (index !== -1) {
          $scope.leads.splice(index, 1);
          localStorage.setItem('leads', JSON.stringify($scope.leads));
        }
    
        // Load existing deals from localStorage
        const storedDeals = localStorage.getItem('deals');
        const deals = storedDeals ? JSON.parse(storedDeals) : [];
    
        // Create new deal from lead
        const newDeal = {
          id: Date.now(),
          email: lead.email,
          title: lead.name + "'s Deal",
          customer: lead.name,
          value: 0,
          stage: 'New',
          assignedTo: lead.assignedTo,
          created: new Date(),
          notes: lead.notes || [],
          emails: [],
          source: 'lead'
        };
    
        // Save to localStorage
        deals.push(newDeal);
        localStorage.setItem('deals', JSON.stringify(deals));
    
        alert("Lead '" + lead.name + "' has been converted to a deal!");
      }
    };
    
    

    $scope.viewLead = function(lead) {
      $scope.selectedLead = angular.copy(lead);
      $scope.originalLead = lead;
      $scope.activeTab = 'details';
      $scope.newNote = '';

      if (!$scope.selectedLead.notes) $scope.selectedLead.notes = [];
      if (!$scope.selectedLead.emailHistory || $scope.selectedLead.emailHistory.length === 0) {
        // Load dummy emails from API once per lead
        $http.get('https://jsonplaceholder.typicode.com/comments')
          .then(function(response) {
            const emails = response.data.slice(0, 5).map(comment => ({
              subject: comment.name,
              date: new Date().toLocaleString(),
              body: comment.body
            }));
            $scope.selectedLead.emailHistory = emails;
            $scope.originalLead.emailHistory = emails;
            saveData(); // persist in original lead
          });
      }
    };

    $scope.backToList = function() {
      $scope.selectedLead = null;
    };

    $scope.saveLead = function() {
      Object.assign($scope.originalLead, $scope.selectedLead);
      saveData();
      alert("Lead saved!");
    };

    $scope.addNote = function() {
      if (!$scope.selectedLead.notes) {
        $scope.selectedLead.notes = [];
      }
      if ($scope.newNote.trim()) {
        $scope.selectedLead.notes.push($scope.newNote.trim());
        $scope.newNote = '';
        $scope.originalLead.notes = $scope.selectedLead.notes;
        saveData();
      }
    };

    $scope.statusFilter = '';
    $scope.searchQuery = '';

    $scope.setStatusFilter = function(status) {
      $scope.statusFilter = status;
    };

    $scope.filterByStatusAndSearch = function(lead) {
      const matchesStatus = !$scope.statusFilter || lead.status === $scope.statusFilter;
      const query = $scope.searchQuery.toLowerCase();
      const matchesSearch = !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.company.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    };

    $scope.getUniqueAssignees = function() {
      return $scope.managers.filter(manager => manager.department === 'Marketing');
    };

    $scope.editingNoteIndex = null;

$scope.enableNoteEdit = function(index) {
  $scope.editingNoteIndex = index;
};

$scope.disableNoteEdit = function(index) {
  $scope.editingNoteIndex = null;
  $scope.saveLead();
};

$scope.handleNoteKeyDown = function(event, index) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    $scope.disableNoteEdit(index);
  }
};

$scope.editingEmailIndex = null;

// Enable email editing
$scope.enableEmailEdit = function(index) {
  $scope.editingEmailIndex = index;
};

// Disable email editing and save the changes
$scope.disableEmailEdit = function(index) {
  $scope.editingEmailIndex = null;
  $scope.saveLead();
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

  if (!Array.isArray($scope.selectedLead.emails)) {
    $scope.selectedLead.emails = [];
  }

  $scope.selectedLead.emails.push({
    content: $scope.newEmail,
    timestamp: new Date().toLocaleString(),
    type: 'sent' // Mark as sent email
  });

  $scope.newEmail = '';
  $scope.saveLead();
};

// Simulate receiving an email
$scope.receiveEmail = function() {
  if (!$scope.newEmail) return;

  if (!Array.isArray($scope.selectedLead.emails)) {
    $scope.selectedLead.emails = [];
  }

  $scope.selectedLead.emails.push({
    content: $scope.newEmail,
    timestamp: new Date().toLocaleString(),
    type: 'received' // Mark as received email
  });

  $scope.newEmail = '';
  $scope.saveLead();
};



    loadData();
  });
