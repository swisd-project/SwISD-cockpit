/**
 * 1. Relative path: cockpit/src/app.d.ts
 * 2. Description: Global type declarations for SvelteKit app locals.
 * 3. Expects: Core service types from $core barrels and BFF server singletons.
 * 4. Provides: Type-safe access to backend services via locals.
 * 5. SPDX-License-Identifier: MPL-2.0
 * 6. Copyright (c) 2026 Homahuki GmbH
 */

import type {
	ObservabilitySource,
	ObservabilityEventBus
} from 'swisd-core/observability/index.js';
import type { TrustRegistry } from 'swisd-network/peer/index.js';
import type { TrustLedger } from 'swisd-network/peer/trustLedger.js';
import type {
	ModelRegistry,
	ApprovalGate,
	ModelDownloader,
	ModelManager,
	IntentRegistry,
	ModelSigner,
	DownloadProgress
} from 'swisd-core/models/index.js';
import type { Keystone, BondAnchor } from 'swisd-network/ownership/index.js';
import type { CredentialManager } from 'swisd-core/config/credentials.js';
import type { ConductorIdentity } from '#lib/server/conductorIdentity.js';
import type { SessionLock } from '#lib/server/sessionLock.js';

declare global {
	namespace App {
		interface Locals {
			coreSource: ObservabilitySource;
			eventBus: ObservabilityEventBus;
			trustRegistry: TrustRegistry;
			trustLedger: TrustLedger;
			modelRegistry: ModelRegistry;
			approvalGate: ApprovalGate;
			modelDownloader: ModelDownloader;
			modelManager: ModelManager;
			intentRegistry: IntentRegistry;
			modelSigner: ModelSigner;
			downloadProgress: Record<string, DownloadProgress>;

			// Sovereignty Layer
			keystone: Keystone;
			bondAnchor: BondAnchor;
			conductorIdentity: ConductorIdentity;
			sessionLock: SessionLock;

			// Credentials & Env
			credentialManager: CredentialManager;
			peerId: string;
			deliveryRoot: string;
		}
	}
}

export {};
