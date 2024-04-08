const {  } = require('../utils/swagger.schema');
const { getRepos, getBranches, getFiles } = require('../views/gitView');
const gitRoutes = function(instance, opts, next) {

    instance.get('/repos/', getRepos);
    instance.get('/:repo/branches', getBranches);
    instance.get('/:repo/branches/:branch/', getFiles);
    next();
};

module.exports = { gitRoutes };