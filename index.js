import * as core from '@actions/core'
import * as github from '@actions/github'

async function run() {
    try {
        core.info(`context: ${JSON.stringify(github.context)}`)

        const action = core.getInput('action')
        const targetUsers = core.getInput('targetUsers')

        core.info(`Obtained action: ${action}`)
        core.info(`Obtained targets: ${targetUsers}`)
        core.info(`event_type: ${core.getInput('event_type')}`)
        core.info(`client_payload: ${core.getInput('client_payload')}`)


    } catch (error) {
        core.setFailed(error.message)
    }
}

run()