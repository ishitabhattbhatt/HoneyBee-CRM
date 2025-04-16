angular.module('analyticsApp', []).controller('AnalyticsController', function($scope, $timeout) {
  (function checkAccess() {
    const allowedRoles = ['Admin', 'Finance Manager', 'Finance Team'];
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
  
  $scope.analytics = {
      leads: 320,
      deals: 152,
      revenue: 89320
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const leadsData = [20, 40, 60, 90, 50, 60];
    const dealsData = [10, 20, 35, 60, 30, 45];
    const revenueData = [3000, 7000, 11000, 17000, 12000, 15000];

    $timeout(() => {
      const ctx1 = document.getElementById('leadsDealsChart').getContext('2d');
      new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Leads',
              backgroundColor: '#EDCFC0',
              data: leadsData
            },
            {
              label: 'Deals',
              backgroundColor: '#E4D5E3',
              data: dealsData
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      const ctx2 = document.getElementById('revenueChart').getContext('2d');
      new Chart(ctx2, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Revenue',
            borderColor: '#7F9AA4',
            backgroundColor: 'rgba(127, 154, 164, 0.2)',
            data: revenueData,
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }, 200);
  });

angular.module('analyticsApp', []).controller('AnalyticsController', function($scope, $http, $timeout) {
    $scope.loading = true;
    $scope.error = false;
    $scope.analytics = {
      leads: 0,
      deals: 0,
      revenue: 0
    };

    $http.get('https://dummyjson.com/carts') // Live API
      .then(function(response) {
        const carts = response.data.carts;

        // Update overall stats
        $scope.analytics.leads = carts.length * 10;
        $scope.analytics.deals = Math.round(carts.length * 0.5);
        $scope.analytics.revenue = carts.reduce((sum, cart) => sum + cart.total, 0);

        // Simulate monthly data from carts
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const leadsPerMonth = [0, 0, 0, 0, 0, 0];
        const dealsPerMonth = [0, 0, 0, 0, 0, 0];
        const revenuePerMonth = [0, 0, 0, 0, 0, 0];

        // Distribute data into months based on cart ID
        carts.forEach(cart => {
          const index = cart.id % 6; // Spread across 6 months
          leadsPerMonth[index] += 10;
          dealsPerMonth[index] += 5;
          revenuePerMonth[index] += cart.total;
        });

        $timeout(() => {
          const ctx1 = document.getElementById('leadsDealsChart').getContext('2d');
          new Chart(ctx1, {
            type: 'bar',
            data: {
              labels: months,
              datasets: [
                {
                  label: 'Leads',
                  backgroundColor: '#EDCFC0',
                  data: leadsPerMonth
                },
                {
                  label: 'Deals',
                  backgroundColor: '#E4D5E3',
                  data: dealsPerMonth
                }
              ]
            },
            options: {
              responsive: true,
              scales: {
                y: { beginAtZero: true }
              }
            }
          });

          const ctx2 = document.getElementById('revenueChart').getContext('2d');
          new Chart(ctx2, {
            type: 'line',
            data: {
              labels: months,
              datasets: [{
                label: 'Revenue',
                borderColor: '#7F9AA4',
                backgroundColor: 'rgba(127, 154, 164, 0.2)',
                data: revenuePerMonth,
                fill: true,
                tension: 0.3
              }]
            },
            options: {
              responsive: true,
              scales: {
                y: { beginAtZero: true }
              }
            }
          });

          $scope.loading = false;
        }, 500);
      })
      .catch(function() {
        $scope.error = true;
        $scope.loading = false;
      });
  });