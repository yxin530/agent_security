if policy.requires_approval("deploy"):
    approval = get_human_approval(action="deploy")
    if approval.granted:
        kubectl("apply", manifest=manifest)
