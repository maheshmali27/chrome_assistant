/* global module */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('bookmarks', 'folderId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: { model: 'bookmark_folders', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('bookmarks', 'folderId');
  },
};
