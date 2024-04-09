const {  } = require('../utils/swagger.schema');
const { getRepos, getBranches, getFiles, getFile, download, commit } = require('../views/gitView');
const gitRoutes = function(instance, opts, next) {

    instance.get('/', getRepos);
    instance.get('/:repo', getBranches);
    instance.get('/:repo/:branch', getFiles);
    instance.get('/:repo/:branch/*', getFile);
    instance.put('/:repo/:branch/*', commit);
    //instance.get('/download/:repo/:branch/*', download);
    next();
};

module.exports = { gitRoutes };