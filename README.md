# Grouping Workflows
A github action to run automations on your terraorg style squads.

## Example: use API calls to open PRs to offboard users
`.github/workflows/workflow.yaml`
```yaml
name: API triggered grouping workflow
on:
  repository_dispatch:
    types: ["offboard"]

jobs:
  onboarding_workflow:
    if: ${{ github.event.action == 'onboard' }}
    runs-on: ubuntu-latest
    steps:
      - name: "Get repo"
        uses: actions/checkout@v3
      - name: Run the flow
        id: offboard_flow
        uses: jbharter/grouping-workflows@v0.0.1
  offboarding_workflow:
    if: ${{ github.event.action == 'offboard' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run the flow
        id: offboard_flow
        uses: jbharter/grouping-workflows@v0.0.1
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v4
        with:
          branch: automation/${{github.event.action}}/${{join(fromJSON(steps.offboard_flow.outputs.users),'-')}}
          commit-message: |
            [Automation] ${{github.event.action}} users [${{join(fromJSON(steps.offboard_flow.outputs.users),',')}}]
          title: |
            [Automation] ${{github.event.action}} users
          body: |
            Automated pull request triggered by API call
            Actor: **@${{github.actor}}**
            Action: **${{github.event.action}}** 
            Users: [${{join(fromJSON(steps.offboard_flow.outputs.users),',')}}]
```