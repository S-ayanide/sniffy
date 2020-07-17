const minimatch = require("minimatch")
const Config = require ('../config/config')

/**
 * sizeLabel will return a string label that can be assigned to a
 * GitHub Pull Request. The label is determined by the lines of code
 * in the Pull Request.
 * @param lineCount The number of lines in the Pull Request.
 */
function sizeLabel (lineCount) {
    console.log(lineCount)
    if (lineCount < Config.sizes.S) {
      return Config.label.XS
    } else if (lineCount < Config.sizes.M) {
      return Config.label.S
    } else if (lineCount < Config.sizes.L) {
      return Config.label.M
    } else if (lineCount < Config.sizes.Xl) {
      return Config.label.L
    } else if (lineCount < Config.sizes.Xxl) {
      return Config.label.XL
    }
  
    return Config.label.XXL
  }
  
  /**
   * getCustomGeneratedFiles will grab a list of file globs that determine
   * generated files from the repos .gitattributes.
   * @param context The context of the PullRequest.
   * @param owner The owner of the repository.
   * @param repo The repository where the .gitattributes file is located.
   */
  async function getCustomGeneratedFiles (context, owner, repo) {
    let files = []
    const path = ".gitattributes"
  
    let response;
    try {
      response = await context.github.repos.getContents({owner, repo, path})
    } catch (e) {
      return files
    }
  
    const buff = new Buffer(response.data.content, 'base64')
    const lines = buff.toString('ascii').split("\n")
  
    lines.forEach(function(item) {
      if (item.includes("linguist-generated=true")) {
        files.push(item.split(" ")[0])
      }
    })
    return files
  }
  
/**
 * globMatch compares file name with file blobs to
 * see if a file is matched by a file glob expression.
 * @param file The file to compare.
 * @param globs A list of file globs to match the file.
 */
function globMatch (file, globs) {
    for (i=0; i < globs.length; i++) {
        if (minimatch(file, globs[i])) {
            return true
            break;
        }   
    }
    return false
}

module.exports = {
    sizeLabel,
    getCustomGeneratedFiles,
    globMatch
}