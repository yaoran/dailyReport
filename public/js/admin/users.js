// Generated by CoffeeScript 1.6.1
(function() {
  var UserViewModel, init, treeList;

  treeList = new TreeList("#usersTree");

  UserViewModel = function() {
    var self;
    self = this;
    self.userName = ko.observable('');
    self.password = ko.observable('1234567');
    self.repassword = ko.observable('1234567');
    self.validUserName = ko.computed(function() {
      var un;
      un = $.trim(self.userName());
      return un.length >= 6 && un.length <= 25;
    });
    self.validPassword = ko.computed(function() {
      var pw;
      pw = $.trim(self.password());
      return pw.length >= 7 && pw.length <= 25;
    });
    self.validRePassword = ko.computed(function() {
      return $.trim(self.password()) === $.trim(self.repassword());
    });
    self.departments = ko.observableArray([]);
    self.selectedDepartment = ko.observable(null);
    self.superiors = ko.observableArray([]);
    self.selectedSuperior = ko.observable(null);
    self.valid = ko.computed(function() {
      return (self.selectedDepartment() != null) && self.validUserName() && self.validPassword() && self.validRePassword();
    });
    self.submit = function() {
      var data, _ref, _ref1;
      if (self.valid()) {
        data = {
          userName: $.trim(self.userName()),
          password: $.trim(self.password()),
          departmentId: (_ref = self.selectedDepartment()) != null ? _ref["id"] : void 0,
          superiorId: (_ref1 = self.selectedSuperior()) != null ? _ref1["id"] : void 0
        };
        return UserModel.createUser(data, function(response) {
          var newUser;
          if (response.state === 0) {
            return;
          }
          newUser = response.data;
          self.superiors.push(newUser);
          return treeList.show(UserModel.getLocalAllUsers(), "user");
        });
      } else {
        return console.log("creation fail.");
      }
    };
    self.updateUser = ko.observable(null);
    self.userName1 = ko.observable('');
    self.password1 = ko.observable('');
    self.repassword1 = ko.observable('');
    self.validUserName1 = ko.computed(function() {
      var un;
      un = $.trim(self.userName1());
      return un.length >= 2 && un.length <= 25;
    });
    self.validPassword1 = ko.computed(function() {
      var pw;
      pw = $.trim(self.password1());
      return pw.length >= 7 && pw.length <= 25;
    });
    self.validRePassword1 = ko.computed(function() {
      return $.trim(self.password1()) === $.trim(self.repassword1());
    });
    self.selectedDepartment1 = ko.observable(null);
    self.superiors1 = ko.observableArray([]);
    self.selectedSuperior1 = ko.observable(null);
    self.valid1 = ko.computed(function() {
      var result;
      result = (self.selectedDepartment1() != null) && self.validUserName1() && self.validRePassword1();
      if (self.password1()) {
        result = result && self.validPassword1();
      }
      return result;
    });
    self.hasUser = ko.observable(false);
    self.oldUserName = "";
    self.showHasUserTip = ko.computed(function() {
      if (!self.validUserName()) {
        return false;
      }
      return self.hasUser();
    });
    self.checkUserExit = function() {
      if (self.oldUserName === self.userName()) {
        return;
      }
      self.oldUserName = self.userName();
      if (!self.validUserName()) {
        return self.hasUser(false);
      }
      return UserModel.hasUser(self.userName(), function(response) {
        if (response.state === 0) {
          return;
        }
        return self.hasUser(response.data);
      });
    };
    return self;
  };

  init = function() {
    var cancelUpdate, confirm, deleteUser, finduser, getDepartmentByUserId, getUsersAndSuperiosByDepartmentId, getUsersByDepartmentId, isEditing, setSuperiors, setSuperiorsByDepartmentId, uservm;
    uservm = new UserViewModel();
    ko.applyBindings(uservm);
    DepartmemtModel.getAllDepartments(function(response) {
      return uservm.departments(response.data);
    });
    UserModel.getAllUsers(function(response) {
      var users;
      if (response.state === 0) {
        return;
      }
      users = response.data;
      return treeList.show(users, "user");
    });
    $("#usersTree").on("delete", function(event) {
      var userId;
      userId = event["itemId"];
      return confirm(userId);
    });
    deleteUser = function(userId) {
      return UserModel.removeUser({
        userId: userId
      }, function(response) {
        if (response.state === 0) {
          return;
        }
        return treeList.show(response["data"], "user");
      });
    };
    $("#userDepartment").change(function() {
      var departmentId, _ref;
      departmentId = (_ref = uservm.selectedDepartment()) != null ? _ref['id'] : void 0;
      return setSuperiorsByDepartmentId(departmentId);
    });
    setSuperiorsByDepartmentId = function(departmentId) {
      var superiors, users;
      if (departmentId) {
        users = UserModel.getLocalAllUsers();
        superiors = getUsersAndSuperiosByDepartmentId(departmentId, users, uservm.departments());
        return setSuperiors(superiors);
      } else {
        return setSuperiors([]);
      }
    };
    setSuperiors = function(superiors) {
      if (isEditing()) {
        return uservm.superiors1(superiors);
      } else {
        return uservm.superiors(superiors);
      }
    };
    isEditing = function() {
      var result;
      result = false;
      if (uservm.updateUser()) {
        result = true;
      }
      return result;
    };
    getUsersAndSuperiosByDepartmentId = function(departmentId, allUsers, allDepartments) {
      var department, pid, pusers, result, _i, _len;
      result = getUsersByDepartmentId(departmentId, allUsers);
      for (_i = 0, _len = allDepartments.length; _i < _len; _i++) {
        department = allDepartments[_i];
        if (departmentId === department["id"]) {
          pid = department["pid"];
          pusers = getUsersByDepartmentId(pid, allUsers);
          return result.concat(pusers);
        }
      }
    };
    getUsersByDepartmentId = function(departmentId, allUsers) {
      var result, user, _i, _len;
      result = [];
      if (!departmentId) {
        return result;
      }
      for (_i = 0, _len = allUsers.length; _i < _len; _i++) {
        user = allUsers[_i];
        if (departmentId === user["departmentId"]) {
          result.push(user);
        }
      }
      return result;
    };
    $("#usersTree").on("update", function(event) {
      var selectedDepartment, superior, superiors, user, userId, _i, _len;
      userId = event["itemId"];
      user = finduser(userId);
      uservm.updateUser(user);
      uservm.userName1(user["name"]);
      selectedDepartment = getDepartmentByUserId(userId, UserModel.getLocalAllUsers(), uservm.departments());
      uservm.selectedDepartment1(selectedDepartment);
      setSuperiorsByDepartmentId(selectedDepartment["id"]);
      superiors = uservm.superiors1();
      if (!user["pid"]) {
        return;
      }
      for (_i = 0, _len = superiors.length; _i < _len; _i++) {
        superior = superiors[_i];
        if (superior["id"] === user["pid"]) {
          uservm.selectedSuperior1(superior);
          return;
        }
      }
    });
    finduser = function(userId) {
      var user, users, _i, _len;
      users = UserModel.getLocalAllUsers();
      for (_i = 0, _len = users.length; _i < _len; _i++) {
        user = users[_i];
        if (user['id'] === userId) {
          return user;
        }
      }
    };
    getDepartmentByUserId = function(userId, allUsers, departments) {
      var department, departmentId, user, _i, _j, _len, _len1;
      allUsers = UserModel.getLocalAllUsers();
      departmentId = null;
      for (_i = 0, _len = allUsers.length; _i < _len; _i++) {
        user = allUsers[_i];
        if (userId === user["id"]) {
          departmentId = user["departmentId"];
          break;
        }
      }
      for (_j = 0, _len1 = departments.length; _j < _len1; _j++) {
        department = departments[_j];
        if (department["id"] === departmentId) {
          return department;
        }
      }
      return null;
    };
    $("#cancelBtn").click(function() {
      return cancelUpdate();
    });
    cancelUpdate = function() {
      treeList.showEditingItem();
      return uservm.updateUser(null);
    };
    $("#updateBtn").click(function() {
      var data, _ref, _ref1;
      if (uservm.valid1()) {
        data = {
          userId: uservm.updateUser()["id"],
          userName: $.trim(uservm.userName1()),
          password: $.trim(uservm.password1()),
          departmentId: (_ref = uservm.selectedDepartment1()) != null ? _ref["id"] : void 0,
          superiorId: (_ref1 = uservm.selectedSuperior1()) != null ? _ref1["id"] : void 0
        };
        return UserModel.updateUser(data, function(response) {
          if (response.state === 0) {
            return;
          }
          setSuperiorsByDepartmentId(uservm.selectedDepartment["id"]);
          cancelUpdate();
          return treeList.show(UserModel.getLocalAllUsers(), "user");
        });
      } else {
        return console.log("valid fail");
      }
    });
    return confirm = function(userId) {
      return $("#dialog-confirm").dialog({
        dialogClass: "no-close",
        resizable: false,
        height: 160,
        modal: true,
        buttons: {
          "删除": function() {
            deleteUser(userId);
            return $(this).dialog("close");
          },
          Cancel: function() {
            return $(this).dialog("close");
          }
        }
      });
    };
  };

  init();

}).call(this);
