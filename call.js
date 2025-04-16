angular.module('callLogsApp', [])
      .controller('CallLogController', function ($scope) {

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

        const fullData = [
          { caller: 'Chandru', receiver: 'Harish', direction: 'Outgoing', status: 'Completed', duration: '1m 16s', date: '2024-06-24 17:24', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', notes: 'Interested with the product. Need to visit site. Followup in 2 days.' },
          { caller: 'Timeless', receiver: 'Unknown', direction: 'Outgoing', status: 'Missed Call', duration: '5s', date: '2024-06-20', audio: '', notes: '' },
          { caller: 'Shariq Ansari', receiver: 'Marcus Brown', direction: 'Outgoing', status: 'Missed Call', duration: '9s', date: '2024-06-21', audio: '', notes: '' },
          { caller: 'Unknown', receiver: 'Shariq Ansari', direction: 'Incoming', status: 'Missed Call', duration: '0s', date: '2024-06-22', audio: '', notes: '' },
          { caller: 'Chandru', receiver: 'Geetha', direction: 'Outgoing', status: 'Completed', duration: '54s', date: '2024-06-25', audio: '', notes: 'Spoke about payment process.' }
        ];

        $scope.callLogs = [];
        $scope.itemsPerPage = 3;
        $scope.currentPage = 1;
        $scope.totalPages = Math.ceil(fullData.length / $scope.itemsPerPage);

        $scope.updatePageData = function () {
          const start = ($scope.currentPage - 1) * $scope.itemsPerPage;
          $scope.callLogs = fullData.slice(start, start + $scope.itemsPerPage);
        };

        $scope.updatePageData();

        $scope.prevPage = function () {
          if ($scope.currentPage > 1) {
            $scope.currentPage--;
            $scope.updatePageData();
          }
        };

        $scope.nextPage = function () {
          if ($scope.currentPage < $scope.totalPages) {
            $scope.currentPage++;
            $scope.updatePageData();
          }
        };

        $scope.selectCall = function (call) {
          $scope.selectedCall = call;
        };

        $scope.statusFilter = function (item) {
          return !$scope.filterStatus || item.status === $scope.filterStatus;
        };

        $scope.sortKey = 'receiver';
        $scope.sortBy = function (key) {
          $scope.sortKey = key;
        };
      });