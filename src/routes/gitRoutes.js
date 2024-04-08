const {  } = require('../utils/swagger.schema');
const { getRepos, getBranches, getFiles, getFile } = require('../views/gitView');
const gitRoutes = function(instance, opts, next) {

    instance.get('/', getRepos);
    instance.get('/:repo', getBranches);
    instance.get('/:repo/:branch', getFiles);
    instance.get('/:repo/:branch/*', getFile);
    next();
};

module.exports = { gitRoutes };