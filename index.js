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

//--------- ADD ---------

// Add a new employee
const addEmployee = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: "What is the employee's first name?"
    },
    {
      type: 'input',
      name: 'lastName',
      message: "What is the employee's last name?"
    }
  ])
    .then(answer => {
      const criteria = [answer.firstName, answer.lastName]
      const roleSql = `SELECT role.id, role.title FROM role`;
      db.query(roleSql, (error, data) => {
        if (error) throw error;
        const roles = data.map(({ id, title }) => ({ name: title, value: id }));
        inquirer.prompt([
          {
            type: 'list',
            name: 'role',
            message: "What is the employee's role?",
            choices: roles
          }
        ])
          .then(roleChoice => {
            const role = roleChoice.role;
            criteria.push(role);
            const managerSql = `SELECT * FROM employee`;
            db.query(managerSql, (error, data) => {
              if (error) throw error;
              const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
              inquirer.prompt([
                {
                  type: 'list',
                  name: 'manager',
                  message: "Who is the employee's manager?",
                  choices: managers
                }
              ])
                .then(managerChoice => {
                  const manager = managerChoice.manager;
                  criteria.push(manager);
                  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                  VALUES (?, ?, ?, ?)`;
                  db.query(sql, criteria, (error) => {
                    if (error) throw error;
                    console.log("Employee has been added!")
                    viewAllEmployees();
                  });
                });
            });
          });
      });
    });
};

// Add a new role
const addRole = () => {
  const sql = 'SELECT * FROM department'
  db.query(sql, (error, response) => {
    if (error) throw error;
    let deptNamesArr = [];
    response.forEach((department) => { deptNamesArr.push(department.name); });
   deptNamesArr.push('Create Department');
    inquirer
      .prompt([
        {
          name: 'deptName',
          type: 'list',
          message: 'Which department is this new role in?',
          choices: deptNamesArr
        }
      ])
      .then((answer) => {
        if (answer.deptName === 'Create Department') {
          this.addDepartment();
        } else {
          addRole(answer);
        }
      });

    const addRole = (deptData) => {
      inquirer
        .prompt([
          {
            name: 'newRole',
            type: 'input',
            message: 'What is the name of your new role?'
          },
          {
            name: 'salary',
            type: 'input',
            message: 'What is the salary of this new role?'
          }
        ])
        .then((answer) => {
          let createdRole = answer.newRole;
          let deptId;

          response.forEach((department) => {
            if (deptData.deptName === department.name) { deptId = department.id; }
          });

          let sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
          let criteria = [createdRole, answer.salary, deptId];

          db.query(sql, criteria, (error) => {
            if (error) throw error;
            console.log(`Role successfully created!`);
            viewAllRoles();
          });
        });
    };
  });
};

// Add a new department
const addDepartment = () => {
  inquirer
    .prompt([
      {
        name: 'newDept',
        type: 'input',
        message: 'What is the name of your new Department?'
      }
    ])
    .then((answer) => {
      let sql = `INSERT INTO department (name) VALUES (?)`;
      db.query(sql, answer.newDept, (error, response) => {
        if (error) throw error;
        console.log(``);
        console.log(answer.newDept + ` Department successfully created!`);
        console.log(``);
        viewAllDepartments();
      });
    });
};