const {  } = require('../utils/swagger.schema');
const { getRepos, getBranches, getFiles, getFile } = require('../views/gitView');
const gitRoutes = function(instance, opts, next) {

    instance.get('/repos/', getRepos);
    instance.get('/:repo/branches', getBranches);
    instance.get('/:repo/branches/:branch/', getFiles);
    instance.get('/:repo/branches/:branch/*', getFile);
    next();
};

module.exports = { gitRoutes };