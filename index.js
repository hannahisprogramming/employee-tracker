const inquirer = require('inquirer');
const db = require('./db/connection');

//Prompt User for Choices
const promptUser = () => {
  inquirer.prompt([
    {
      name: 'choices',
      type: 'list',
      pageSize: 13,
      message: "Please select an option:",
      choices: [
        'View All Employees',
        'View All Roles',
        'View All Departments',
        'View All Employees By Department',
        'Update Employee Role',
        'Update Employee Manager',
        'Add Employee',
        'Add Role',
        'Add Department',
        'Remove Employee',
        'Remove Role',
        'Remove Department',
        'Exit'
      ]
    }
  ])
    .then((answer) => {
      const {choices} = answer;

      if (choices === 'View All Employees') {
        viewAllEmployees();
      }
      if (choices === 'View All Departments') {
        viewAllDepartments();
      }
      if (choices === 'View All Employees By Department') {
        viewEmployeesByDepartment();
      }
      if (choices === 'Add Employee') {
        addEmployee();
      }
      if (choices === 'Remove Employee') {
        removeEmployee();
      }
      if (choices === 'Update Employee Role') {
        updateEmployeeRole();
      }
      if (choices === 'Update Employee Manager') {
        updateEmployeeManager();
      }
      if (choices === 'View All Roles') {
        viewAllRoles();
      }
      if (choices === 'Add Role') {
        addRole();
      }
      if (choices === 'Remove Role') {
        removeRole();
      }
      if (choices === 'Add Department') {
        addDepartment();
      }
      if (choices === 'Remove Department') {
        removeDepartment();
      }
      if (choices === 'Exit') {
        process.exit(0);
      }
    });
};

