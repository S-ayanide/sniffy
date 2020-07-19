const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
const generated = require('@noqcks/generated');
const PR = require('./lib/pull_request');
const Config = require('./config/config');
const Issue = require('./lib/issues');
const selectiveFileChecker = require('./lib/selectiveModifiedFileChecker');
const AddLabel = require('./lib/addLabels');

/**
 * This is the main event loop that runs when a revelent Pull Request
 * action is triggered.
 */
module.exports = app => {

  app.on([
    'pull_request.opened',
    'pull_request.reopened',
    'pull_request.synchronize',
    'pull_request.edited'], async context => {

    const pullRequest = context.payload.pull_request;
    const {title} = pullRequest;

    const {owner: {login: owner}, name: repo} = pullRequest.base.repo;
    const {number} = pullRequest;
    let {additions, deletions} = pullRequest;

    // get list of custom generated files as defined in .gitattributes
    const customGeneratedFiles = await PR.getCustomGeneratedFiles(context, owner, repo)

    // list of files modified in the pull request
    const res = await context.github.pullRequests.listFiles({owner, repo, number})

    // if files are generated, remove them from the additions/deletions total
    res.data.forEach(function(item) {
      var g = new generated(item.filename, item.patch)
      if (PR.globMatch(item.filename, customGeneratedFiles) || g.isGenerated()) {
        additions -= item.additions
        deletions -= item.deletions
      }
    })

    // Selective File Checker
    selectiveFileChecker.selectiveModifiedFileChecker(res, context);

    // calculate GitHub label
    var labelToAdd = PR.sizeLabel(additions + deletions)
    console.log(labelToAdd)

    // remove existing size/<size> label if it exists and is not labelToAdd
    pullRequest.labels.forEach(function(prLabel) {
      if(Object.values(Config.label).includes(prLabel.name)) {
        if (prLabel.name != labelToAdd) {
          context.github.issues.removeLabel(context.issue({
            name: prLabel.name
          }))
        }
      }
    })

    if(title.includes('litmus-portal')) {
      await AddLabel.addLabel(context, 'area/litmus-portal', Config.colors['area/litmus-portal'])
      await AddLabel.addLabel(context, labelToAdd, Config.colors[labelToAdd])
    }

    const doNotMerge = 'DO NOT MERGE'

    if(labelToAdd === 'size/XXL'){
      await AddLabel.addLabel(context, doNotMerge, Config.colors[doNotMerge]);
    }
    
    // assign GitHub label
    return await AddLabel.addLabel(context, labelToAdd, Config.colors[labelToAdd])
  })

  // Litmus on Issues
  Issue.issueOpened(app)

  // we don't care about marketplace events
  app.on('marketplace_purchase', async context => {
    return
  })
}