import * as core from '@actions/core'
import * as github from '@actions/github'

function onboard(user) {
    core.error("Onboard has not been implemented yet.")
    core.setFailed("Onboard has not been implemented yet.")
}

function offboard(user) {
    core.info(`offboarding: ${user}`)
}

async function run() {
    try {

        const payload = github.context.payload
        const client_payload = payload.client_payload
        const action = payload.action
        const users = client_payload.users

        //const action = core.getInput('action')
        //const targetUsers = core.getInput('targetUsers')

        //core.info(`payload: ${JSON.stringify(payload)}`)
        //core.info(`client_payload: ${JSON.stringify(client_payload)}`)
        //core.info(`action: ${JSON.stringify(payload.action)}`)
        //core.info(`client_payload: ${core.getInput('client_payload')}`)
        core.info(`Setting up to ${action}`)
        switch (action) {
            case "onboard":
                users.forEach(onboard)
                break
            case "offboard":
                users.forEach(offboard)
                break
            default:
                core.error(`Unsupported action: ${action}`)
                core.setFailed(`Unsupported action: ${action}`)
        }


    } catch (error) {
        core.setFailed(error.message)
    }
}

run()