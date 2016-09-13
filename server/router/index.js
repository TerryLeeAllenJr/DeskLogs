/** The Index of Routes **/

var logger = require('../logger');

var Routes = function(app){
    app.use('/signup',      require('./routes/signup'));
    app.use('/login',       require('./routes/login'));
    app.use('/deskLogs',    require('./routes/deskLogs'));
    app.use('/users',       require('./routes/users'));
    app.use('/api',         require('./routes/api'));
    app.use('/feedback',    require('./routes/feedback'));
    app.use('/history',     require('./routes/history'));
    app.use('/monitor',     require('./routes/monitor'));
    app.use('/notifications',     require('./routes/notifications'));
    // Error Handling
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
    });

};


module.exports = Routes;