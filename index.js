const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
const generated = require('@noqcks/generated');
const PR = require('./lib/pull_request');
const Config = require('./config/config');
const Issue = require('./lib/issues');

async function addLabel (context, name, color) {
  const params = Object.assign({}, context.issue(), {labels: [name]})

  await ensureLabelExists(context, name, color)
  await context.github.issues.addLabels(params)
}

async function ensureLabelExists (context, name, color) {
  try {
    return await context.github.issues.getLabel(context.repo({
      name: name
    }))
  } catch (e) {
    return context.github.issues.createLabel(context.repo({
      name: name,
      color: color
    }))
  }
}

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
      await addLabel(context, 'area/litmus-portal', Config.colors[labelToAdd])
      await addLabel(context, labelToAdd, Config.colors[labelToAdd])
    }
    
    // assign GitHub label
    return await addLabel(context, labelToAdd, Config.colors[labelToAdd])
  })

  // Issue Creation
  app.on('issues.opened', async context => {

    const { body } = context.payload.issue;

    // create a comment
    const comment = context.issue({
      body: body.includes("Thanks") ? "You are Welcome!" : "Thanks for creating an issue!",
    });
    // publish it
    return context.github.issues.createComment(comment);
  })

  // we don't care about marketplace events
  app.on('marketplace_purchase', async context => {
    return
  })
}