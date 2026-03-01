package blindfold

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"os"
)

//go:embed policies.json
var embeddedPolicies []byte

type policyDefinition struct {
	Entities  []string `json:"entities"`
	Threshold *float64 `json:"threshold,omitempty"`
}

type policyResolution struct {
	entities  []string
	threshold *float64
}

func loadPolicies(policiesFile string) map[string]policyDefinition {
	policies := make(map[string]policyDefinition)

	// Load bundled policies
	if len(embeddedPolicies) > 0 {
		var bundled map[string]policyDefinition
		if err := json.Unmarshal(embeddedPolicies, &bundled); err == nil {
			for k, v := range bundled {
				policies[k] = v
			}
		} else {
			fmt.Fprintf(os.Stderr, "Warning: Failed to parse bundled policies: %v\n", err)
		}
	}

	// Merge custom policies file
	if policiesFile != "" {
		data, err := os.ReadFile(policiesFile)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Warning: Failed to read custom policies from '%s': %v\n", policiesFile, err)
			return policies
		}
		var custom map[string]policyDefinition
		if err := json.Unmarshal(data, &custom); err == nil {
			for k, v := range custom {
				policies[k] = v
			}
		} else {
			fmt.Fprintf(os.Stderr, "Warning: Failed to parse custom policies from '%s': %v\n", policiesFile, err)
		}
	}

	return policies
}

func resolvePolicy(policies map[string]policyDefinition, defaultPolicy, callPolicy string, callEntities []string) policyResolution {
	// Priority: explicit entities > named policy > detect all
	if len(callEntities) > 0 {
		return policyResolution{entities: callEntities}
	}
	policyName := callPolicy
	if policyName == "" {
		policyName = defaultPolicy
	}
	if policyName != "" {
		if def, ok := policies[policyName]; ok {
			return policyResolution{entities: def.Entities, threshold: def.Threshold}
		}
		fmt.Fprintf(os.Stderr, "Warning: Unknown policy '%s', detecting all entities\n", policyName)
	}
	return policyResolution{}
}
