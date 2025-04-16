const app = angular.module('crmApp', []);
app.controller('tasksController', function($scope) {
  // Load tasks from localStorage
  $scope.tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  $scope.showModal = false;
  $scope.editIndex = null;
  $scope.newtask = {};

  // Load current session
  $scope.currentUsername = sessionStorage.getItem('loggedInUser');
  $scope.currentUserRole = sessionStorage.getItem('userRole');

  // Redirect if not logged in
  if (!$scope.currentUsername || !$scope.currentUserRole) {
    alert("You are not logged in.");
    window.location.href = "login.html";
    return;
  }

  // Load employees from localStorage
  $scope.employees = JSON.parse(localStorage.getItem('employees') || "[]");

  // Filter visible tasks
  $scope.getVisibleTasks = function(status) {
    if ($scope.currentUserRole === 'Admin') {
      return $scope.tasks.filter(task => task.status === status);
    } else {
      return $scope.tasks.filter(task =>
        task.status === status &&
        (task.createdBy === $scope.currentUsername || task.assignedTo === $scope.currentUsername)
      );
    }
  };

  // Save task (add or edit)
  $scope.savetask = function() {
    if ($scope.newtask.title && $scope.newtask.content) {
      $scope.newtask.time = new Date().toLocaleString();

      if ($scope.editIndex !== null) {
        $scope.tasks[$scope.editIndex] = $scope.newtask;
      } else {
        $scope.newtask.status = 'todo';
        $scope.tasks.push($scope.newtask);
      }

      localStorage.setItem("tasks", JSON.stringify($scope.tasks));
      $scope.showModal = false;
    }
  };

  $scope.openModal = function() {
    $scope.newtask = {
      createdBy: $scope.currentUsername
    };
    $scope.editIndex = null;
    $scope.showModal = true;
  };

  $scope.closeModal = function() {
    $scope.showModal = false;
  };

  $scope.edittask = function(index) {
    const task = $scope.tasks[index];
    if (
      $scope.currentUserRole === 'Admin' ||
      task.createdBy === $scope.currentUsername ||
      task.assignedTo === $scope.currentUsername
    ) {
      $scope.newtask = angular.copy(task);
      $scope.editIndex = index;
      $scope.showModal = true;
    } else {
      alert("You don't have permission to edit this task.");
    }
  };

  $scope.deletetask = function(index) {
    const task = $scope.tasks[index];
    if (
      $scope.currentUserRole === 'Admin' ||
      task.createdBy === $scope.currentUsername
    ) {
      $scope.tasks.splice(index, 1);
      localStorage.setItem("tasks", JSON.stringify($scope.tasks));
    } else {
      alert("You don't have permission to delete this task.");
    }
  };

  $scope.$watch('tasks', function() {
    localStorage.setItem("tasks", JSON.stringify($scope.tasks));
  }, true);

  // Drag-n-drop
  setTimeout(() => {
    $(".column").sortable({
      connectWith: ".column",
      items: ".task",
      placeholder: "task-placeholder",
      stop: function(event, ui) {
        const id = $(ui.item).data("id");
        const newCol = ui.item.closest(".column").id;
        if (id !== undefined && $scope.tasks[id]) {
          $scope.tasks[id].status = newCol;
          localStorage.setItem("tasks", JSON.stringify($scope.tasks)); // 🔥 Save immediately
          $scope.$apply();
        }
      }
      
    }).disableSelection();
  }, 100);
});
