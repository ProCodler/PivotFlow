import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AlertType = { 'rise_above' : null } |
  { 'any_change' : null } |
  { 'drop_below' : null };
export interface FeeInfo { 'usd' : number, 'gwei' : number }
export interface GasAlert {
  'id' : string,
  'userId' : Principal,
  'priorityTier' : PriorityTier,
  'createdAt' : Time,
  'isActive' : boolean,
  'blockchain' : string,
  'maxGwei' : bigint,
}
export interface NFTAlert {
  'id' : string,
  'alertType' : AlertType,
  'currentFloorPrice' : number,
  'userId' : Principal,
  'createdAt' : Time,
  'percentageChange' : [] | [number],
  'targetPrice' : number,
  'isActive' : boolean,
  'currency' : string,
  'lastChecked' : Time,
  'gasLimit' : [] | [bigint],
  'collectionName' : string,
  'collectionSlug' : string,
}
export interface NetworkFee {
  'fast' : FeeInfo,
  'icon' : string,
  'slow' : FeeInfo,
  'lastUpdated' : Time,
  'blockchain' : string,
  'standard' : FeeInfo,
}
export type Principal = Principal;
export type PriorityTier = { 'fast' : null } |
  { 'slow' : null } |
  { 'standard' : null };
export type Time = bigint;
export interface User {
  'principal' : Principal,
  'createdAt' : Time,
  'isOperator' : boolean,
  'lastLogin' : Time,
}
export interface _SERVICE {
  'createGasAlert' : ActorMethod<[string, bigint, PriorityTier], GasAlert>,
  'createNFTAlert' : ActorMethod<
    [string, string, AlertType, number, string],
    NFTAlert
  >,
  'createUser' : ActorMethod<[string], User>,
  'getNetworkFees' : ActorMethod<[], Array<NetworkFee>>,
  'getUser' : ActorMethod<[], [] | [User]>,
  'getUserGasAlerts' : ActorMethod<[], Array<GasAlert>>,
  'getUserNFTAlerts' : ActorMethod<[], Array<NFTAlert>>,
  'updateNetworkFee' : ActorMethod<
    [string, FeeInfo, FeeInfo, FeeInfo],
    NetworkFee
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
