const AddLabel = require('./addLabels');
const Config = require('../config/config');

function issueOpened(app) {

    app.on(['issues.opened','issues.edited','issues.reopened'], async context => {

        const { body } = context.payload.issue;
        const labelToAdd = 'area/litmus-portal';

        // create a comment
        if(body.toLowerCase().includes('litmus-portal') || body.toLowerCase().includes('litmus portal')){
            AddLabel.addLabel(context, labelToAdd, Config.colors[labelToAdd])
        }
    })
}

module.exports = {
    issueOpened
}