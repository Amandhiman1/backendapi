const roles = {
    Admin: ['create', 'read', 'update', 'delete', 'manageUsers', 'downloadReports', 'viewReports'],
    Manager: ['manageUsers', 'downloadReports', 'viewReports'],
    TeamLead: ['downloadReports', 'viewReports'],
    Executive: ['manageCallbacks'],
    
};

module.exports = roles;