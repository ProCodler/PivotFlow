export const idlFactory = ({ IDL }) => {
  const PriorityTier = IDL.Variant({
    'fast' : IDL.Null,
    'slow' : IDL.Null,
    'standard' : IDL.Null,
  });
  const Principal = IDL.Principal;
  const Time = IDL.Int;
  const GasAlert = IDL.Record({
    'id' : IDL.Text,
    'userId' : Principal,
    'priorityTier' : PriorityTier,
    'createdAt' : Time,
    'isActive' : IDL.Bool,
    'blockchain' : IDL.Text,
    'maxGwei' : IDL.Nat,
  });
  const AlertType = IDL.Variant({
    'rise_above' : IDL.Null,
    'any_change' : IDL.Null,
    'drop_below' : IDL.Null,
  });
  const NFTAlert = IDL.Record({
    'id' : IDL.Text,
    'alertType' : AlertType,
    'currentFloorPrice' : IDL.Float64,
    'userId' : Principal,
    'createdAt' : Time,
    'percentageChange' : IDL.Opt(IDL.Float64),
    'targetPrice' : IDL.Float64,
    'isActive' : IDL.Bool,
    'currency' : IDL.Text,
    'lastChecked' : Time,
    'gasLimit' : IDL.Opt(IDL.Nat),
    'collectionName' : IDL.Text,
    'collectionSlug' : IDL.Text,
  });
  const User = IDL.Record({
    'principal' : Principal,
    'createdAt' : Time,
    'isOperator' : IDL.Bool,
    'lastLogin' : Time,
  });
  const FeeInfo = IDL.Record({ 'usd' : IDL.Float64, 'gwei' : IDL.Float64 });
  const NetworkFee = IDL.Record({
    'fast' : FeeInfo,
    'icon' : IDL.Text,
    'slow' : FeeInfo,
    'lastUpdated' : Time,
    'blockchain' : IDL.Text,
    'standard' : FeeInfo,
  });
  return IDL.Service({
    'createGasAlert' : IDL.Func(
        [IDL.Text, IDL.Nat, PriorityTier],
        [GasAlert],
        [],
      ),
    'createNFTAlert' : IDL.Func(
        [IDL.Text, IDL.Text, AlertType, IDL.Float64, IDL.Text],
        [NFTAlert],
        [],
      ),
    'createUser' : IDL.Func([IDL.Text], [User], []),
    'getNetworkFees' : IDL.Func([], [IDL.Vec(NetworkFee)], ['query']),
    'getUser' : IDL.Func([], [IDL.Opt(User)], []),
    'getUserGasAlerts' : IDL.Func([], [IDL.Vec(GasAlert)], []),
    'getUserNFTAlerts' : IDL.Func([], [IDL.Vec(NFTAlert)], []),
    'updateNetworkFee' : IDL.Func(
        [IDL.Text, FeeInfo, FeeInfo, FeeInfo],
        [NetworkFee],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
