module.exports = async ({ github, context }) => {
  if (context.payload.action !== 'opened') {
    console.log('No PR was opened, skipping')
    return
  }

  const creator = context.payload.sender.login
  const { owner, repo, number } = context.issue
  const opts = github.rest.issues.listForRepo.endpoint.merge({
    owner,
    repo,
    creator,
    state: 'all'
  })
  const issues = await github.paginate(opts)

  for (const issue of issues) {
    console.log({ issue, pr: issue.pull_request })
    if (issue.number === context.issue.number) {
      continue
    }

    if (issue.pull_request) {
      return // Creator is already a contributor.
    }
  }

  console.log('getting here')

  await github.rest.issues.createComment({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
    body: `**Welcome**, new contributor!

      Please make sure you're read our [contributing guide](CONTRIBUTING.md) and we look forward to reviewing your Pull request shortly ✨`
  })
}