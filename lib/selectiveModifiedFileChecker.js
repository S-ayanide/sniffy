function selectiveModifiedFileChecker(res, context) {
    const modifiedFiles = [];

    res.data.forEach(function(file){
      //check if certain files are modified
      if(file.filename === 'package.json')
        modifiedFiles.push(file.filename)
      if(file.filename === '.eslintignore')
        modifiedFiles.push(file.filename)
      if(file.filename === '.demo')
        modifiedFiles.push(file.filename)  
    })

    let modifiedComment = '';

    if(modifiedFiles.length > 0){
        // create a comment saying package.json has been modified
        if(modifiedFiles.length === 1){
            modifiedComment = context.issue({
                body: `${modifiedFiles[0]} has been modified`,
            });
        } else if(modifiedFiles.length === 2){
            modifiedComment = context.issue({
                body: `${modifiedFiles[0]} and ${modifiedFiles[1]} has been modified`,
            });
        } else if(modifiedFiles.length > 2){
            let modFiles = '';
            modifiedFiles.forEach((file,i) => {
            if(i != modifiedFiles.length - 1) { 
                modFiles = modFiles + file + ', ';
            } else { 
                modFiles = modFiles + 'and ' + file;
            }
            })

            modifiedComment = context.issue({
                body: `${modFiles} have been modified`,
            });
        }

        // publish it
        return context.github.issues.createComment(modifiedComment);
    }
}

module.exports = {
    selectiveModifiedFileChecker
}