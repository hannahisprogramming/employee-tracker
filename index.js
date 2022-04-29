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

//--------- UPDATE ---------

// Update an employee's role
const updateEmployeeRole = () => {
  let sql = `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
              FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
  db.query(sql, (error, response) => {
    if (error) throw error;
    let employeeNamesArr = [];
    response.forEach((employee) => { employeeNamesArr.push(`${employee.first_name} ${employee.last_name}`); });

    let sql = `SELECT role.id, role.title FROM role`;
    db.query(sql, (error, response) => {
      if (error) throw error;
      let rolesArr = [];
      response.forEach((role) => { rolesArr.push(role.title); });

      inquirer
        .prompt([
          {
            name: 'chosenEmployee',
            type: 'list',
            message: 'Which employee has a new role?',
            choices: employeeNamesArr
          },
          {
            name: 'chosenRole',
            type: 'list',
            message: 'What is their new role?',
            choices: rolesArr
          }
        ])
        .then((answer) => {
          let newTitleId, employeeId;

          response.forEach((role) => {
            if (answer.chosenRole === role.title) {
              newTitleId = role.id;
            }
          });

          response.forEach((employee) => {
            if (
              answer.chosenEmployee ===
              `${employee.first_name} ${employee.last_name}`
            ) {
              employeeId = employee.id;
            }
          });

          let sql2 = `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
          db.query(
            sql2,
            [newTitleId, employeeId],
            (error) => {
              if (error) throw error;
              console.log(`Employee Role Updated`);
              promptUser();
            }
          );
        });
    });
  });
};

// Update an employee's manager
const updateEmployeeManager = () => {
  let sql = `SELECT employee.id, employee.first_name, employee.last_name, employee.manager_id
              FROM employee`;
  db.query(sql, (error, response) => {
    let employeeNamesArr = [];
    response.forEach((employee) => { employeeNamesArr.push(`${employee.first_name} ${employee.last_name}`); });

    inquirer
      .prompt([
        {
          name: 'chosenEmployee',
          type: 'list',
          message: 'Which employee has a new manager?',
          choices: employeeNamesArr
        },
        {
          name: 'newManager',
          type: 'list',
          message: 'Who is their manager?',
          choices: employeeNamesArr
        }
      ])
      .then((answer) => {
        let employeeId, managerId;
        response.forEach((employee) => {
          if (
            answer.chosenEmployee === `${employee.first_name} ${employee.last_name}`
          ) {
            employeeId = employee.id;
          }

          if (
            answer.newManager === `${employee.first_name} ${employee.last_name}`
          ) {
            managerId = employee.id;
          }
        });

        let sql = `UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?`;
        db.query(
          sql,
          [managerId, employeeId],
          (error) => {
            if (error) throw error;
            console.log(`Employee Manager Updated`);
            promptUser();
          }
        );
      });
  });
};

//--------- DELETE ---------

// Delete an employee
const removeEmployee = () => {
  let sql = `SELECT employee.id, employee.first_name, employee.last_name FROM employee`;

  db.query(sql, (error, response) => {
    if (error) throw error;
    let employeeNamesArr = [];
    response.forEach((employee) => { employeeNamesArr.push(`${employee.first_name} ${employee.last_name}`); });

    inquirer
      .prompt([
        {
          name: 'chosenEmployee',
          type: 'list',
          message: 'Which employee would you like to remove?',
          choices: employeeNamesArr
        }
      ])
      .then((answer) => {
        let employeeId;

        response.forEach((employee) => {
          if (
            answer.chosenEmployee ===
            `${employee.first_name} ${employee.last_name}`
          ) {
            employeeId = employee.id;
          }
        });

        let sql = `DELETE FROM employee WHERE employee.id = ?`;
        db.query(sql, [employeeId], (error) => {
          if (error) throw error;
          console.log(`Employee Successfully Removed`);
          viewAllEmployees();
        });
      });
  });
};

// Delete a role
const removeRole = () => {
  let sql = `SELECT role.id, role.title FROM role`;

  db.query(sql, (error, response) => {
    if (error) throw error;
    let roleNamesArr = [];
    response.forEach((role) => { roleNamesArr.push(role.title); });

    inquirer
      .prompt([
        {
          name: 'chosenRole',
          type: 'list',
          message: 'Which role would you like to remove?',
          choices: roleNamesArr
        }
      ])
      .then((answer) => {
        let roleId;

        response.forEach((role) => {
          if (answer.chosenRole === role.title) {
            roleId = role.id;
          }
        });

        let sql = `DELETE FROM role WHERE role.id = ?`;
        db.query(sql, [roleId], (error) => {
          if (error) throw error;
          console.log(`Role Successfully Removed`);
          viewAllRoles();
        });
      });
  });
};

// Delete a department
const removeDepartment = () => {
  let sql = `SELECT department.id, department.name FROM department`;
  db.query(sql, (error, response) => {
    if (error) throw error;
    let deptNamesArr = [];
    response.forEach((department) => { deptNamesArr.push(department.name); });

    inquirer
      .prompt([
        {
          name: 'chosenDept',
          type: 'list',
          message: 'Which department would you like to remove?',
          choices: deptNamesArr
        }
      ])
      .then((answer) => {
        let deptId;

        response.forEach((department) => {
          if (answer.chosenDept === department.name) {
            deptId = department.id;
          }
        });

        let sql = `DELETE FROM department WHERE department.id = ?`;
        db.query(sql, [deptId], (error) => {
          if (error) throw error;
          console.log(`Department Successfully Removed`);
          viewAllDepartments();
        });
      });
  });
};

promptUser();