/**
 * BEFORE EDITING THIS FILE, PLEASE READ http://danger.systems/js/usage/culture.html
 *
 * This file is split into two parts:
 * 1) Rules that require or suggest changes to the code, the PR, etc.
 * 2) Rules that celebrate achievements
 */
import { danger, fail, message, warn } from 'danger'

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* ~ Required or suggested changes                                          ~ */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Rule: Exactly 1 reviewer is required.
 * Reason: No reviewer tends to leave a PR in a state where nobody is
 *         responsible. Similarly, more than 1 reviewer doesn't clearly state
 *         who is responsible for the review.
 */
const reviewersCount = danger.github.requested_reviewers.users.length
if (reviewersCount === 0) {
	fail(`🕵 Whoops, I don't see any reviewers. Remember to add one.`)
} else if (reviewersCount > 1) {
	warn(
		`It's great to have ${reviewersCount} reviewers. Remember though that more than 1 reviewer may lead to uncertainty as to who is responsible for the review.`
	)
}

/**
 * Rule: Ensure the PR title contains a Jira ticket key.
 * Reason: When looking at the list of PRs, seeing the Jira ticket in the PR
 *         title makes it very efficient to know what to look at.
 */
const prTitle = danger.github.pr.title
const ticketPattern = /CL-\d+/g
if (!ticketPattern.test(prTitle)) {
	fail(
		`🔍 I can't find the Jira ticket number in the PR title. Your team members are going to thank you when they look at the list of PRs on Github and see at a glance which PR belongs to which Jira ticket 🙏.`
	)
}

// Fails if the description is too short.
if (!danger.github.pr.body || danger.github.pr.body.length < 10) {
	fail(':grey_question: This pull request needs a description.')
}

// Warns if there are changes to package.json, and tags the team.
const packageChanged = includes(danger.git.modified_files, 'package.json')
if (packageChanged) {
	const title = ':lock: package.json'
	const idea =
		'Changes were made to package.json. ' +
		'This will require a manual import by a Facebook employee.'
	warn(`${title} - <i>${idea}</i>`)
}

// Tags big PRs
var bigPRThreshold = 600
if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
	const title = ':exclamation: Big PR'
	const idea = `This PR is extremely unlikely to get reviewed because it touches ${danger
		.github.pr.additions + danger.github.pr.deletions} lines.`
	warn(`${title} - <i>${idea}</i>`)
} else if (
	danger.git.modified_files +
		danger.git.added_files +
		danger.git.deleted_files >
	bigPRThreshold
) {
	const title = ':exclamation: Big PR'
	const idea = `This PR is extremely unlikely to get reviewed because it touches ${danger
		.git.modified_files +
		danger.git.added_files +
		danger.git.deleted_files} files.`
	warn(`${title} - <i>${idea}</i>`)
}

const modifiedMD = danger.git.modified_files.join('- ')
message('Changed Files in this PR: \n - ' + modifiedMD)

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* ~ Achievemnts                                                            ~ */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Rule: Celebrate PRs that remove more code than they add.
 * Reason: Less is more!
 */
if (danger.github.pr.deletions > danger.github.pr.additions) {
	message(
		`👏 Great job! I see more lines deleted than added. Thanks for keeping us lean!`
	)
}
