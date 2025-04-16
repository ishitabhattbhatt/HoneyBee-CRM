angular.module('projectApp', [])
.controller('SettingsController', function ($scope) {
  
  const settingsKey = 'userSettings';

  $scope.settings = JSON.parse(localStorage.getItem(settingsKey)) || {
    name: '',
    email: '',
    notifications: true,
    darkMode: false
  };

  $scope.isAdmin = sessionStorage.getItem('userRole') === 'Admin';

  $scope.users = JSON.parse(localStorage.getItem('users')) || [];

  $scope.saveUsers = function () {
    localStorage.setItem('users', JSON.stringify($scope.users));
    alert('User list updated!');
  };

  $scope.addUser = function () {
    $scope.users.push({ username: '', password: '', role: '', email: '' });
    $scope.saveUsers();
  };

  $scope.deleteUser = function (user) {
    const index = $scope.users.indexOf(user);
    if (index > -1) {
      $scope.users.splice(index, 1);
      $scope.saveUsers();
    }
  };

  $scope.saveSettings = function () {
    localStorage.setItem(settingsKey, JSON.stringify($scope.settings));
    alert('Profile updated!');
  };

  $scope.savePreferences = function () {
    localStorage.setItem(settingsKey, JSON.stringify($scope.settings));
    alert('Preferences saved!');
  };

  $scope.changePassword = function () {
    const currentUser = $scope.users.find(u => u.email === $scope.settings.email);
    if (!currentUser || currentUser.password !== $scope.settings.oldPassword) {
      alert('Current password is incorrect.');
      return;
    }

    if ($scope.settings.newPassword !== $scope.settings.confirmPassword) {
      alert('New passwords do not match.');
      return;
    }

    currentUser.password = $scope.settings.newPassword;
    localStorage.setItem('users', JSON.stringify($scope.users));
    alert('Password changed successfully.');

    $scope.settings.oldPassword = '';
    $scope.settings.newPassword = '';
    $scope.settings.confirmPassword = '';
  };
});