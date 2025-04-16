angular.module('supportApp', [])
      .controller('SupportController', function ($scope) {
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
        const LOCAL_KEY = 'supportTickets';

        function getLocalTickets() {
          const stored = localStorage.getItem(LOCAL_KEY);
          return stored ? JSON.parse(stored) : [];
        }

        function saveLocalTickets(tickets) {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(tickets));
        }

        $scope.tickets = getLocalTickets();
        $scope.selectedTicket = null;
        $scope.newTicket = {};
        $scope.sortKey = 'subject';

        $scope.selectTicket = function (ticket) {
          $scope.selectedTicket = ticket;
        };

        $scope.sortBy = function (key) {
          $scope.sortKey = key;
        };

        $scope.statusFilter = function (ticket) {
          return !$scope.filterStatus || ticket.status === $scope.filterStatus;
        };

        $scope.addTicket = function () {
          const newId = Date.now(); // Unique ID
          const newTicket = {
            id: newId,
            subject: $scope.newTicket.subject,
            customer: $scope.newTicket.customer,
            status: $scope.newTicket.status,
            description: $scope.newTicket.description,
            createdDate: new Date().toISOString().split('T')[0]
          };
          $scope.tickets.push(newTicket);
          saveLocalTickets($scope.tickets);
          $scope.newTicket = {};
          $('#addTicketModal').modal('hide');
        };
      });