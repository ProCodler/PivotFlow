import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Import the generated types and factory
import { 
  _SERVICE,
  idlFactory,
  canisterId as defaultCanisterId 
} from '../../../declarations/PivotFlow_backend';

// Types for our application
export interface CanisterService extends _SERVICE {}

export class CanisterClient {
  private static instance: CanisterClient;
  private actor: CanisterService | null = null;
  private agent: HttpAgent | null = null;

  private constructor() {}

  public static getInstance(): CanisterClient {
    if (!CanisterClient.instance) {
      CanisterClient.instance = new CanisterClient();
    }
    return CanisterClient.instance;
  }

  public async init(identity?: Identity): Promise<CanisterService> {
    const canisterId = import.meta.env.VITE_CANISTER_ID || defaultCanisterId;
    const host = import.meta.env.VITE_HOST || 'https://ic0.app';

    this.agent = new HttpAgent({
      host,
      identity,
    });

    // Fetch root key for certificate validation during development
    if (import.meta.env.MODE === 'development') {
      try {
        await this.agent.fetchRootKey();
      } catch (err) {
        console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
        console.error(err);
      }
    }

    this.actor = Actor.createActor<CanisterService>(idlFactory, {
      agent: this.agent,
      canisterId,
    });

    return this.actor;
  }

  public getActor(): CanisterService | null {
    return this.actor;
  }

  public getAgent(): HttpAgent | null {
    return this.agent;
  }

  // User management
  public async createUser(username: string) {
    if (!this.actor) throw new Error('Actor not initialized');
    return await this.actor.createUser(username);
  }

  public async getUser() {
    if (!this.actor) throw new Error('Actor not initialized');
    return await this.actor.getUser();
  }

  // NFT Alerts
  public async getUserNFTAlerts() {
    if (!this.actor) throw new Error('Actor not initialized');
    return await this.actor.getUserNFTAlerts();
  }

  public async createNFTAlert(
    collectionSlug: string,
    collectionName: string,
    alertType: { drop_below: null } | { rise_above: null } | { any_change: null },
    targetPrice: number,
    currency: string
  ) {
    if (!this.actor) throw new Error('Actor not initialized');
    return await this.actor.createNFTAlert(
      collectionSlug,
      collectionName,
      alertType,
      targetPrice,
      currency
    );
  }

  // Cycles Alerts
  public async getUserCyclesAlerts() {
    if (!this.actor) throw new Error('Actor not initialized');
    return await this.actor.getUserCyclesAlerts();
  }

  public async createCyclesAlert(
    operationType: string,
    maxCyclesCost: number,
    priorityTier: { fast: null } | { standard: null } | { slow: null }
  ) {
    if (!this.actor) throw new Error('Actor not initialized');
    return await this.actor.createCyclesAlert(operationType, BigInt(maxCyclesCost), priorityTier);
  }

  // Network Fees
  public async getNetworkFees() {
    if (!this.actor) throw new Error('Actor not initialized');
    return await this.actor.getNetworkFees();
  }

  public async updateNetworkFee(
    operationType: string,
    fast: { cycles: number; usd: number },
    standard: { cycles: number; usd: number },
    slow: { cycles: number; usd: number }
  ) {
    if (!this.actor) throw new Error('Actor not initialized');
    return await this.actor.updateNetworkFee(operationType, fast, standard, slow);
  }
}

export const canisterClient = CanisterClient.getInstance();