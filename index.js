import * as core from '@actions/core'
import * as github from '@actions/github'

async function run() {
    try {
        const action = core.getInput('action')
        const targetUsers = core.getInput('targetUsers')

        core.info(`Obtained action: ${action}`)
        core.info(`Obtained targets: ${targetUsers}`)

    } catch (error) {
        core.setFailed(error.message)
    }
}

run()