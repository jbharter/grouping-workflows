import * as core from '@actions/core'
import * as github from '@actions/github'
import {readFile, writeFileSync} from 'fs';
import {Buffer} from 'buffer';
// import * as HCL from 'js-hcl-parser';
import * as os from 'os';

function readObject(filename){
    return new Promise((resolve, reject) => {
        readFile(filename, (err,data) => {
            if (err) {
                reject(err);
            } else {
                let stringData = data.toString();
                if (filename.endsWith(".json")) {
                    resolve(JSON.parse(stringData));
                }
                // } else if (filename.endsWith(".tfvars") || filename.endsWith(".hcl")){
                //   // do hcl parse, weirdness with module import
                //     let thing = HCL.default.parse(stringData);
                //     resolve(JSON.parse(thing))
                // }
                reject("unknown file type")
            }
        })
    })
}

const exceptionGroupFile = "exception-groups/groups.json";
const squadsFile = "squads.json";
const platoonsFile = "platoons.json";

// function onboard(user) {
//     core.error("Onboard has not been implemented yet.")
//     core.setFailed("Onboard has not been implemented yet.")
// }

function offboard(user) {
    let action = "offboard";
    core.info(`${action}-ing: ${user}`)

    // TODO: check exception groups
    readObject(exceptionGroupFile)
        .then(data => {
            // do stuff
            /* not like this
            let write = false;
            Object.entries(data["groups"][0])
                .forEach(([groupname,groupval]) => {
                    let group = groupval[0]
                    let members = group["members"][0];
                    if (Object.keys(members).includes(user)) {
                        console.log(`User: "${user} found in members of exception group: "${groupname}"`)
                        data["groups"][0][groupname][0]["members"][0] = Object.fromEntries(Object.entries(members).filter(([locuser, role]) => locuser !== user));
                        write = true
                    }
                })
            if (write) {
                console.log(`writing new ${exceptionGroupFile} to ${action} user: ${user}`)
                // Need this to be json first before hcl-conversion
                let stringData = JSON.stringify(data, null, 2);
                // Convert back to hcl
                let hclData = HCL.default.stringify(stringData);
                writeFileSync(exceptionGroupFile,new Uint8Array(Buffer.from(stringData)));
            }
            */
            let write = false;
            Object.entries(data["groups"]).forEach(([group_name,val],squadIndex) => {
                if (Object.keys(val["members"]).includes(user)) {
                    console.log(`User: "${user} found in members of exception group: "${group_name}"`)
                    data["groups"][group_name]["members"] = Object.fromEntries(Object.entries(val["members"]).filter(([locuser, role]) => locuser !== user));
                    write = true
                }
            })
            if (write) {
                console.log(`writing new ${exceptionGroupFile} to ${action} user: ${user}`)
                writeFileSync(exceptionGroupFile,new Uint8Array(Buffer.from(JSON.stringify(data, null, 2))));
            }
        })
        .catch(err => console.error(err));



    // TODO: check platoons file, consider a method to replace a platoon/squad lead?
    // readObject(platoonsFile)
    //     .then(data => {
    //         //console.dir(data);
    //         // TODO: offboard in platoons.json
    //     })
    //     .catch(err => console.error(err));
    // check squads file
    readObject(squadsFile)
        .then(data => {
            // Offboard in squads.json
            let write = false;
            data["squads"].forEach((squad,squadIndex) => {
                squad["team"].forEach((team,teamIndex) => {
                    if (team["associates"].includes(user)) {
                        console.log(`User: "${user} found in associates of squad: "${squad.id}", location: ${team.location}`)
                        data["squads"][squadIndex]["team"][teamIndex]["associates"] = team["associates"].filter(associate => associate !== user);
                        write = true;
                    }
                    if (team["members"].includes(user)) {
                        console.log(`User: "${user} found in members of squad: "${squad.id}", location: ${team.location}`)
                        data["squads"][squadIndex]["team"][teamIndex]["members"] = team["members"].filter(associate => associate !== user);
                        write = true;
                    }
                })
            })
            if (write) {
                console.log(`writing new ${squadsFile} to ${action} user: ${user}`)
                writeFileSync(squadsFile,new Uint8Array(Buffer.from(JSON.stringify(data, null, 2))));
            }
        })
        .catch(err => console.error(err));
    console.log(`end run for user: ${user}`)
}

async function run() {
    try {

        const payload = github.context.payload
        const client_payload = payload.client_payload
        const action = payload.action
        const users = client_payload.users

        core.info(`Setting up to ${action}`)
        switch (action) {
            // case "onboard":
            //     users.forEach(onboard)
            //     break
            case "offboard":
                core.setOutput("action", action)
                core.setOutput("users", users)
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

async function test(testData) {
    let action = "offboard";
    let users = testData.client_payload.users

    console.log("::set-output name=foo::bar")
    core.info("::set-output name=core::bar")

    switch (action) {
        // case "onboard":
        //     users.filter(s => s !== "").forEach(onboard)
        //     break
        case "offboard":
            users.filter(s => s !== "").forEach(offboard)

            break
        default:
            core.error(`Unsupported action: ${action}`)
            core.setFailed(`Unsupported action: ${action}`)
    }
}

if (os.platform() === "darwin") {
    test({
        "client_payload": {
            "users": [
                "jharte",
                "",
                "abcdefg"
            ]
        }
    })
} else {
    await run()
}

