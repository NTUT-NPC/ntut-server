/**
 * BEFORE EDITING THIS FILE, PLEASE READ http://danger.systems/js/usage/culture.html
 *
 * This file is split into two parts:
 * 1) Rules that require or suggest changes to the code, the PR, etc.
 * 2) Rules that celebrate achievements
 */
import { danger, fail, message, warn } from 'danger'

const includes = require('lodash.includes')

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

// Warns if there are changes to package.json, and tags the team.
const packageChanged = includes(danger.git.modified_files, 'package.json')
if (packageChanged) {
	const title = ':lock: package.json'
	const idea =
		'Changes were made to package.json. ' +
		'This will require a manual import by a NPC member.'
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

// 10個以上のファイルを編集している場合、警告を出す
if (danger.github.pr.changed_files > 10) {
	warn(
		'This PR changes too many files. You should divide this PR into smaller PRs.'
	)
}

if (danger.github.body < 5) {
	fail(`PlZ enter the description or goal for this PR`)
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
