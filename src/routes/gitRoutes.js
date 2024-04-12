const {  } = require('../utils/swagger.schema');
const { getRepos, getBranches, getFiles, getFile, download, commit, ping } = require('../views/gitView');
const gitRoutes = function(instance, opts, next) {
// oui
    instance.get('/ping', ping);
    instance.get('/', getRepos);
    instance.get('/:repo', getBranches);
    instance.get('/:repo/:branch', getFiles);
    instance.get('/:repo/:branch/*', getFile);
    instance.put('/:repo/:branch/*', commit);
    instance.get('/download/:repo/:branch/*', download);
    next();
};

module.exports = { gitRoutes };