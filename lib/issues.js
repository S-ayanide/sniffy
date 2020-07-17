function issueOpened(context) {

    console.log('Inside App On')
    const { body } = context.payload.issue;

    // create a comment
    const comment = context.issue({
    body: body.includes("Thanks") ? "You are Welcome!" : "Thanks for creating the issue!",
    });
    // publish it
    return context.github.issues.createComment(comment);
}

module.exports = {
    issueOpened
}