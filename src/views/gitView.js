const {Octokit} = require("octokit")

const octokit = new Octokit({ 
  auth: process.env.GITHUB_ACCESS_TOKEN,
  userAgent: "CESI-EAT/v0",
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

// function to merge arrays
const merge = (a, b, predicate = (a, b) => a === b) => {
  const c = [...a]; // copy to avoid side effects
  // add all items from B to copy C if they're not already present
  b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
  return c;
}

const getAllFiles = async (repo, branch, folder) => {
  let elements = [];
  try {
    const data = await octokit.request("GET https://api.github.com/repos/CESI-FISA-A4/{repo}/contents{folder}?ref={branch}", {repo: repo, branch: branch, folder: folder});
    for(let i in data.data) {
      if(data.data[i].type == 'dir') {
        const e = await getAllFiles(repo, branch, `${folder}/${data.data[i].name}`);
        if(e != errors.NotFound) elements = merge(elements, e);
      }
      else if(data.data[i].type == 'file' && (data.data[i].name.endsWith('.js') || data.data[i].name.endsWith('.css'))) {
        elements.push({name: data.data[i].name, path: data.data[i].path, size: data.data[i].size});
      }
    }
    return elements
  }
  catch(e) {
    return errors.NotFound;
  }
}

module.exports = {
    getRepos: async(req, res) => {
        const data = await octokit.request("GET https://api.github.com/orgs/CESI-FISA-A4/repos");
        let elements = [];
        for(let i in data.data) {
          elements.push({id: data.data[i].id, name: data.data[i].name});
        }
        return elements;
    },
    getBranches: async(req, res) => {
      const { repo } = req.params;
      try {
        const data = await octokit.request("GET https://api.github.com/repos/CESI-FISA-A4/{repo}/branches", {repo: repo});
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
      return getAllFiles(repo, branch, '');
    },
    getFile: async(req, res) => {
      const { repo, branch } = req.params;
      const path = req.params['*'];
      if(!path.endsWith('.js') && !path.endsWith('.css')) return errors.NotFound;
      try {
        const data = await octokit.request("GET https://api.github.com/repos/CESI-FISA-A4/{repo}/contents{folder}?ref={branch}", {repo: repo, branch: branch, folder: path});
        // https://raw.githubusercontent.com/CESI-FISA-A4/Elective-git/feature%2Fbase/index.js 
        // fonctionne aussi mais rC)cup juste le fichier
        let content = Buffer.from(data.data.content, 'base64').toString('ascii');
        return {name: data.data.name, path: data.data.path, size: data.data.size, content: content};  
      }
      catch(e) {
        return errors.NotFound;
      }
    },
    commit: async(req, res) => {
      //todo
    },
    pullRequest: async(req, res) => {
      //todo ?
    },
    download: async(req, res) => {
      //todo
    },
    
}