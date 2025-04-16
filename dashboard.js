angular.module('dashboardApp', [])
  .controller('DashboardController', function($scope, $http, $window) {

    // 🔐 Session check
    if (!$window.sessionStorage.getItem('loggedIn')) {
      $window.location.href = 'login.html';
    }

    // 🌙 Dark Mode Initialization
    $scope.darkMode = $window.localStorage.getItem('darkMode') === 'true';

    $scope.toggleDarkMode = function () {
      $scope.darkMode = !$scope.darkMode;
      $window.localStorage.setItem('darkMode', $scope.darkMode);
    };

    // 🧑 Users and 📝 Tasks
    $scope.users = [];
    $scope.tasks = [];

    // 🧑 Fetch Users & Create Bar Chart
    $http.get('https://jsonplaceholder.typicode.com/users')
      .then(function (response) {
        $scope.users = response.data;
        const companyCounts = {};
        $scope.users.forEach(user => {
          const company = user.company.name;
          companyCounts[company] = (companyCounts[company] || 0) + 1;
        });
        drawUserChart(Object.keys(companyCounts), Object.values(companyCounts));
      });

    // 📝 Fetch Tasks & Create Pie Chart
    $http.get('https://jsonplaceholder.typicode.com/todos')
      .then(function (response) {
        $scope.tasks = response.data.slice(0, 10);
        const completed = $scope.tasks.filter(t => t.completed).length;
        const pending = $scope.tasks.length - completed;
        drawTaskChart([completed, pending]);
      });

    // 📊 Task Pie Chart
    function drawTaskChart(data) {
      new Chart(document.getElementById('taskChart'), {
        type: 'pie',
        data: {
          labels: ['Completed', 'Pending'],
          datasets: [{
            data: data,
            backgroundColor: ['#C3D3D6', '#EDCFC0']
          }]
        }
      });
    }

    // 📊 User Bar Chart
    function drawUserChart(labels, data) {
      new Chart(document.getElementById('userChart'), {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Users',
            data: data,
            backgroundColor: '#E4D5E3'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          }
        }
      });
    }


      $scope.logout = function() {
        $window.sessionStorage.removeItem('loggedIn'); // clear session
        $window.location.href = 'login.html'; // redirect to login
      };
    
  });
