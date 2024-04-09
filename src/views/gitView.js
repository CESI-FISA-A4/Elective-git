const { Octokit } = require("@octokit/rest");
const Path = require('node:path');

const octokit = new Octokit({ 
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

const errors = {
    invalidId: (() => {
      const err = Error("Invalid Id format");
      err.statusCode = 400;
      return err;
    })(),
    missingRequiredParams: (() => {
      const err = Error("Not all required parameters filled");
      err.statusCode = 400;
      return err;
    })(),
    idNotFound: (() => {
        const err = Error("Id not found");
        err.statusCode = 404;
        return err;
    })(),
    Unauthorized: (() => {
        const err = Error("Access denied");
        err.statusCode = 403;
        return err;
    })(),
    NotFound: (() => {
      const err = Error("Not found");
      err.statusCode = 404;
      return err;
    })(),
  }

// Used in commit function
const getCurrentCommit = async (owner, repo, branch = 'main') => {
  const { data: refData } = await octokit.git.getRef({
    owner: owner,
    repo,
    ref: `heads/${branch}`,
  })
  const commitSha = refData.object.sha
  const { data: commitData } = await octokit.git.getCommit({
    owner: owner,
    repo,
    commit_sha: commitSha,
  })
  return {
    commitSha,
    treeSha: commitData.tree.sha,
  }
}

// Used in commit function
const createBlob = async (content, owner, repo) => {
    const blobData = await octokit.git.createBlob({
      owner: owner,
      repo,
      content,
      encoding: 'base64',
    })
    return blobData.data;
}

// Used in commit function
const createTree = async (owner, repo, blob, path, parentTreeSha) => { 
  const tree = [{
    path: path,
    mode: `100644`,
    type: `blob`,
    sha: blob.sha, 
  }]
    const { data } = await octokit.git.createTree({
      owner,
      repo,
      tree,
      base_tree: parentTreeSha,
    })
    return data
}

// Used in commit function
const createCommit = async (owner, repo, message, currentTreeSha, currentCommitSha) => {
  try {
    const commit = await octokit.git.createCommit({
      owner: owner,
      repo,
      message,
      tree: currentTreeSha,
      parents: [currentCommitSha],
    });
    return commit.data;
  }
  catch(e) {
    return e;
  }
} 

// Used in commit function
const setBranchToCommit = (org, repo, branch = `main`, commitSha) =>
  octokit.git.updateRef({
    owner: org,
    repo,
    ref: `heads/${branch}`,
    sha: commitSha,
  })

module.exports = {
    getRepos: async(req, res) => {
        const data = await octokit.request("GET https://api.github.com/orgs/{owner}/repos", {
          owner: process.env.GITHUB_OWNER,
        });
        let elements = [];
        for(let i in data.data) {
          elements.push({id: data.data[i].id, name: data.data[i].name});
        }
        return elements;
    },
    getBranches: async(req, res) => {
      const { repo } = req.params;
      try {
        const data = await octokit.request("GET https://api.github.com/repos/{owner}/{repo}/branches", {
          owner: process.env.GITHUB_OWNER,
          repo: repo
        });
        let elements = [];
        for(let i in data.data) {
          elements.push({name: data.data[i].name, protected: data.data[i].protected});
        }
        return elements;
      }
      catch(e) {
        return errors.NotFound;
      }
    },
    getFiles: async(req, res) => {
      const { repo, branch } = req.params;
      const data = await octokit.request("GET https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1", {
          owner: process.env.GITHUB_OWNER,
          repo: repo,
          branch: branch
        });
      return data.data.tree.reduce(function(filtered, {path, sha, size}) {
        if(path.endsWith('.js') || path.endsWith('.css'))  filtered.push({name: Path.basename(path), path, sha, size});
        return filtered;
      }, []);
    },
    getFile: async(req, res) => {
      const { repo, branch } = req.params;
      const path = `/${req.params['*']}`;
      if(!path.endsWith('.js') && !path.endsWith('.css')) return errors.NotFound;
      try {
        const data = await octokit.request("GET https://api.github.com/repos/{owner}/{repo}/contents{path}?ref={branch}", {
          owner: process.env.GITHUB_OWNER,
          repo: repo,
          path: path,
          branch: branch
        });
        let content = Buffer.from(data.data.content, 'base64').toString('ascii');
        return {name: data.data.name, path: data.data.path, size: data.data.size, content: content, sha: data.data.sha};  
      }
      catch(e) {
        return errors.NotFound;
      }
    },
    commit: async(req, res) => {
      const { repo, branch } = req.params;
      const path = req.params['*'];
      const { message, content } = req.body;
      if(!path.endsWith('.js') && !path.endsWith('.css')) return errors.NotFound;
      const contentB64 = Buffer.from(content, 'ascii').toString('base64');

      const currentCommit = await getCurrentCommit(process.env.GITHUB_OWNER, repo, branch);
      const blob = await createBlob(contentB64, process.env.GITHUB_OWNER, repo);
      const newTree = await createTree(process.env.GITHUB_OWNER, repo, blob, path, currentCommit.treeSha);
      const newCommit = await createCommit(process.env.GITHUB_OWNER, repo, message, newTree.sha, currentCommit.commitSha);
      await setBranchToCommit(process.env.GITHUB_OWNER, repo, branch, newCommit.sha);
      return `commited : ${newCommit.parents[0].html_url}`;
    },
    download: async(req, res) => {
      const { repo, branch } = req.params;
      const path = `/${req.params['*']}`;
      if(!path.endsWith('.js') && !path.endsWith('.css')) return errors.NotFound;
      try {
        const data = await octokit.request("GET https://api.github.com/repos/{owner}/{repo}/contents{path}?ref={branch}", {
          owner: process.env.GITHUB_OWNER,
          repo: repo,
          path: path,
          branch: branch
        });
        let content = Buffer.from(data.data.content, 'base64').toString('utf8');
        res.headers({
          'Content-Length': data.data.size,
          'Content-Disposition': `attachment; filename=${data.data.name}`,
          'Content-Type': 'text/plain; charset=utf-8'
        });
        return res.send(content);
      }
      catch(e) {
        return errors.NotFound;
      }
    },
}