#!/usr/bin/env python3
"""
CORTEX Catch-22 Deadlock Linter (C5-REAL)
Audits Agentic Architectures for Circular Dependencies and Self-Referential Deadlocks.
Exposes conditions where resource acquisition requires the resource being freed.
"""

import json


def detect_cycles(graph):
    visited = set()
    path = set()

    def visit(node):
        if node in path:
            return True
        if node in visited:
            return False
        path.add(node)
        for neighbor in graph.get(node, []):
            if visit(neighbor):
                return True
        path.remove(node)
        visited.add(node)
        return False

    for node in graph:
        if visit(node):
            return True
    return False


def audit_catch22(system_config: dict) -> dict:
    dependencies = system_config.get("dependencies", {})
    resources = system_config.get("resources", {})

    # 1. CIRCULAR RESOLUTION GAP (Catch-22)
    has_circular_dep = detect_cycles(dependencies)

    # 2. CONTEXT-CLEAR DEADLOCK
    # Can we clear memory?
    # Catch-22: Agent needs to run clear_memory() tool, but tool call itself requires 1024 tokens of free memory.
    memory_limit = resources.get("memory_limit", 4096)
    current_usage = resources.get("current_usage", 4000)
    tool_invocation_cost = resources.get("tool_invocation_cost", 200)

    context_deadlock = False
    if (memory_limit - current_usage) < tool_invocation_cost:
        context_deadlock = True

    # 3. GHOST ROUTER RESOLUTION
    # Route only responds when sender is unregistered
    router_active = system_config.get("router_active", True)
    requires_absence = system_config.get("requires_absence", False)

    ghost_router = router_active and requires_absence

    # Score calculation
    deadlock_score = 0.0
    if has_circular_dep:
        deadlock_score += 40.0
    if context_deadlock:
        deadlock_score += 40.0
    if ghost_router:
        deadlock_score += 20.0

    verdict = "VERIFIED RESILIENT ARCHITECTURE - ZERO CYCLES"
    if deadlock_score >= 80.0:
        verdict = "CRITICAL FAIL - Catch-22 Circular Deadlock Active"
    elif deadlock_score >= 40.0:
        verdict = "WARNING - High Circular Contamination Detected"

    return {
        "metrics": {
            "has_circular_dependency": has_circular_dep,
            "context_clear_deadlock": context_deadlock,
            "ghost_router_active": ghost_router,
        },
        "deadlock_severity_pct": round(deadlock_score, 2),
        "verdict": verdict,
    }


if __name__ == "__main__":
    # Test cases
    test_systems = {
        "Resilient_Vesicular_Runtime": {
            "dependencies": {
                "AgentBrain": ["MCPRouter"],
                "MCPRouter": ["LocalDB"],
                "LocalDB": [],
            },
            "resources": {
                "memory_limit": 8192,
                "current_usage": 2048,
                "tool_invocation_cost": 128,
            },
            "router_active": True,
            "requires_absence": False,
        },
        "Catch-22_Monolithic_Wrapper": {
            "dependencies": {
                "AgentBrain": ["AuthService"],
                "AuthService": ["TokenCache"],
                "TokenCache": ["AgentBrain"],  # Circular loop!
            },
            "resources": {
                "memory_limit": 4096,
                "current_usage": 4050,
                "tool_invocation_cost": 100,  # Context full, cannot call clear_context()
            },
            "router_active": True,
            "requires_absence": True,  # Major Major Major Major routing logic
        },
    }

    for name, config in test_systems.items():
        result = audit_catch22(config)
        print(f"\n=== Audit: {name} ===")
        print(f"Deadlock Severity: {result['deadlock_severity_pct']}%")
        print(f"Metrics: {json.dumps(result['metrics'])}")
        print(f"Verdict: {result['verdict']}")
