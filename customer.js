angular.module('crmApp', [])
  .controller('CustomerController', function($scope, $http) {

    (function checkAccess() {
      const allowedRoles = ['Admin', 'Sales Manager', 'Marketing Manager', 'Sales Team', 'Marketing Team'];
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



    
    const customersKey = 'crmCustomers';
    const dealsKey = 'convertedDeals';

    $scope.selectedCustomer = null;
    $scope.customers = [];

    // Load local saved customers
    const savedCustomers = JSON.parse(localStorage.getItem(customersKey)) || [];
    $scope.viewCustomer = function(cust) {
      $scope.selectedCustomer = angular.copy(cust);
    
      // Mock email history
      $scope.selectedCustomer.emails = [
        { date: new Date('2025-03-01'), subject: "Welcome Email" },
        { date: new Date('2025-03-15'), subject: "Follow-up on Proposal" }
      ];
    
      // Mock project history
      $scope.selectedCustomer.projectHistory = [
        { name: "Website Redesign", status: "Completed" },
        { name: "CRM Migration", status: "In Progress" }
      ];
    };
    
    // Fetch customers from API
    $http.get('https://jsonplaceholder.typicode.com/users')
      .then(function(response) {
        const apiCustomers = response.data.map(user => ({
          id: user.id,
          name: user.name,
          company: user.company.name,
          email: user.email,
          phone: user.phone,
          city: user.address.city
        }));

        // Combine API customers and saved customers (without duplicates)
        const combinedCustomers = [...apiCustomers];

        savedCustomers.forEach(localCustomer => {
          const exists = combinedCustomers.some(c => c.name === localCustomer.name && c.email === localCustomer.email);
          if (!exists) {
            combinedCustomers.push(localCustomer);
          }
        });

        // Now merge in converted deals as customers
        const convertedDeals = JSON.parse(localStorage.getItem(dealsKey)) || [];

        convertedDeals.forEach(deal => {
          const dealCustomer = {
            id: 'deal-' + Math.random().toString(36).substr(2, 9),
            name: deal.customer || 'Unnamed Customer',
            company: deal.company || 'Unknown Company',
            email: deal.email || '',
            phone: deal.phone || '',
            city: deal.city || ''
          };

          const exists = combinedCustomers.some(c => c.name === dealCustomer.name && c.company === dealCustomer.company);
          if (!exists) {
            combinedCustomers.push(dealCustomer);
          }
        });

        // Save combined customers back to localStorage
        localStorage.setItem(customersKey, JSON.stringify(combinedCustomers));

        // Bind to scope
        $scope.customers = combinedCustomers;
      });

    // Add a new customer
    $scope.addNewCustomer = function() {
      const newCustomer = {
        id: 'cust-' + Math.random().toString(36).substr(2, 9),
        name: '',
        company: '',
        email: '',
        phone: '',
        city: ''
      };
      $scope.customers.push(newCustomer);
      saveCustomers();
      $scope.viewCustomer(newCustomer);
    };

    // View a selected customer
    $scope.viewCustomer = function(customer) {
      $scope.selectedCustomer = angular.copy(customer);
      $scope.originalCustomer = customer;
    };

    // Go back to the list view
    $scope.backToList = function() {
      $scope.selectedCustomer = null;
    };

    // Save customer data
    $scope.saveCustomer = function() {
      Object.assign($scope.originalCustomer, $scope.selectedCustomer);
      saveCustomers();
      alert('Customer saved!');
    };

    // Delete a customer
    $scope.deleteCustomer = function(customer) {
      const index = $scope.customers.indexOf(customer);
      if (index !== -1) {
        $scope.customers.splice(index, 1);
        saveCustomers();
      }
    };

    // Save customers to localStorage
    function saveCustomers() {
      localStorage.setItem(customersKey, JSON.stringify($scope.customers));
    }
  });
