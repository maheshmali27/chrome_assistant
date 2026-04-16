/* global require, module */
/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const password = await bcrypt.hash('Admin@PS', 12);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin',
        email: 'admin@personal.ass',
        password,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@personal.ass' });
  },
};
