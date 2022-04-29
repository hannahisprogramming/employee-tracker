INSERT INTO department (name)
VALUES
('administration'),
('accounting'),
('warehouse');

INSERT INTO role (title, salary, department_id)
VALUES
('manager', 100000, 1),
('accountant', 70000, 2),
('picker', 40000, 3),
('packer', 35000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Kate', 'Decker', 1, NULL),
('Matt', 'Scotch', 1, NULL),
('Fran', 'Alberts', 2, 1),
('Chris', 'Jordan', 2, 1),
('Adam', 'Wells', 3, 2),
('Cynthia', 'Torr', 3, 2),
('Dory', 'Nickols', 4, 2),
('Tim', 'Stryker', 4, 2),
('Zack', 'Mort', 3, NULL);