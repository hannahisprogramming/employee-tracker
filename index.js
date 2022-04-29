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

//--------- VIEWS ---------

//View all employees
const viewAllEmployees = () => {
  let sql = `SELECT employee.id,
            employee.first_name,
            employee.last_name,
            role.title,
            department.name AS 'department',
            role.salary
            FROM employee, role, department
            WHERE department.id = role.department_id
            AND role.id = employee.role_id
            ORDER BY employee.id ASC`;
  db.query(sql, (error, response) => {
    if(error) throw error;
    console.log('Current Employees:');
    console.table(response);
    promptUser();
  });
};

//View all roles
const viewAllRoles = () => {
  const sql = `SELECT role.id, role.title, department.name AS department
              FROM role
              INNER JOIN department ON role.department_id = department.id`;
  db.query(sql, (error, response) => {
    if (error) throw error;
    console.log(`Current Employee Roles:`);
    response.forEach((role) => { console.log(role.title); });
    promptUser();
  });
};

//View all departments
const viewAllDepartments = () => {
  const sql = `SELECT department.id AS id, department.name AS department FROM department`;
  db.query(sql, (error, response) => {
    if (error) throw error;
    console.log(`All Departments:`);
    console.table(response);
    promptUser();
  });
};

//View all employees by department
const viewEmployeesByDepartment = () => {
  const sql = `SELECT employee.first_name, 
              employee.last_name, 
              department.name AS department
              FROM employee 
              LEFT JOIN role ON employee.role_id = role.id 
              LEFT JOIN department ON role.department_id = department.id`;
  db.query(sql, (error, response) => {
    if (error) throw error;
    console.log(`Employees by Department:`);
    console.table(response);
    promptUser();
  });
};